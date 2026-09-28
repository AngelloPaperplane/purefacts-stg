// app/blog/[slug]/page.tsx
import { buildPostPage } from '@/lib/postPageFactory'

const { generateStaticParams, generateMetadata, Page } = buildPostPage('blog')
export { generateStaticParams, generateMetadata }
export default Page