import type { Metadata } from 'next'
import PersonaPageClient, { type PersonaPageProps } from '@/components/sections/PersonaPageClient'

export const metadata: Metadata = {
  title: 'COO Financial Operations Automation | PureFacts',
  description:
    'PureFacts helps Operations teams reduce strain, improve control, and scale revenue processes more effectively across billing, compensation, reporting, and collection.',
}

const props: PersonaPageProps = {
  persona:      'operations',
  eyebrow:      'Operations',
  headline:     'Zero-tolerance',
  accentPhrase: 'for error',
  headlineSuffix: 'operating model.',
  body:         'PureFacts helps Operations teams reduce strain, improve control, and scale revenue processes more effectively across billing, compensation, reporting, and collection.',
  accent:       '#fb5607',
  aRgb:         '251,86,7',
  bgTint:       '#140f0c',

  statsBandHeadline: 'Operations teams trust us to deliver results',

  whyHeadline:   'Why this matters to operations',
  whyAccentWord: 'operations',
  whyParagraphs: [
    'Revenue operations are an operating model issue. When critical processes depend on fragmented systems, manual reconciliations, and institutional memory, scale becomes harder, risk rises, and teams spend too much energy keeping the machine running.',
    'Operations teams see the hidden effort behind billing, compensation, reporting, and collection. They see the heroics required to move revenue through the business, the workarounds that have become normal, and the strain those conditions place on the team.',
    'PureFacts helps Operations replace reactive effort with a more controlled, more consistent, and more scalable revenue operating model.',
  ],

  pressuresHeadline: 'The operating challenges behind revenue performance',
  pressureCards: [
    { icon: 'fa-gears',              title: 'Manual process dependency',    desc: 'Critical revenue workflows depend on individual knowledge, recurring workarounds, and manual reconciliations that accumulate fragility as volume grows.' },
    { icon: 'fa-puzzle-piece',       title: 'Disconnected systems',         desc: 'Billing, compensation, and reporting live in separate tools. Each handoff between systems creates reconciliation risk and slows the team down.' },
    { icon: 'fa-person-running',     title: 'Scaling through heroics',      desc: 'When the business grows, the operating model should absorb the load. Instead, Operations absorbs it, manually, at the cost of quality and team capacity.' },
  ],

  needsHeadline: 'What operators need from a better revenue model',
  needCards: [
    { title: 'Less dependence on heroics',              body: 'The goal is not simply to work harder. It is to build a system that works more reliably without constant manual intervention.' },
    { title: 'More consistency across teams and workflows', body: 'Billing, compensation, reporting, and collection should operate as connected disciplines, not isolated activities patched together over time.' },
    { title: 'A stronger path to scale',                body: 'As the business grows, the revenue operating model should create control and clarity, not more friction.' },
  ],

  solutionCards: [
    { icon: 'fa-gears',              title: 'Automate the manual work',     desc: 'Replace recurring workarounds and manual reconciliations with governed workflows that run consistently without constant intervention.' },
    { icon: 'fa-diagram-project',    title: 'Connect billing and compensation', desc: 'Bring billing, compensation, reporting, and collection into a unified operating model instead of isolated processes patched together over time.' },
    { icon: 'fa-arrow-up-right-dots',title: 'Build a model that scales',    desc: 'As the business grows, your revenue operating model should create clarity and control, not more complexity and more heroics.' },
  ],

  ctaFeatures: [
    { icon: 'fa-gears',              title: 'Automate the manual work',     desc: 'Replace recurring workarounds and manual reconciliations with governed workflows that run consistently without constant intervention.' },
    { icon: 'fa-diagram-project',    title: 'Connect billing and compensation', desc: 'Bring billing, compensation, reporting, and collection into a unified operating model instead of isolated processes patched together over time.' },
    { icon: 'fa-arrow-up-right-dots',title: 'Build a model that scales',    desc: 'As the business grows, your revenue operating model should create clarity and control, not more complexity and more heroics.' },
  ],
  ctaHeadline:     'See how PureFacts can help your',
  ctaAccentPhrase: 'revenue perform.',
  ctaBody:         'Manage revenue with greater precision, trustworthiness, and scale. Explore the industry challenges, solutions, and platform approach behind a stronger revenue operating model.',
}

export default function OperationsPage() {
  return <PersonaPageClient {...props} />
}
