import type { Metadata } from 'next'
import PersonaPageClient, { type PersonaPageProps } from '@/components/sections/PersonaPageClient'

export const metadata: Metadata = {
  title: 'Revenue Performance for Finance Teams | PureFacts',
  description:
    'PureFacts helps Finance teams gain greater visibility into revenue performance, protect margin, improve collection discipline, and build a more trustworthy foundation for profitable growth.',
}

const props: PersonaPageProps = {
  persona:      'finance',
  eyebrow:      'Finance',
  headline:     'A more',
  accentPhrase: 'predictable, scalable',
  headlineSuffix: 'revenue engine.',
  body:         'PureFacts helps Finance teams gain greater visibility into revenue performance, protect margin, improve collection discipline, and build a more trustworthy foundation for profitable growth.',
  accent:       '#3b84ff',
  aRgb:         '59,132,255',
  bgTint:       '#140f0c',

  statsBandHeadline: 'PureFacts is built for high volume and high stakes',

  whyHeadline:   'Why this matters to finance',
  whyAccentWord: 'finance',
  whyParagraphs: [
    'Revenue performance is a finance issue as much as an operational one. When billing is too complex, pricing discipline is inconsistent, or collection processes are fragmented, the business feels the impact in margin, forecasting confidence, and enterprise value.',
    'For finance teams, the challenge is not simply getting revenue through the system. It is knowing whether the firm is capturing the full value it has earned, collecting it efficiently, and managing it with the level of rigor investors, boards, and leadership teams now expect.',
    'PureFacts helps finance move from limited visibility and reactive workarounds to a more transparent, controlled, and scalable revenue model.',
  ],

  pressuresHeadline: 'The pressures finance teams are up against',
  pressureCards: [
    { icon: 'fa-eye-slash',              title: 'Limited revenue visibility',  desc: 'Finance teams often lack a single, trusted view of how revenue is billed, adjusted, collected, and reported across the firm, making confident forecasting difficult.' },
    { icon: 'fa-droplet-slash',          title: 'Margin leakage',              desc: 'Billing errors, mis-priced mandates, and uncontrolled discounting quietly erode EBITDA. The losses compound across thousands of accounts before they surface.' },
    { icon: 'fa-chart-bar',              title: 'Forecasting uncertainty',     desc: 'When billing is fragmented and compensation data is disconnected, Finance cannot build a reliable revenue forecast or explain variance with confidence.' },
  ],

  needsHeadline: 'What finance needs from a better revenue model',
  needCards: [
    { title: 'Greater confidence in the economics',      body: 'Finance teams need clearer visibility into how revenue is billed, adjusted, collected, distributed, and reported.' },
    { title: 'Stronger control over margin performance', body: 'That includes reducing spillage before revenue is billed, tightening guardrails around pricing, and limiting avoidable collection drag after billing occurs.' },
    { title: 'Clearer link between operations and enterprise value', body: 'Revenue operations should not just keep the business running. They should improve predictability, expand margin, and support a stronger valuation story.' },
  ],

  solutionCards: [
    { icon: 'fa-magnifying-glass-chart', title: 'Visibility into revenue performance', desc: 'Understand exactly how revenue is billed, adjusted, collected, and reported, with the transparency needed to act with confidence.' },
    { icon: 'fa-scissors',              title: 'Protect margin before it leaks',      desc: 'Tighten guardrails around pricing, reduce spillage before billing, and limit collection drag that quietly erodes EBITDA.' },
    { icon: 'fa-arrow-trend-up',        title: 'Strengthen enterprise value',          desc: 'Improve forecasting confidence, expand margin predictability, and build the revenue foundation that supports a stronger valuation story.' },
  ],

  ctaFeatures: [
    { icon: 'fa-magnifying-glass-chart', title: 'Visibility into revenue performance', desc: 'Understand exactly how revenue is billed, adjusted, collected, and reported, with the transparency needed to act with confidence.' },
    { icon: 'fa-scissors',              title: 'Protect margin before it leaks',      desc: 'Tighten guardrails around pricing, reduce spillage before billing, and limit collection drag that quietly erodes EBITDA.' },
    { icon: 'fa-arrow-trend-up',        title: 'Strengthen enterprise value',          desc: 'Improve forecasting confidence, expand margin predictability, and build the revenue foundation that supports a stronger valuation story.' },
  ],
  ctaHeadline:     'See how PureFacts can help your',
  ctaAccentPhrase: 'revenue perform.',
  ctaBody:         'Manage revenue with greater precision, trustworthiness, and scale. Explore the industry challenges, solutions, and platform approach behind a stronger revenue operating model.',
}

export default function FinancePage() {
  return <PersonaPageClient {...props} />
}
