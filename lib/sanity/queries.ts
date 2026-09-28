import { sanityFetch } from './client'

export type PostCategory =
  | 'blog'
  | 'case-study'
  | 'whitepaper'
  | 'press-release'
  | 'news'
  | 'awards'

export type SanityImage = {
  _type: 'image'
  asset: { _ref: string }
  hotspot?: { x: number; y: number }
}

export type SEO = {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
  noIndex?: boolean
}

export type Author = {
  _id: string
  name: string
  title: string
  photo: SanityImage
  slug?: { current: string }
}

export type Category = {
  _id: string
  title: string
  slug: { current: string }
}

export type Topic = {
  _id: string
  title: string
  slug: { current: string }
}

export type PostCard = {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt: string
  coverImage: SanityImage
  featured: boolean
  category: Category
  topics: Topic[]
  author: Author
}

export type PostFull = PostCard & {
  _updatedAt?: string
  body: unknown[]
  seo: SEO
  audioFile?: { asset?: { url?: string } }
}

export type Event = {
  _id: string
  title: string
  slug: { current: string }
  eventType: 'webinar' | 'conference' | 'hosted'
  startDate: string
  endDate?: string
  location?: string
  registrationUrl?: string
  ctaLabel?: string
  excerpt?: string
  coverImage?: SanityImage
  featured: boolean
  speakers?: {
    name: string
    title?: string
    company?: string
    photo?: SanityImage
  }[]
  sponsors?: {
    name?: string
    logo?: SanityImage
    url?: string
  }[]
  seo?: SEO
}

export type ClientLogo = {
  _id: string
  name: string
  logo: SanityImage
  caseStudyUrl?: string
}

// ─── GROQ field fragments ────────────────────────────────────────────────────

const POST_CARD_FIELDS = `
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  excerpt,
  coverImage,
  featured,
  category-> { _id, title, slug },
  topics[]-> { _id, title, slug },
  author-> { _id, name, title, photo, slug }
`

const POST_FULL_FIELDS = `
  ${POST_CARD_FIELDS},
  body,
  audioFile { asset->{ url } },
  faqs[] {
    _key,
    question,
    answer
  },
  clientProfile {
    logo,
    companyName,
    profileLine
  },
  template,
  seo
`

const LOGO_FIELDS = `_id, name, logo, caseStudyUrl`

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getPosts({
  limit = 10,
  category,
  topic,
  featured,
}: {
  limit?: number
  category?: PostCategory
  topic?: string
  featured?: boolean
} = {}): Promise<PostCard[]> {
  const categoryFilter = category ? `&& category->slug.current == $category` : ''
  const topicFilter    = topic    ? `&& $topic in topics[]->slug.current`    : ''
  const featuredFilter = featured !== undefined ? `&& featured == $featured` : ''

  const query = `*[
    _type == "post"
    && defined(slug.current)
    && defined(publishedAt)
    ${categoryFilter}
    ${topicFilter}
    ${featuredFilter}
  ] | order(publishedAt desc) [0...$limit] {
    ${POST_CARD_FIELDS}
  }`

  return sanityFetch<PostCard[]>({ query, params: { limit, category, topic, featured }, revalidate: 60 })
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] { ${POST_FULL_FIELDS} }`
  return sanityFetch<PostFull | null>({ query, params: { slug }, revalidate: 60 })
}

export async function getAllPostSlugs(): Promise<{ category: string; slug: string }[]> {
  const query = `*[
    _type == "post"
    && defined(slug.current)
    && defined(category->slug.current)
  ] {
    "category": category->slug.current,
    "slug": slug.current
  }`
  return sanityFetch<{ category: string; slug: string }[]>({ query, revalidate: 60 })
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export async function getTopic(slug: string) {
  const query = `*[_type == "topic" && slug.current == $slug][0] { _id, title, slug, description }`
  return sanityFetch<Topic | null>({ query, params: { slug }, revalidate: 60 })
}

export async function getAllTopicSlugs(): Promise<string[]> {
  const query = `*[_type == "topic" && defined(slug.current)].slug.current`
  return sanityFetch<string[]>({ query, revalidate: 60 })
}

// ─── Client Logos ────────────────────────────────────────────────────────────

export async function getClientLogos(ids: string[]): Promise<ClientLogo[]> {
  if (!ids?.length) return []
  const query = `*[_type == "clientLogo" && _id in $ids] { ${LOGO_FIELDS} }`
  return sanityFetch<ClientLogo[]>({ query, params: { ids }, revalidate: 3600 })
}

// ─── Site Settings (global only) ─────────────────────────────────────────────

export type SiteSettings = {
  siteTitle: string
  siteDescription: string
  defaultOgImage: SanityImage
  twitterHandle: string
  linkedinUrl: string
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const query = `*[_type == "siteSettings"][0] {
    siteTitle, siteDescription, defaultOgImage, twitterHandle, linkedinUrl
  }`
  return sanityFetch<SiteSettings | null>({ query, revalidate: 3600 })
}

// ─── Homepage Settings ───────────────────────────────────────────────────────

export type HomepageSettings = {
  seo: SEO
  heroImage: SanityImage
  clientLogos: ClientLogo[]
  pureferesImage: SanityImage
  purerewardsImage: SanityImage
  purereportsImage: SanityImage
}

export async function getHomepageSettings(): Promise<HomepageSettings | null> {
  const query = `*[_type == "homepageSettings"][0] {
    seo,
    heroImage,
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} },
    pureferesImage,
    purerewardsImage,
    purereportsImage
  }`
  return sanityFetch<HomepageSettings | null>({ query, revalidate: 3600 })
}

// ─── Platform Settings ───────────────────────────────────────────────────────

export type PlatformSettings = {
  seo: SEO
  heroImage: SanityImage
  splitImage: SanityImage
  valueImage: SanityImage
  pureferesImage: SanityImage
  purerewardsImage: SanityImage
  purereportsImage: SanityImage
  clientLogos: ClientLogo[]
}

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  const query = `*[_type == "platformSettings"][0] {
    seo,
    heroImage,
    splitImage,
    valueImage,
    pureferesImage,
    purerewardsImage,
    purereportsImage,
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} }
  }`
  return sanityFetch<PlatformSettings | null>({ query, revalidate: 3600 })
}

// ─── Why PureFacts Settings ──────────────────────────────────────────────────

export type ReasonCard = {
  _key: string
  icon?: SanityImage
  title: string
  description: string
  linkUrl?: string
  linkLabel?: string
}

export type WhyPurefactsSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  infrastructureImage: SanityImage
  ctaBackgroundImage: SanityImage
  reasonCardsHeadline?: string
  reasonCardsSubheadline?: string
  reasonCards?: ReasonCard[]
  clientLogos: ClientLogo[]
}

export async function getWhyPurefactsSettings(): Promise<WhyPurefactsSettings | null> {
  const query = `*[_type == "whyPurefactsSettings"][0] {
    seo,
    heroImage,
    problemImage,
    infrastructureImage,
    ctaBackgroundImage,
    reasonCardsHeadline,
    reasonCardsSubheadline,
    reasonCards[] {
      _key,
      icon,
      title,
      description,
      linkUrl,
      linkLabel
    },
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} }
  }`
  return sanityFetch<WhyPurefactsSettings | null>({ query, revalidate: 3600 })
}

// ─── PureFees Settings ───────────────────────────────────────────────────────

export type FeatureCard = {
  _key: string
  icon?: SanityImage
  category?: string
  title: string
  bulletOne: string
  bulletTwo?: string
  bulletThree?: string
}

export type ProductPageSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  complexityImage: SanityImage
  analyticsImage: SanityImage
  ctaBackgroundImage: SanityImage
  onePagerUrl: string
  featureGridTitle?: string
  featureCards?: FeatureCard[]
  clientLogos: ClientLogo[]
}

const PRODUCT_PAGE_FIELDS = `
  seo,
  heroImage,
  problemImage,
  complexityImage,
  analyticsImage,
  ctaBackgroundImage,
  onePagerUrl,
  featureGridTitle,
  featureCards[] {
    _key,
    icon,
    category,
    title,
    bulletOne,
    bulletTwo,
    bulletThree
  },
  "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} }
`

export async function getPurefeesSettings(): Promise<ProductPageSettings | null> {
  const query = `*[_type == "purefeesSettings"][0] { ${PRODUCT_PAGE_FIELDS} }`
  return sanityFetch<ProductPageSettings | null>({ query, revalidate: 3600 })
}

export async function getPurerewardsSettings(): Promise<ProductPageSettings | null> {
  const query = `*[_type == "purerewardsSettings"][0] { ${PRODUCT_PAGE_FIELDS} }`
  return sanityFetch<ProductPageSettings | null>({ query, revalidate: 3600 })
}

export async function getPurereportsSettings(): Promise<ProductPageSettings | null> {
  const query = `*[_type == "purereportsSettings"][0] { ${PRODUCT_PAGE_FIELDS} }`
  return sanityFetch<ProductPageSettings | null>({ query, revalidate: 3600 })
}

// ─── Who We Serve Settings ───────────────────────────────────────────────────
// Replace the existing WhoWeServeSettings type and getWhoWeServeSettings
// function at the bottom of your queries.ts with the following:

export type WhoWeServeCard = {
  _key: string
  image?: SanityImage
  subtitle?: string
  title: string
  description: string
  linkUrl?: string
  linkLabel?: string
}

export type WhoWeServeSettings = {
  seo: SEO
  heroImage: SanityImage
  industryCards?: WhoWeServeCard[]
  pullQuote?: string
  pullQuoteLinkLabel?: string
  pullQuoteLinkUrl?: string
  personaCards?: WhoWeServeCard[]
  ctaImage?: SanityImage
}

const WHO_WE_SERVE_CARD_FIELDS = `
  _key,
  image,
  subtitle,
  title,
  description,
  linkUrl,
  linkLabel
`

export async function getWhoWeServeSettings(): Promise<WhoWeServeSettings | null> {
  const query = `*[_type == "whoWeServeSettings"][0] {
    seo,
    heroImage,
    industryCards[] { ${WHO_WE_SERVE_CARD_FIELDS} },
    pullQuote,
    pullQuoteLinkLabel,
    pullQuoteLinkUrl,
    personaCards[] { ${WHO_WE_SERVE_CARD_FIELDS} },
    ctaImage
  }`
  return sanityFetch<WhoWeServeSettings | null>({ query, revalidate: 3600 })
}

// ─── Wealth Management Settings ──────────────────────────────────────────────

export type WealthManagementSettings = {
  seo: SEO
  heroImage: SanityImage
  clientLogos: ClientLogo[]
  forceCards?: WhoWeServeCard[]
  whyImage?: SanityImage
  caseStudyUrl?: string
  optimizationCards?: ReasonCard[]
  spillageImage?: SanityImage
  ctaImage?: SanityImage
}

const INDUSTRY_CARD_FIELDS = `
  _key,
  image,
  subtitle,
  title,
  description,
  linkUrl,
  linkLabel
`

export async function getWealthManagementSettings(): Promise<WealthManagementSettings | null> {
  const query = `*[_type == "wealthManagementSettings"][0] {
    seo,
    heroImage,
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} },
    forceCards[] { ${INDUSTRY_CARD_FIELDS} },
    whyImage,
    caseStudyUrl,
    optimizationCards[] {
      _key,
      icon,
      title,
      description,
      linkUrl,
      linkLabel
    },
    spillageImage,
    ctaImage
  }`
  return sanityFetch<WealthManagementSettings | null>({ query, revalidate: 3600 })
}


// Append both blocks to the bottom of lib/sanity/queries.ts

// ─── Asset Management Settings ───────────────────────────────────────────────

export type AssetManagementSettings = {
  seo: SEO
  heroImage: SanityImage
  clientLogos: ClientLogo[]
  forceCards?: WhoWeServeCard[]
  whyImage?: SanityImage
  caseStudyUrl?: string
  integrityCards?: ReasonCard[]
  integrityImage?: SanityImage
  ctaImage?: SanityImage
}

export async function getAssetManagementSettings(): Promise<AssetManagementSettings | null> {
  const query = `*[_type == "assetManagementSettings"][0] {
    seo,
    heroImage,
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} },
    forceCards[] { ${WHO_WE_SERVE_CARD_FIELDS} },
    whyImage,
    caseStudyUrl,
    integrityCards[] { _key, icon, title, description, linkUrl, linkLabel },
    integrityImage,
    ctaImage
  }`
  return sanityFetch<AssetManagementSettings | null>({ query, revalidate: 3600 })
}

// ─── Asset Servicing Settings ─────────────────────────────────────────────────

export type AssetServicingSettings = {
  seo: SEO
  heroImage: SanityImage
  clientLogos: ClientLogo[]
  forceCards?: WhoWeServeCard[]
  whyImage?: SanityImage
  caseStudyUrl?: string
  deliversCards?: ReasonCard[]
  optimizationImage?: SanityImage
  ctaImage?: SanityImage
}

export async function getAssetServicingSettings(): Promise<AssetServicingSettings | null> {
  const query = `*[_type == "assetServicingSettings"][0] {
    seo,
    heroImage,
    "clientLogos": clientLogos[]-> { ${LOGO_FIELDS} },
    forceCards[] { ${WHO_WE_SERVE_CARD_FIELDS} },
    whyImage,
    caseStudyUrl,
    deliversCards[] { _key, icon, title, description, linkUrl, linkLabel },
    optimizationImage,
    ctaImage
  }`
  return sanityFetch<AssetServicingSettings | null>({ query, revalidate: 3600 })
}

// ─── About Settings ──────────────────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type AboutSettings = {
  heroImage?: SanityImage
  storyImage?: SanityImage
  teamPhoto?: SanityImage
  recognitionImages?: SanityImage[]
}

export async function getAboutSettings(): Promise<AboutSettings | null> {
  const query = `*[_type == "aboutSettings"][0] {
    heroImage,
    storyImage,
    teamPhoto,
    recognitionImages[] {
      asset->
    }
  }`
  return sanityFetch<AboutSettings | null>({ query, revalidate: 3600 })
}

// ─── Newsroom Settings ────────────────────────────────────────────────────────

export type Award = {
  image: SanityImage
  provider: string
  title: string
  year: number
}

export type NewsroomSettings = {
  awards: Award[]
}

export async function getNewsroomSettings(): Promise<NewsroomSettings | null> {
  const query = `*[_type == "newsroomSettings"][0] {
    awards[] {
      image,
      provider,
      title,
      year
    }
  }`
  return sanityFetch<NewsroomSettings | null>({ query, revalidate: 3600 })
}

// ─── Brand Guidelines Settings ───────────────────────────────────────────────

export type BrandGuidelinesSettings = {
  heroCity?: SanityImage
  heroCityAlt?: string
  miniature?: SanityImage
  miniatureAlt?: string
  miniatureConceptLabel?: string
  ctaPeopleGradient?: SanityImage
  ctaPeopleGradientAlt?: string
}

export async function getBrandGuidelinesSettings(): Promise<BrandGuidelinesSettings | null> {
  const query = `*[_type == "brandGuidelinesSettings"][0] {
    heroCity,
    heroCityAlt,
    miniature,
    miniatureAlt,
    miniatureConceptLabel,
    ctaPeopleGradient,
    ctaPeopleGradientAlt
  }`
  return sanityFetch<BrandGuidelinesSettings | null>({ query, revalidate: 3600 })
}


// ─── Leadership Settings ──────────────────────────────────────────────────────

export type LeadershipSettings = {
  heroImage?: SanityImage
  leaders?: {
    photo?: SanityImage
    name: string
    title: string
    bio?: string
    linkedinUrl?: string
  }[]
}

export async function getLeadershipSettings(): Promise<LeadershipSettings | null> {
  const query = `*[_type == "leadershipSettings"][0] {
    heroImage,
    leaders[] {
      photo,
      name,
      title,
      bio,
      linkedinUrl
    }
  }`
  return sanityFetch<LeadershipSettings | null>({ query, revalidate: 3600 })
}


// ─── Careers Settings ─────────────────────────────────────────────────────────

export type CareersSettings = {
  heroImage?: SanityImage
  acrosticImage?: SanityImage
  operatingImage?: SanityImage
}

export async function getCareersSettings(): Promise<CareersSettings | null> {
  const query = `*[_type == "careersSettings"][0] {
    heroImage,
    acrosticImage,
    operatingImage
  }`
  return sanityFetch<CareersSettings | null>({ query, revalidate: 3600 })
}


// ─── Compensation & Incentives Settings ──────────────────────────────────────

export type CompensationIncentivesSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getCompensationIncentivesSettings(): Promise<CompensationIncentivesSettings | null> {
  const query = `*[_type == "compensationIncentivesSettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<CompensationIncentivesSettings | null>({ query, revalidate: 3600 })
}


// ─── Insights & Analytics Settings ───────────────────────────────────────────

export type InsightsAnalyticsSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getInsightsAnalyticsSettings(): Promise<InsightsAnalyticsSettings | null> {
  const query = `*[_type == "insightsAnalyticsSettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<InsightsAnalyticsSettings | null>({ query, revalidate: 3600 })
}


// ─── Fee Billing Settings ─────────────────────────────────────────────────────

export type FeeBillingSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getFeeBillingSettings(): Promise<FeeBillingSettings | null> {
  const query = `*[_type == "feeBillingSettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<FeeBillingSettings | null>({ query, revalidate: 3600 })
}

// ─── Newsletter Settings ──────────────────────────────────────────────────────

export type NewsletterSettings = {
  featureImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getNewsletterSettings(): Promise<NewsletterSettings | null> {
  const query = `*[_type == "newsletterSettings"][0] {
    featureImage,
    ctaBackgroundImage
  }`
  return sanityFetch<NewsletterSettings | null>({ query, revalidate: 3600 })
}


// ─── Compression Settings ─────────────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type CompressionSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getCompressionSettings(): Promise<CompressionSettings | null> {
  const query = `*[_type == "compressionSettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<CompressionSettings | null>({ query, revalidate: 3600 })
}

// ─── Collection Settings ──────────────────────────────────────────────────────

export type CollectionSettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getCollectionSettings(): Promise<CollectionSettings | null> {
  const query = `*[_type == "collectionSettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<CollectionSettings | null>({ query, revalidate: 3600 })
}

// ─── Complexity Settings ──────────────────────────────────────────────────────

export type ComplexitySettings = {
  seo: SEO
  heroImage: SanityImage
  problemImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getComplexitySettings(): Promise<ComplexitySettings | null> {
  const query = `*[_type == "complexitySettings"][0] {
    seo,
    heroImage,
    problemImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<ComplexitySettings | null>({ query, revalidate: 3600 })
}


export async function getTopics(): Promise<Topic[]> {
  const query = `*[_type == "topic" && defined(slug.current)] | order(title asc) {
    _id, title, slug
  }`
  return sanityFetch<Topic[]>({ query, revalidate: 3600 })
}


// ─── EVENT QUERIES ─────────────────────────────────────────────────────────
// Append these to lib/sanity/queries.ts

export const EVENT_FIELDS = `
  _id,
  _type,
  title,
  slug,
  eventType,
  excerpt,
  startDate,
  endDate,
  location,
  registrationUrl,
  ctaLabel,
  coverImage,
  featured,
  speakers[] {
    name,
    title,
    company,
    photo
  },
  sponsors[] {
    name,
    logo,
    url
  },
  seo
`

// All events ordered by start date ascending
export const ALL_EVENTS_QUERY = `
  *[_type == "event"] | order(startDate asc) {
    ${EVENT_FIELDS}
  }
`

// Upcoming events only (startDate >= now)
export const UPCOMING_EVENTS_QUERY = `
  *[_type == "event" && startDate >= $now] | order(startDate asc) {
    ${EVENT_FIELDS}
  }
`

// Past events (startDate < now), most recent first
export const PAST_EVENTS_QUERY = `
  *[_type == "event" && startDate < $now] | order(startDate desc) {
    ${EVENT_FIELDS}
  }
`

// Events within a specific month (for calendar widget)
// Pass: $monthStart, $monthEnd (ISO strings)
export const EVENTS_BY_MONTH_QUERY = `
  *[_type == "event" && startDate >= $monthStart && startDate <= $monthEnd] | order(startDate asc) {
    ${EVENT_FIELDS}
  }
`

// Single event by slug
export const EVENT_BY_SLUG_QUERY = `
  *[_type == "event" && slug.current == $slug][0] {
    ${EVENT_FIELDS}
  }
`

// Widget query: next N upcoming events
// Pass: $now, $limit
export const UPCOMING_EVENTS_WIDGET_QUERY = `
  *[_type == "event" && startDate >= $now] | order(startDate asc) [0...$limit] {
    ${EVENT_FIELDS}
  }
`


// ─── Industry Challenges Settings ────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type IndustryChallengesSettings = {
  seo: SEO
  heroImage: SanityImage
  compressionImage: SanityImage
  collectionImage: SanityImage
  complexityImage: SanityImage
  solutionImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getIndustryChallengesSettings(): Promise<IndustryChallengesSettings | null> {
  const query = `*[_type == "industryChallengesSettings"][0] {
    seo,
    heroImage,
    compressionImage,
    collectionImage,
    complexityImage,
    solutionImage,
    ctaBackgroundImage
  }`
  return sanityFetch<IndustryChallengesSettings | null>({ query, revalidate: 3600 })
}

// ─── Solutions Settings ───────────────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type SolutionsSettings = {
  seo: SEO
  heroImage: SanityImage
  feeBillingImage: SanityImage
  compensationImage: SanityImage
  insightsImage: SanityImage
  connectedImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getSolutionsSettings(): Promise<SolutionsSettings | null> {
  const query = `*[_type == "solutionsSettings"][0] {
    seo,
    heroImage,
    feeBillingImage,
    compensationImage,
    insightsImage,
    connectedImage,
    ctaBackgroundImage
  }`
  return sanityFetch<SolutionsSettings | null>({ query, revalidate: 3600 })
}

// ─── Work With Us Settings ────────────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type WorkWithUsSettings = {
  seo: SEO
  heroImage: SanityImage
  platformImage: SanityImage
  expertiseImage: SanityImage
  clientLogos: ClientLogo[]
  ctaBackgroundImage: SanityImage
}

export async function getWorkWithUsSettings(): Promise<WorkWithUsSettings | null> {
  const query = `*[_type == "workWithUsSettings"][0] {
    seo,
    heroImage,
    platformImage,
    expertiseImage,
    "clientLogos": clientLogos[]-> { ${`_id, name, logo, caseStudyUrl`} },
    ctaBackgroundImage
  }`
  return sanityFetch<WorkWithUsSettings | null>({ query, revalidate: 3600 })
}


// ─── Platform Approach Settings ──────────────────────────────────────────────
// Append to the bottom of lib/sanity/queries.ts

export type PlatformApproachSettings = {
  seo: SEO
  heroImage: SanityImage
  whyImage: SanityImage
  trustImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getPlatformApproachSettings(): Promise<PlatformApproachSettings | null> {
  const query = `*[_type == "platformApproachSettings"][0] {
    seo, heroImage, whyImage, trustImage, ctaBackgroundImage
  }`
  return sanityFetch<PlatformApproachSettings | null>({ query, revalidate: 3600 })
}

// ─── Deep Domain Expertise Settings ──────────────────────────────────────────

export type DeepDomainExpertiseSettings = {
  seo: SEO
  heroImage: SanityImage
  expertiseImage: SanityImage
  platformImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getDeepDomainExpertiseSettings(): Promise<DeepDomainExpertiseSettings | null> {
  const query = `*[_type == "deepDomainExpertiseSettings"][0] {
    seo, heroImage, expertiseImage, platformImage, ctaBackgroundImage
  }`
  return sanityFetch<DeepDomainExpertiseSettings | null>({ query, revalidate: 3600 })
}

// ─── Our Process Settings ─────────────────────────────────────────────────────

export type OurProcessSettings = {
  seo: SEO
  heroImage: SanityImage
  ctaBackgroundImage: SanityImage
}

export async function getOurProcessSettings(): Promise<OurProcessSettings | null> {
  const query = `*[_type == "ourProcessSettings"][0] {
    seo, heroImage, ctaBackgroundImage
  }`
  return sanityFetch<OurProcessSettings | null>({ query, revalidate: 3600 })
}


// Append to the bottom of lib/sanity/queries.ts

// ─── Persona Page Settings (Head of Wealth, Finance, Operations) ─────────────

export type PersonaPageSettings = {
  seo: SEO
  heroImage?: SanityImage
  whyImage?: SanityImage
  pressureCards?: WhoWeServeCard[]
  solutionCards?: WhoWeServeCard[]
  ctaImage?: SanityImage
}

const PERSONA_CARD_FIELDS = `
  _key,
  image,
  subtitle,
  title,
  description,
  linkUrl,
  linkLabel
`

export async function getPersonaPageSettings(
  docType: 'headOfWealthSettings' | 'financeSettings' | 'operationsSettings'
): Promise<PersonaPageSettings | null> {
  const query = `*[_type == $docType][0] {
    seo,
    heroImage,
    whyImage,
    pressureCards[] { ${PERSONA_CARD_FIELDS} },
    solutionCards[] { ${PERSONA_CARD_FIELDS} },
    ctaImage
  }`
  return sanityFetch<PersonaPageSettings | null>({ query, params: { docType }, revalidate: 3600 })
}