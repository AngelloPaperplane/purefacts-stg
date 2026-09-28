// ─────────────────────────────────────────────
// sanity/schemas/event.ts
// ─────────────────────────────────────────────
const event = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'title',           title: 'Title',             type: 'string',   validation: (R: any) => R.required() },
    { name: 'slug',            title: 'Slug',              type: 'slug',     options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'eventType',       title: 'Event Type',        type: 'string',   options: { list: [{ title: 'Webinar', value: 'webinar' }, { title: 'Conference', value: 'conference' }, { title: 'Hosted', value: 'hosted' }], layout: 'radio' }, validation: (R: any) => R.required() },
    { name: 'startDate',       title: 'Start Date & Time', type: 'datetime', validation: (R: any) => R.required() },
    { name: 'endDate',         title: 'End Date & Time',   type: 'datetime' },
    { name: 'location',        title: 'Location',          type: 'string',   description: 'Physical address or "Virtual"' },
    { name: 'registrationUrl', title: 'Registration URL',  type: 'url',      description: 'External registration link (e.g. Eventbrite, conference site). Used as fallback if no HubSpot form is set.' },
    { name: 'hubspotFormId',   title: 'HubSpot Form ID',   type: 'string',   description: 'Paste the HubSpot form ID (e.g. 1a2b3c4d-...) to embed a "Connect With Us" form on this event page. Overrides the Registration URL for the hero CTA.' },
    { name: 'ctaLabel',        title: 'CTA Button Label',  type: 'string',   description: 'e.g. "Register Now", "Learn More", "View Recap"', initialValue: 'Register Now' },
    { name: 'excerpt',         title: 'Excerpt',           type: 'text',     rows: 3 },
    { name: 'coverImage',      title: 'Cover Image',       type: 'image',    options: { hotspot: true } },
    { name: 'body',            title: 'Body',              type: 'array',    of: [{ type: 'block' }] },
    { name: 'featured',        title: 'Featured',          type: 'boolean',  initialValue: false },
    {
      name: 'speakers',
      title: 'Speakers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name',    title: 'Name',      type: 'string', validation: (R: any) => R.required() },
            { name: 'title',   title: 'Job Title', type: 'string' },
            { name: 'company', title: 'Company',   type: 'string' },
            { name: 'photo',   title: 'Photo',     type: 'image',  options: { hotspot: true } },
          ],
          preview: {
            select: { title: 'name', subtitle: 'title', media: 'photo' },
          },
        },
      ],
    },
    {
      name: 'sponsors',
      title: 'Sponsors & Partners',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Sponsor Name', type: 'string' },
            { name: 'logo', title: 'Logo',         type: 'image' },
            { name: 'url',  title: 'Website URL',  type: 'url' },
          ],
          preview: {
            select: { title: 'name', media: 'logo' },
          },
        },
      ],
    },
    { name: 'seo', title: 'SEO', type: 'seo' },
  ],
  preview: {
    select: { title: 'title', subtitle: 'eventType', media: 'coverImage' },
  },
}

export default event