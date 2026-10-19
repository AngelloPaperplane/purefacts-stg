// app/about/partner/page.tsx


import type { Metadata } from 'next'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'
import PartnerTemplate from '../internalPartnercontent';

export const metadata: Metadata = {
  title: 'Referral Partner | Partner | About PureFacts',
  description:
    "Join PureFacts and help shape the future of revenue management for the world's leading financial institutions.",
}

const referralData = {
  theme: {
    aRgb: '59,132,255',
    accent: '#3b84ff',
    heroIcon: '/icons/azul.png'
  },
  hubspot: {
    portalId: '3218774',
    formId: '095814c0-f3a9-419f-b695-06974ac658b0'
  },
  hero: {
    eyebrow: 'partner type',
    titleLine1: 'Referral Partner',
    titleAccent: 'Refer. Reward. Repeat.',
    description: 'Introduce PureFacts to organizations that can benefit from smarter revenue management and earn rewards for opportunities that convert',
    cta: 'Become a Referral Partner',
    contactText: 'Contact Us',
    contactLink: '/contact'
  },
  overview: {
    eyebrow: 'Partner program',
    title: 'Overview',
    description: 'As a Referral Partner, you connect us with potential customers and we take it from there. It’s a simple way to add value to your network while earning rewards for successful introductions.',
    bullets: [
      { label: 'No implementation required', icon: 'fa-circle-check' },
      { label: 'No ongoing obligations', icon: 'fa-circle-check' },
      { label: 'Attractive referral incentives', icon: 'fa-circle-check' },
      { label: 'Real-time deal visibility', icon: 'fa-circle-check' }
    ]
  },
  expertise: {
    title: 'How it Works',
    cards: [
      { icon: 'fa-circle-check', label: 'Refer', href: '/why-purefacts/our-process', desc: 'Introduce us to a prospect who could beneft from PureFacts.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Connect', href: '/why-purefacts/our-process', desc: 'We reach out, qualify the opportunity. and keep you informed.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Convert', href: '/why-purefacts/our-process', desc: 'When the deal closes, you earn a referral reward.', isPlatform: false }
    ]
  },
  features: {
    eyebrow: 'WHO IT’S FOR',
    titleLine1: 'Who it’s for',
    titleAccent: 'to partnership',
    description: 'Perfect for consultants, advisors, industry influencers, and organizations that want to recommend best-in-class solutions to their network.',
    steps: [
      { icon: 'fa-cubes', title: 'Consulting Firms', body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', count: '01' },
      { icon: 'fa-key', title: 'Implementation Specialist', body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', count: '02' },
      { icon: 'fa-plane-departure', title: 'Consulting Firms', body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', count: '03' },
      { icon: 'fa-angles-up', title: 'Implementation Specialist', body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', count: '04' }
    ]
  },
  lastBlock: {
    titleLine1: 'Ready to implement',
    titleHighlight: 'success?',
    description: 'Partner with PureFacts to deliver exceptional client outcomes.',
    cta: 'Become a Referral Partner'
  }
};

export default function ReferralPartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <PartnerTemplate data={referralData} />
    </>
  )
}
