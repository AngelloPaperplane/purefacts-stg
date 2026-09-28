const solutionsSettings = {
  name: 'solutionsSettings',
  title: 'Solutions Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'seo',                title: 'SEO',                            type: 'seo' },
    { name: 'heroImage',          title: 'Hero Image',                     type: 'image', options: { hotspot: true } },
    { name: 'feeBillingImage',    title: 'Fee Billing Split Image',         type: 'image', options: { hotspot: true }, description: 'Image beside the Fee Billing section' },
    { name: 'compensationImage',  title: 'Advisor Compensation Split Image',type: 'image', options: { hotspot: true }, description: 'Image beside the Advisor Compensation section' },
    { name: 'insightsImage',      title: 'Insights & Analytics Split Image',type: 'image', options: { hotspot: true }, description: 'Image beside the Insights & Analytics section' },
    { name: 'connectedImage',     title: 'Connected Solutions Image',       type: 'image', options: { hotspot: true }, description: 'Image beside "Why Connected Solutions Matter"' },
    { name: 'ctaBackgroundImage', title: 'CTA Band — People Image',         type: 'image', options: { hotspot: true } },
  ],
}

export default solutionsSettings