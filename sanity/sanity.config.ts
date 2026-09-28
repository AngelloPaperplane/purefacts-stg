import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import * as schemas from './schemas'

export default defineConfig({
  name: 'purefacts',
  title: 'PureFacts Website',
  projectId: 'kuepsuf9',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: Object.values(schemas) as any,
  },
  document: {
    actions: (prev) => prev,
  },
})