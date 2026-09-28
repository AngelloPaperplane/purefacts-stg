import type { Metadata } from 'next'
import PersonaPageClient, { type PersonaPageProps } from '@/components/sections/PersonaPageClient'

export const metadata: Metadata = {
  title: 'Wealth Management Revenue Solutions | PureFacts',
  description:
    'PureFacts helps Heads of Wealth strengthen pricing discipline, optimize advisor compensation, improve billing confidence, and support a better balance between firm profitability and advisor satisfaction.',
}

const props: PersonaPageProps = {
  persona:      'head-of-wealth',
  eyebrow:      'Head of Wealth',
  headline:     'A revenue model built for',
  accentPhrase: 'growth and scalability.',
  body:         'PureFacts helps Heads of Wealth strengthen pricing discipline, optimize advisor compensation, improve billing confidence, and support a better balance between firm profitability and advisor satisfaction.',
  accent:       '#ffb30c',
  aRgb:         '255,179,12',
  bgTint:       '#140f0c',

  statsBandHeadline: "Trusted by the world's leading wealth firms",

  whyHeadline:   'Why this matters to the Head of Wealth',
  whyAccentWord: 'Head of Wealth',
  whyParagraphs: [
    'Revenue performance shapes growth, advisor confidence, and the client experience. When pricing discipline is weak, compensation is not optimized, or billing creates friction, the effects show up across advisor satisfaction, profitability, and retention.',
    'Heads of Wealth need revenue operations that support the business they are trying to build, not processes that quietly work against it. That means billing accurately, paying advisors correctly, reducing spillage, and giving leaders confidence that revenue is being managed in a way that supports growth.',
    'PureFacts helps Heads of Wealth turn revenue operations into a strategic lever for advisor performance, stronger economics, and scalable growth.',
  ],

  pressuresHeadline: 'The pressures wealth leaders are navigating',
  pressureCards: [
    { icon: 'fa-tag',                   title: 'Pricing discipline gaps',       desc: 'Excessive discounting and inconsistent pricing behavior go undetected when pricing decisions live outside any governed system, eroding margin silently across the book.' },
    { icon: 'fa-hand-holding-dollar',   title: 'Advisor compensation friction', desc: 'Complex payout plans, shadow accounting, and compensation errors create trust issues with advisors and consume operational bandwidth on reconciliation.' },
    { icon: 'fa-scale-balanced',        title: 'Balancing growth and profitability', desc: 'Heads of Wealth must grow the book while protecting margin. When revenue infrastructure is fragile, growth accelerates risk rather than reducing it.' },
  ],

  needsHeadline: 'What Heads of Wealth need from a better revenue model',
  needCards: [
    { title: 'Stronger pricing discipline and advisor confidence', body: "Advisors need confidence in the value they deliver, and leaders need confidence that pricing behavior supports the firm's economic goals." },
    { title: 'More trust in billing and compensation',             body: 'Clients should be billed correctly. Advisors should be paid accurately and promptly. Teams should not have to spend unnecessary time checking the system.' },
    { title: 'A model that supports both profitability and advisor satisfaction', body: 'The right approach helps firms maximize revenue potential while strengthening the advisor experience, not compromising it.' },
  ],

  solutionCards: [
    { icon: 'fa-tag',                   title: 'Strengthen pricing discipline',  desc: "Give advisors confidence in the value they deliver and leaders confidence that pricing behavior is supporting the firm's economic goals." },
    { icon: 'fa-hand-holding-dollar',   title: 'Pay advisors accurately',        desc: 'Eliminate compensation errors, reduce shadow accounting, and give advisors the trust and transparency that supports retention and performance.' },
    { icon: 'fa-scale-balanced',        title: 'Balance profitability and satisfaction', desc: 'Maximize revenue potential while strengthening the advisor experience. Not by compromising one for the other, but by improving both together.' },
  ],

  ctaFeatures: [
    { icon: 'fa-tag',                   title: 'Strengthen pricing discipline',  desc: "Give advisors confidence in the value they deliver and leaders confidence that pricing behavior is supporting the firm's economic goals." },
    { icon: 'fa-hand-holding-dollar',   title: 'Pay advisors accurately',        desc: 'Eliminate compensation errors, reduce shadow accounting, and give advisors the trust and transparency that supports retention and performance.' },
    { icon: 'fa-scale-balanced',        title: 'Balance profitability and satisfaction', desc: 'Maximize revenue potential while strengthening the advisor experience. Not by compromising one for the other, but by improving both together.' },
  ],
  ctaHeadline:     'See how PureFacts can help your',
  ctaAccentPhrase: 'revenue perform.',
  ctaBody:         'Manage revenue with greater precision, trustworthiness, and scale. Explore the industry challenges, solutions, and platform approach behind a stronger revenue operating model.',
}

export default function HeadOfWealthPage() {
  return <PersonaPageClient {...props} />
}
