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
    aRgb: '237,101,208',
    accent: '#ED65D0',
    heroIcon: '/icons/rosa.png'
  },
  hubspot: {
    portalId: '3218774',
    formId: 'd405f422-5242-4c81-b8ef-a3659048a899'
  },
  hero: {
    eyebrow: 'partner type',
    titleLine1: 'Technology &\u00A0Integration\u00A0Partner',
    titleAccent: 'Integrate. Innovate. Togeter.',
    description: 'Build and integrate solutions that extend the value of PureFacts and create seamless experiences for mutual clients.',
    cta: 'Become a Referral Partner',
    contactText: 'Contact Us',
    contactLink: '/contact'
  },
  overview: {
    eyebrow: 'Partner program',
    title: 'Overview',
    description: 'Technology & integration Partners build integrations and complementary solution that amplify the power of PureFacts across the revenue lifecycle.',
    bullets: [
      { label: 'API access & developer resources', icon: 'fa-circle-check' },
      { label: 'Co-sell & go-to-market support', icon: 'fa-circle-check' },
      { label: 'Visibility in our ecosystem', icon: 'fa-circle-check' },
      { label: 'Technical & product collaboration', icon: 'fa-circle-check' }
    ]
  },
  expertise: {
    title: 'How it Works',
    cards: [
      { icon: 'fa-circle-check', label: 'Build', href: '#', desc: 'Build or integrate your solution with the PureFacts platform.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Validate', href: '#', desc: 'Collaborate on validation, testing, and joint go-to market.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Scale', href: '#', desc: 'Drive adoption together and deliver more value to clients.', isPlatform: false }
    ]
  },
  features: {
    eyebrow: 'WHO IT’S FOR',
    titleLine1: 'Who it’s for',
    titleAccent: 'to partnership',
    description: 'ISVs, SaaS companies, and technology providers building solutions that integrate with or extend PureFacts.',
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

export default function ReferralPartnerPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/about/partner" />
      <PartnerTemplate data={referralData} />
    </>
  )
}
