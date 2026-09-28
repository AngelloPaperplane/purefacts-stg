// app/press-release/[slug]/page.tsx
import { buildPostPage } from '@/lib/postPageFactory'

const { generateStaticParams, generateMetadata, Page } = buildPostPage('press-release')
export { generateStaticParams, generateMetadata }
export default Page