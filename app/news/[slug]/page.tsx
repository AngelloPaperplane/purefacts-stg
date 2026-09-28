// app/news/[slug]/page.tsx
import { buildPostPage } from '@/lib/postPageFactory'

const { generateStaticParams, generateMetadata, Page } = buildPostPage('news')
export { generateStaticParams, generateMetadata }
export default Page