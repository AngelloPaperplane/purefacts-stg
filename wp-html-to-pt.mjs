// ─────────────────────────────────────────────────────────────────────────────
// wp-html-to-pt.mjs
//
// Shared HTML → Sanity Portable Text converter used by both migration scripts.
// Processes nodes in strict document order using a cursor-based approach.
// ─────────────────────────────────────────────────────────────────────────────

export function randomKey() { return Math.random().toString(36).slice(2, 10) }

export function decodeEntities(str = '') {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '-').replace(/&#8212;/g, '-')
    .replace(/&#8216;/g, "'").replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '...').replace(/&#038;/g, '&')
    .replace(/&#\d+;/g, m => {
      const code = parseInt(m.slice(2, -1), 10)
      return String.fromCharCode(code)
    })
}

export function stripHtml(html = '') {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

// ── Inline HTML → spans + markDefs ───────────────────────────────────────────
// Processes inline HTML preserving links, bold, italic etc. in document order.

export function parseInlineHtml(html = '') {
  const markDefs  = []
  const spans     = []
  const marks     = []  // stack of active mark keys/types

  // Tokenize into text nodes and tags
  const tokens = html.split(/(<[^>]+>)/g)

  for (const token of tokens) {
    if (!token) continue

    // Opening tag
    if (token.startsWith('<') && !token.startsWith('</')) {
      const tagName = token.match(/^<([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase()

      if (tagName === 'a') {
        const hrefMatch = token.match(/href=["']([^"']*)["']/i)
        const href = hrefMatch?.[1] ?? ''
        const key  = randomKey()
        markDefs.push({ _type: 'link', _key: key, href: decodeEntities(href) })
        marks.push(key)
      } else if (tagName === 'strong' || tagName === 'b') {
        marks.push('strong')
      } else if (tagName === 'em' || tagName === 'i') {
        marks.push('em')
      } else if (tagName === 'u') {
        marks.push('underline')
      } else if (tagName === 's' || tagName === 'strike' || tagName === 'del') {
        marks.push('strike-through')
      }
      // br → space
      else if (tagName === 'br') {
        spans.push({ _type: 'span', _key: randomKey(), text: ' ', marks: [...marks] })
      }
      continue
    }

    // Closing tag -- pop the corresponding mark
    if (token.startsWith('</')) {
      const tagName = token.match(/^<\/([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase()
      if (['a', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del'].includes(tagName ?? '')) {
        marks.pop()
      }
      continue
    }

    // Text node
    const text = decodeEntities(token)
    if (text) {
      spans.push({ _type: 'span', _key: randomKey(), text, marks: [...marks] })
    }
  }

  // Merge adjacent spans with identical marks to keep it clean
  const merged = []
  for (const span of spans) {
    const prev = merged[merged.length - 1]
    if (prev && JSON.stringify(prev.marks) === JSON.stringify(span.marks)) {
      prev.text += span.text
    } else {
      merged.push({ ...span })
    }
  }

  if (merged.length === 0) {
    merged.push({ _type: 'span', _key: randomKey(), text: '', marks: [] })
  }

  return { spans: merged, markDefs }
}

// ── Main HTML → Portable Text converter ──────────────────────────────────────
// Walks the HTML string sequentially, emitting blocks in document order.
// uploadFn is async: (url: string) => SanityImageObject | null

export async function htmlToPortableText(html = '', uploadFn) {
  if (!html.trim()) return []

  const blocks = []

  // Tokenize the HTML into a flat list of opening tags, closing tags, and text
  // We process these as a stream, maintaining a context stack
  const tokens  = html.split(/(<[^>]+>)/g)
  const context = []  // stack of { tag, inner[] }

  // Helper: flush accumulated content from a block context into a PT block
  function makeBlock(tag, innerHtml, extraProps = {}) {
    // Clean wp- classes from headings: <h2 class="wp-block-heading">
    const style =
      tag === 'h1' ? 'h1' :
      tag === 'h2' ? 'h2' :
      tag === 'h3' ? 'h3' :
      tag === 'h4' ? 'h4' :
      tag === 'blockquote' ? 'blockquote' : 'normal'

    const { spans, markDefs } = parseInlineHtml(innerHtml)
    const hasContent = spans.some(s => s.text.trim())
    if (!hasContent) return null

    return {
      _type: 'block',
      _key:  randomKey(),
      style,
      markDefs,
      children: spans,
      ...extraProps,
    }
  }

  // We do a two-pass approach:
  // Pass 1: Extract top-level block structures with their full inner HTML
  // Pass 2: Process each block structure

  // Extract top-level blocks using a nesting-aware parser
  const topLevelBlocks = extractTopLevelBlocks(html)

  for (const block of topLevelBlocks) {
    const { tag, inner, attrs } = block

    // ── Paragraphs ──────────────────────────────────────────────────────────
    if (tag === 'p') {
      const b = makeBlock('p', inner)
      if (b) blocks.push(b)
      continue
    }

    // ── Headings ────────────────────────────────────────────────────────────
    if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
      const b = makeBlock(tag, inner)
      if (b) blocks.push(b)
      continue
    }

    // ── Blockquote ──────────────────────────────────────────────────────────
    if (tag === 'blockquote') {
      const b = makeBlock('blockquote', inner)
      if (b) blocks.push(b)
      continue
    }

    // ── Lists -- process li items in order ───────────────────────────────────
    if (tag === 'ul' || tag === 'ol') {
      const listItem = tag === 'ul' ? 'bullet' : 'number'
      const liBlocks = extractTopLevelBlocks(inner)
      for (const li of liBlocks) {
        if (li.tag !== 'li') continue
        const { spans, markDefs } = parseInlineHtml(li.inner)
        if (spans.some(s => s.text.trim())) {
          blocks.push({ _type: 'block', _key: randomKey(), style: 'normal', listItem, level: 1, markDefs, children: spans })
        }
      }
      continue
    }

    // ── Figures with images ──────────────────────────────────────────────────
    if (tag === 'figure') {
      const imgMatch = inner.match(/<img[^>]+>/i)
      if (imgMatch) {
        const imgTag     = imgMatch[0]
        const srcMatch   = imgTag.match(/src=["']([^"']+)["']/i)
        const altMatch   = imgTag.match(/alt=["']([^"']*)["']/i)
        const src        = srcMatch?.[1]
        const alt        = altMatch?.[1] ?? ''

        if (src) {
          const fullUrl = src.startsWith('http') ? src : `https://purefacts.com${src}`
          if (fullUrl.includes('purefacts.com') || fullUrl.includes('wp-content')) {
            console.log(`    ↑ Inline image: ${fullUrl.split('/').pop().split('?')[0]}${alt ? ` (alt: "${alt}")` : ''}`)
            const imageBlock = await uploadFn(fullUrl)
            if (imageBlock) {
              blocks.push({
                ...imageBlock,
                _key: randomKey(),
                alt: alt || undefined,
              })
            }
          }
        }
      }
      // Figcaption
      const captionMatch = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
      if (captionMatch) {
        const text = stripHtml(captionMatch[1]).trim()
        if (text) {
          blocks.push({ _type: 'block', _key: randomKey(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: randomKey(), text: decodeEntities(text), marks: ['em'] }] })
        }
      }
      continue
    }

    // ── Details / summary (works cited, collapsible sections) ────────────────
    if (tag === 'details') {
      const innerBlocks = await htmlToPortableText(inner, uploadFn)
      blocks.push(...innerBlocks)
      continue
    }

    if (tag === 'summary') {
      const b = makeBlock('h3', inner)
      if (b) blocks.push(b)
      continue
    }

    // ── Divs / sections -- recurse into their content ────────────────────────
    if (tag === 'div' || tag === 'section') {
      // Skip rank-math-faq divs -- handled separately by extractFaqs
      if (attrs.includes('rank-math')) continue
      const innerBlocks = await htmlToPortableText(inner, uploadFn)
      blocks.push(...innerBlocks)
      continue
    }

    // ── Raw text nodes between block elements ────────────────────────────────
    if (tag === '__text__') {
      const text = decodeEntities(inner).trim()
      if (text) {
        blocks.push({ _type: 'block', _key: randomKey(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: randomKey(), text, marks: [] }] })
      }
    }
  }

  return blocks
}

// ── Nesting-aware top-level block extractor ───────────────────────────────────
// Returns array of { tag, inner, attrs } for each top-level element,
// preserving exact document order and handling nested tags correctly.

export function extractTopLevelBlocks(html) {
  const results = []
  let i = 0
  const str = html

  while (i < str.length) {
    // Skip whitespace-only gaps
    const wsMatch = str.slice(i).match(/^(\s+)/)
    if (wsMatch) { i += wsMatch[0].length; continue }

    // Check for an opening tag
    const tagMatch = str.slice(i).match(/^<([a-z][a-z0-9]*)((?:\s[^>]*)?)\s*\/?>/)
    if (!tagMatch) {
      // Text node -- collect until next tag
      const nextTag = str.indexOf('<', i)
      const text = nextTag === -1 ? str.slice(i) : str.slice(i, nextTag)
      if (text.trim()) results.push({ tag: '__text__', inner: text, attrs: '' })
      i = nextTag === -1 ? str.length : nextTag
      continue
    }

    const tag   = tagMatch[1].toLowerCase()
    const attrs = tagMatch[2] ?? ''

    // Self-closing or void tags -- skip
    if (tagMatch[0].endsWith('/>') || ['br','hr','img','input','meta','link'].includes(tag)) {
      // For img at top level (outside figure), handle it
      if (tag === 'img') {
        results.push({ tag: 'img', inner: tagMatch[0], attrs })
      }
      i += tagMatch[0].length
      continue
    }

    i += tagMatch[0].length

    // Find matching closing tag, respecting nesting
    let depth = 1
    let j = i
    while (j < str.length && depth > 0) {
      const open  = str.slice(j).match(new RegExp(`^<${tag}[\\s>]`, 'i'))
      const close = str.slice(j).match(new RegExp(`^<\\/${tag}>`, 'i'))
      if (close) { depth--; if (depth === 0) break; j += close[0].length }
      else if (open) { depth++; j += open[0].length }
      else j++
    }

    const inner = str.slice(i, j)
    const closeTagLen = `</${tag}>`.length
    i = j + (depth === 0 ? closeTagLen : 0)

    results.push({ tag, inner, attrs })
  }

  return results
}

// ── Rank Math FAQ extractor ───────────────────────────────────────────────────

export function extractFaqs(html = '') {
  const faqs = []

  const faqBlockStart = html.search(/<div[^>]*class="[^"]*rank-math-block[^"]*"/i)
  if (faqBlockStart === -1) return { bodyHtml: html, faqs }

  const beforeFaq      = html.slice(0, faqBlockStart)
  const faqHeadingMatch = beforeFaq.match(/(<h2[^>]*>[^<]*faq[^<]*<\/h2>)\s*$/i)
  const cutPoint       = faqHeadingMatch ? beforeFaq.lastIndexOf(faqHeadingMatch[1]) : faqBlockStart
  const bodyHtml       = html.slice(0, cutPoint).trim()
  const faqSection     = html.slice(faqBlockStart)

  const itemSplitPattern = /(?=<div[^>]*id="faq-question-[^"]*"[^>]*class="rank-math-list-item")/gi
  const items = faqSection.split(itemSplitPattern).filter(s => s.includes('rank-math-list-item'))

  for (const item of items) {
    const questionMatch = item.match(/<h3[^>]*class="[^"]*rank-math-question[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)
    const answerMatch   = item.match(/<div[^>]*class="[^"]*rank-math-answer[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    if (questionMatch && answerMatch) {
      const question = stripHtml(questionMatch[1])
      const answer   = stripHtml(answerMatch[1])
      if (question && answer) {
        faqs.push({ _key: randomKey(), _type: 'object', question, answer })
      }
    }
  }

  return { bodyHtml, faqs }
}

// ── Rank Math SEO fetcher ─────────────────────────────────────────────────────

const seoCache = new Map()

export async function fetchSeo(postUrl) {
  if (seoCache.has(postUrl)) return seoCache.get(postUrl)
  try {
    const res  = await fetch(`https://purefacts.com/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(postUrl)}`)
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    const head = data.head ?? ''

    const ogTitleMatch     = head.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
                          ?? head.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i)
    const descMatch        = head.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
                          ?? head.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)

    const seo = {
      metaTitle:       ogTitleMatch ? decodeEntities(ogTitleMatch[1]) : null,
      metaDescription: descMatch    ? decodeEntities(descMatch[1])    : null,
    }

    seoCache.set(postUrl, seo)
    return seo
  } catch (err) {
    console.warn(`  ⚠️  SEO fetch failed: ${err.message}`)
    seoCache.set(postUrl, null)
    return null
  }
}
