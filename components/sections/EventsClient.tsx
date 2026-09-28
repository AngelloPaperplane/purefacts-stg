'use client'

import { useState, useMemo } from 'react'
import EventCard from './EventCard'
import EventCalendarWidget from './EventCalendarWidget'

const EVENT_TYPE_OPTIONS = [
  { label: 'All Types',   value: '' },
  { label: 'Webinar',     value: 'webinar' },
  { label: 'Conference',  value: 'conference' },
  { label: 'Hosted',      value: 'hosted' },
]

type ViewMode = 'list' | 'calendar'
type Tab = 'upcoming' | 'past'

interface Props {
  upcoming: any[]
  past: any[]
}

export default function EventsClient({ upcoming, past }: Props) {
  const [tab, setTab]                   = useState<Tab>('upcoming')
  const [view, setView]                 = useState<ViewMode>('list')
  const [typeFilter, setTypeFilter]     = useState('')

  const events = tab === 'upcoming' ? upcoming : past

  const filtered = useMemo(() => {
    if (!typeFilter) return events
    return events.filter(e => e.eventType === typeFilter)
  }, [events, typeFilter])

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Upcoming / Past tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['upcoming', 'past'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-brand-off-black text-white'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {(t === 'upcoming' ? upcoming : past).length}
              </span>
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Event type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 cursor-pointer"
            >
              {EVENT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down text-xs text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* List / Calendar toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('list')}
              title="List view"
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                view === 'list' ? 'bg-brand-off-black text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <i className="fa-solid fa-list text-xs" />
            </button>
            <button
              onClick={() => setView('calendar')}
              title="Calendar view"
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                view === 'calendar' ? 'bg-brand-off-black text-white' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <i className="fa-regular fa-calendar text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* ── List view ── */}
      {view === 'list' && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <i className="fa-regular fa-calendar-xmark text-4xl text-gray-300 mb-4 block" />
              <p className="text-gray-500 font-medium">
                No {typeFilter ? EVENT_TYPE_OPTIONS.find(c => c.value === typeFilter)?.label : ''} {tab} events found.
              </p>
              {tab === 'upcoming' && (
                <button onClick={() => setTab('past')} className="mt-3 text-sm text-brand-blue hover:underline">
                  Browse past events
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(event => (
                <EventCard key={event._id} event={event} variant="default" />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Calendar view ── */}
      {view === 'calendar' && (
        <EventCalendarWidget
          view="calendar"
          filter={tab}
          showViewAll={false}
        />
      )}
    </div>
  )
}