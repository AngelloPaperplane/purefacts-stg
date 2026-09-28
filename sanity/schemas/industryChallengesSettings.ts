const industryChallengesSettings = {
  name: 'industryChallengesSettings',
  title: 'Industry Challenges Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                       type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',                 type: 'image', options: { hotspot: true } },
    { name: 'compressionImage',   title: 'Compression Split Image',    type: 'image', options: { hotspot: true }, description: 'Image beside the Compression section' },
    { name: 'collectionImage',    title: 'Collection Split Image',     type: 'image', options: { hotspot: true }, description: 'Image beside the Collection section' },
    { name: 'complexityImage',    title: 'Complexity Split Image',     type: 'image', options: { hotspot: true }, description: 'Image beside the Complexity section' },
    { name: 'solutionImage',      title: 'How PureFacts Helps Image',  type: 'image', options: { hotspot: true }, description: 'Image beside "PureFacts Tackles All Three..."' },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image',    type: 'image', options: { hotspot: true } },
  ],
}

export default industryChallengesSettings