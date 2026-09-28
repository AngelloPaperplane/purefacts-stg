const resourcesAdUnit = {
  name: 'resourcesAdUnit',
  title: 'Resources Ad Unit',
  type: 'document',
  fields: [
    {
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Turn the ad unit card on or off in the resources grid.',
      initialValue: false,
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small label above the headline (e.g. "Free Tool", "Interactive").',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
    },
    {
      name: 'link',
      title: 'Link URL',
      type: 'url',
      description: 'Where the card links to. Can be a relative path (e.g. /tools/calculator) or full URL.',
      validation: (Rule: any) => Rule.uri({ allowRelative: true }),
    },
  ],
  preview: {
    select: {
      title: 'title',
      enabled: 'enabled',
    },
    prepare({ title, enabled }: { title: string; enabled: boolean }) {
      return {
        title: title || 'Resources Ad Unit',
        subtitle: enabled ? 'Enabled' : 'Disabled',
      } as any
    },
  },
}

export default resourcesAdUnit