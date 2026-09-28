// app/awards/[slug]/page.tsx
import { buildPostPage } from '@/lib/postPageFactory'

const { generateStaticParams, generateMetadata, Page } = buildPostPage('awards')
export { generateStaticParams, generateMetadata }
export default Page