// app/about/partner/page.tsx


import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import PartnerTemplate from '../internalPartnercontent';

export const metadata: Metadata = {
  title: 'Implementation Partner | Partner | About PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}


const referralData = {
  theme: {
    aRgb: '251,86,7',
    accent: '#fb5607',
    heroIcon: '/icons/naranja.png'
  },
  hubspot: {
    portalId: '3218774',
    formId: '00b1b3e4-d231-4b27-9223-3a24405df207'
  },
  hero: {
    eyebrow: 'partner type',
    titleLine1: 'Referral Partner',
    titleAccent: 'Refer. Reward. Repeat.',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    cta: 'Become a Partner',
    contactText: 'Contact Us',
    contactLink: '/contact'
  },
  overview: {
    eyebrow: 'Partner program',
    title: 'Overview',
    description: 'Client data lives in one system. Assets live in another. Billing rules sit somewhere else. Contract terms may be buried in PDFs, email threads, or static spreadsheets. By quarter-end, finance and operations are forced to stitch the truth together by hand.',
    bullets: [
      { label: 'Earned But Not Collected', icon: 'fa-circle-check' },
      { label: 'EBITDA Impact Is Direct', icon: 'fa-circle-check' },
      { label: 'Compounding Over Time', icon: 'fa-circle-check' },
      { label: 'Manual Reconciliation Cost', icon: 'fa-circle-check' }
    ]
  },
  expertise: {
    title: 'How it Works',
    cards: [
      { icon: 'fa-circle-check', label: 'Compression', href: '/why-purefacts/compression', desc: 'Fee pressure is rising while cost to serve expands.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Collection', href: '/why-purefacts/collection', desc: 'Revenue you earned but did not collect is margin lost.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Secure Your Revenue Lifecycle', href: '/platform', desc: 'Compression, collection, and complexity are connected problems.', isPlatform: false }
    ]
  },
  features: {
    eyebrow: 'HOW IT WORKS',
    titleLine1: 'Your journey',
    titleAccent: 'to partnership',
    description: 'A simple process to get started and set your partnership in motion.',
    steps: [
      { icon: 'fa-check-to-slot', title: 'Apply', body: 'Tell us about your business and goals.', count: '01' },
      { icon: 'fa-magnifying-glass-chart', title: 'Review', body: 'Our team reviews your submission and follows up.', count: '02' },
      { icon: 'fa-plane-departure', title: 'Onboard', body: 'Complete onboarding and gain partner access.', count: '03' },
      { icon: 'fa-angles-up', title: 'Grow', body: 'Start collaborating, driving value and growing together.', count: '04' }
    ]
  },
  lastBlock: {
    titleLine1: 'Let’s build',
    titleHighlight: 'what’s next',
    description: 'Join the PureFacts Partner Program and be part of an ecosystem that\'s transforming how the world works with data.',
    cta: 'Become a Partner'
  }
};

export default function ImplementationPartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <PartnerTemplate data={referralData} />
    </>
  )
}
