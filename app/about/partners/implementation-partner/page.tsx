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
    titleLine1: 'Implementation Partner',
    titleAccent: 'Implement. Enable. Succeed.',
    description: 'Deliver exceptional implementation experiences and help clients accelerate time to value with PureFacts.',
    cta: 'Become a Implementation Partner',
    contactText: 'Contact Us',
    contactLink: '/contact'
  },
  overview: {
    eyebrow: 'Partner program',
    title: 'Overview',
    description: 'Implementation Partners bring deep expertise in revenue management and help our mutual clients succeddfully deploy and adopt the PureFacts platform.',
    bullets: [
      { label: 'Certified enablement & training', icon: 'fa-circle-check' },
      { label: 'Co-marketingopportunities', icon: 'fa-circle-check' },
      { label: 'Implementation reosurces & tools', icon: 'fa-circle-check' },
      { label: 'Ongoing partner support', icon: 'fa-circle-check' }
    ]
  },
  expertise: {
    title: 'How it Works',
    cards: [
      { icon: 'fa-circle-check', label: 'Onboard', href: '/why-purefacts/our-process', desc: 'Complete onboarding and get certinec The PureFActs platfoms.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Deliver', href: '/why-purefacts/our-process', desc: 'Lead successful implementations and drive client outcomes.', isPlatform: false },
      { icon: 'fa-circle-check', label: 'Grow', href: '/why-purefacts/our-process', desc: 'Build long-term relationships and grow your business.', isPlatform: false }
    ]
  },
  features: {
    eyebrow: 'WHO IT’S FOR',
    titleLine1: 'Who it’s for',
    titleAccent: '',
    description: 'Implementation firms and consultancies with experience deploying enterprise software solutions for wealth management firms.',
    steps: [
      { icon: 'fa-cubes', title: 'Consulting Firms', body: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.', count: '' },
      { icon: 'fa-key', title: 'Implementation Specialist', body: 'Our team reviews your submission and follows up.', count: '' },
      { icon: 'fa-plane-departure', title: 'Onboard', body: 'Complete onboarding and gain partner access.', count: '' },
      { icon: 'fa-angles-up', title: 'Grow', body: 'Start collaborating, driving value and growing together.', count: '' }
    ]
  },
  lastBlock: {
    titleLine1: 'Ready to implement',
    titleHighlight: 'success?',
    description: 'Partner with PureFacts to deliver exceptional client outcomes.',
    cta: 'Become an Implementation Partner'
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
