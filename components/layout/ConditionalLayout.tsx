'use client'

import { usePathname } from 'next/navigation'
import Nav from '@/components/layout/Navdark'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Footer from '@/components/layout/Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith('/studio')

  if (isStudio) return <>{children}</>

  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  )
}