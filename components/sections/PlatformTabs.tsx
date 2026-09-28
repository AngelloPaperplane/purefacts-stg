'use client'

import { useState } from 'react'
import Image from 'next/image'

const tabs = [
  {
    id: 'incent',
    label: 'Incent',
    icon: '/icons/incent.svg',
    left: 'Ensure timely, transparent payouts that build trust across clients, advisors, and partners.',
    quote: 'At one global asset manager, implementing real-time compensation dashboards and payout transparency cut advisor-compensation disputes by 85 percent.',
    source: '— PureFacts client case study',
  },
  {
    id: 'price',
    label: 'Price',
    icon: '/icons/price.svg',
    left: 'Design profitable, transparent fee and discount structures that stop front-end revenue spillage.',
    quote: 'Morgan Stanley and Oliver Wyman estimate that a typical $500 billion asset manager can unlock roughly $50 million in extra revenue by adopting a more disciplined pricing framework.',
    source: '— Morgan Stanley / Oliver Wyman, Global Wealth and Asset Management Report',
  },
  {
    id: 'calculate',
    label: 'Calculate',
    icon: '/icons/calculate.svg',
    left: 'Accurately model complex fee and compensation structures, no spreadsheets, no guesswork.',
    right: 'Handle every fee logic, breakpoint, exemption, and compensation rule within a single trusted engine.',
    isText: true,
  },
  {
    id: 'collect',
    label: 'Collect',
    icon: '/icons/collect.svg',
    left: 'Capture every dollar you have earned, on time and in full, without friction or error.',
    quote: 'Studies of finance operations show that automating billing and document processing can reach around 99 percent accuracy while cutting processing costs by 60 to 80 percent.',
    source: '— IOFM, Ardent Partners and Deloitte finance automation research',
  },
  {
    id: 'distribute',
    label: 'Distribute',
    icon: '/icons/distribute.svg',
    left: 'Reward the right behaviors with performance-driven compensation that fuels growth.',
    right: 'Align advisor incentives with enterprise objectives through structured payout, tracking, and transparency.',
    isText: true,
  },
  {
    id: 'optimize',
    label: 'Optimize',
    icon: '/icons/optimize.svg',
    left: 'Continuously improve with real-time insights that unlock hidden value and eliminate waste.',
    right: 'Spot leakage, identify anomalies, and surface opportunities for margin expansion and operational efficiency.',
    isText: true,
  },
]

export default function PlatformTabs() {
  const [active, setActive] = useState(tabs[0].id)
  const tab = tabs.find(t => t.id === active)!

  return (
    <div className="mt-10">
      {/* Tab row */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2.5 px-5 py-4 text-base font-semibold transition-colors ${
              active === t.id
                ? 'border-b-2 border-brand-blue text-brand-blue'
                : 'text-gray-500 hover:text-brand-off-black'
            }`}
          >
            <span className="relative h-6 w-6 shrink-0">
              <Image src={t.icon} alt="" fill className="object-contain" />
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — gradient border */}
        <div className="bg-brand-gradient p-px">
          <div className="flex h-full items-center bg-white p-10">
            <p className="text-2xl font-bold leading-snug text-brand-off-black lg:text-3xl">
              {tab.left}
            </p>
          </div>
        </div>

        {/* Right — original gray */}
        <div className="flex flex-col justify-center bg-gray-50 p-8">
          {tab.isText ? (
            <p className="text-lg font-normal leading-relaxed text-brand-off-black lg:text-2xl">{tab.right}</p>
          ) : (
            <>
              <blockquote className="text-lg font-normal leading-relaxed text-brand-off-black lg:text-2xl">
                "{tab.quote}"
              </blockquote>
              <cite className="mt-4 block text-sm font-semibold not-italic text-gray-400">
                {tab.source}
              </cite>
            </>
          )}
        </div>
      </div>
    </div>
  )
}