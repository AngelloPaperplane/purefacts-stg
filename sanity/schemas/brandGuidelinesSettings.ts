const brandGuidelinesSettings = {
  name: 'brandGuidelinesSettings',
  title: 'Brand Guidelines',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'heroCity',
      title: 'Image Register 1 — Hero: Gradient City',
      type: 'image',
      options: { hotspot: true },
      description: 'Dark cityscape or financial district photo. The Sunset gradient overlay is applied in code via mix-blend-mode: screen — upload the raw photo here. Min 1600px wide.',
    },
    {
      name: 'heroCityAlt',
      title: 'Hero City Image — Alt Text',
      type: 'string',
      validation: (R: any) => R.required().error('Alt text is required for accessibility'),
    },
    {
      name: 'miniature',
      title: 'Image Register 2 — Feature: 3D Miniature',
      type: 'image',
      options: { hotspot: true },
      description: 'Stylised 3D object render against a white (#ffffff) or near-white (#f8f6f2) background. Square crop preferred. No cinematic lighting or lens flare.',
    },
    {
      name: 'miniatureAlt',
      title: '3D Miniature — Alt Text',
      type: 'string',
      validation: (R: any) => R.required().error('Alt text is required for accessibility'),
    },
    {
      name: 'miniatureConceptLabel',
      title: '3D Miniature — Concept Label',
      type: 'string',
      description: 'Optional: what concept does this miniature represent? (e.g. Compression, Collection, Complexity)',
    },
    {
      name: 'ctaPeopleGradient',
      title: 'Image Register 3 — CTA: People Gradient',
      type: 'image',
      options: { hotspot: true },
      description: 'People photography for bottom-of-page CTA sections. The Sunset gradient and logo treatment are composited around subjects in the component. Upload the base photo here.',
    },
    {
      name: 'ctaPeopleGradientAlt',
      title: 'CTA People Image — Alt Text',
      type: 'string',
      validation: (R: any) => R.required().error('Alt text is required for accessibility'),
    },
  ],
}

export default brandGuidelinesSettings