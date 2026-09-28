// inject-breadcrumbs.mjs
// Run from your project root: node inject-breadcrumbs.mjs
//
// Dry run (preview only, no writes):
//   node inject-breadcrumbs.mjs --dry-run

import fs from 'fs'
import path from 'path'

const DRY_RUN = process.argv.includes('--dry-run')

const EXCLUDE_DIRS = new Set([
  'studio',
  'api',
  'homepage-dark',
  'new-homepage',
  '_components',
  '_lib',
])

const APP_DIR = path.resolve('./app')
const IMPORT_LINE = `import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'`

function fileToPathname(filePath) {
  const rel = path.relative(APP_DIR, filePath)
  const withoutFile = rel.replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, '')
  return withoutFile === '' ? '/' : `/${withoutFile}`
}

function collectPages(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      if (entry.name.startsWith('[')) continue
      results.push(...collectPages(path.join(dir, entry.name)))
    } else if (entry.name === 'page.tsx') {
      results.push(path.join(dir, entry.name))
    }
  }
  return results
}

function injectIntoFile(filePath, pathname) {
  let src = fs.readFileSync(filePath, 'utf8')

  if (src.includes('BreadcrumbJsonLd')) {
    console.log(`  SKIP (already patched):          ${filePath}`)
    return false
  }

  const breadcrumbTag = `<BreadcrumbJsonLd pathname="${pathname}" />`

  // Strategy 1: return (\n  <Foo or return (\n  <>
  const parenReturn = src.match(/return\s*\(\s*\n([ \t]*)(<[A-Za-z>])/)
  if (parenReturn) {
    const indent = parenReturn[1]
    const insertAfter = parenReturn[0]
    const insertPos = src.indexOf(insertAfter) + insertAfter.length
    const injection = `\n${indent}      ${breadcrumbTag}\n`
    src = src.slice(0, insertPos) + injection + src.slice(insertPos)
  }

  // Strategy 2: return <Foo ...> single-line
  else if (/return\s+<[A-Za-z]/.test(src)) {
    src = src.replace(/(return\s+)(<[\s\S]*?(?:\/>|<\/[A-Za-z]+>)\s*\n)/, (match, ret, jsx) => {
      return `${ret}(\n  ${breadcrumbTag}\n  ${jsx.trim()}\n)\n`
    })
    if (!src.includes(breadcrumbTag)) {
      console.log(`  SKIP (single-line return too complex): ${filePath}`)
      return false
    }
  }

  else {
    console.log(`  SKIP (no JSX return found):      ${filePath}`)
    return false
  }

  // Add import after the last existing import, or prepend if none
  const lastImportMatch = [...src.matchAll(/^import .+$/gm)].pop()
  if (lastImportMatch) {
    const insertAt = lastImportMatch.index + lastImportMatch[0].length
    src = src.slice(0, insertAt) + '\n' + IMPORT_LINE + src.slice(insertAt)
  } else {
    src = IMPORT_LINE + '\n\n' + src
  }

  if (DRY_RUN) {
    console.log(`  DRY RUN — would patch:           ${filePath}  (${pathname})`)
    return false
  }

  fs.writeFileSync(filePath, src, 'utf8')
  console.log(`  PATCHED:                         ${filePath}  (${pathname})`)
  return true
}

// main

if (!fs.existsSync(APP_DIR)) {
  console.error('ERROR: app/ directory not found. Run this from your project root.')
  process.exit(1)
}

const pages = collectPages(APP_DIR)
console.log(`Found ${pages.length} static page(s) to process.\n`)

let patched = 0
let skipped = 0

for (const filePath of pages) {
  const pathname = fileToPathname(filePath)
  const result = injectIntoFile(filePath, pathname)
  result ? patched++ : skipped++
}

console.log(`\nDone. ${patched} patched, ${skipped} skipped.`)
if (DRY_RUN) console.log('(Dry run — no files were written)')
