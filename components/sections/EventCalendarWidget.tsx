'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@sanity/client'
import EventCard from './EventCard'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'kuepsuf9',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar:    'bg-brand-blue',
  conference: 'bg-brand-orange',
  hosted:     'bg-purple-500',
}

const EVENT_FIELDS = `
  _id, title, slug, eventType, excerpt,
  startDate, endDate, location, registrationUrl, ctaLabel,
  coverImage,
  speakers[]{ name, title, company, photo }
`

interface SanityEvent {
  _id: string
  title: string
  slug: { current: string }
  eventType?: string
  coverImage?: object
  excerpt?: string
  startDate: string
  endDate?: string
  location?: string
  registrationUrl?: string
  ctaLabel?: string
  speakers?: { name: string; title?: string; company?: string; photo?: object }[]
}

interface Props {
  view?:       'calendar' | 'list' | 'toggle'
  limit?:      number
  filter?:     'upcoming' | 'past' | 'all'
  title?:      string
  showViewAll?: boolean
}

export default function EventCalendarWidget({
  view: initialView = 'toggle',
  limit,
  filter = 'upcoming',
  title,
  showViewAll = true,
}: Props) {
  const [activeView, setActiveView]     = useState<'calendar' | 'list'>(initialView === 'toggle' ? 'list' : initialView)
  const [events, setEvents]             = useState<SanityEvent[]>([])
  const [loading, setLoading]           = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<SanityEvent | null>(null)

  useEffect(() => { fetchEvents() }, [filter, currentMonth, activeView])

  async function fetchEvents() {
    setLoading(true)
    const now = new Date().toISOString()
    let query = ''
    let params: Record<string, string | number> = {}

    if (activeView === 'calendar') {
      const year       = currentMonth.getFullYear()
      const month      = currentMonth.getMonth()
      const monthStart = new Date(year, month, 1).toISOString()
      const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      query  = `*[_type == "event" && startDate >= $monthStart && startDate <= $monthEnd] | order(startDate asc) { ${EVENT_FIELDS} }`
      params = { monthStart, monthEnd }
    } else if (filter === 'upcoming') {
      query  = `*[_type == "event" && startDate >= $now] | order(startDate asc) ${limit ? `[0...${limit}]` : ''} { ${EVENT_FIELDS} }`
      params = { now }
    } else if (filter === 'past') {
      query  = `*[_type == "event" && startDate < $now] | order(startDate desc) ${limit ? `[0...${limit}]` : ''} { ${EVENT_FIELDS} }`
      params = { now }
    } else {
      query  = `*[_type == "event"] | order(startDate asc) ${limit ? `[0...${limit}]` : ''} { ${EVENT_FIELDS} }`
    }

    try {
      const data = await sanityClient.fetch<SanityEvent[]>(query, params)
      setEvents(data || [])
    } catch (e) {
      console.error('EventCalendarWidget fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Calendar helpers ───────────────────────────────────────────────────────
  function getCalendarDays() {
    const year      = currentMonth.getFullYear()
    const month     = currentMonth.getMonth()
    const firstDay  = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }

  function eventsOnDay(day: number) {
    const year  = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    return events.filter(e => {
      const d = new Date(e.startDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  function isToday(day: number) {
    const today = new Date()
    return today.getFullYear() === currentMonth.getFullYear()
      && today.getMonth() === currentMonth.getMonth()
      && today.getDate() === day
  }

  function handleDayClick(day: number) {
    const dateKey  = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`
    const dayEvents = eventsOnDay(day)
    if (dayEvents.length === 0) { setSelectedDate(null); setSelectedEvent(null); return }
    if (selectedDate === dateKey) { setSelectedDate(null); setSelectedEvent(null) }
    else { setSelectedDate(dateKey); setSelectedEvent(dayEvents[0]) }
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {title && <h2 className="text-2xl font-bold text-brand-off-black">{title}</h2>}
        <div className="flex items-center gap-3 sm:ml-auto">
          {initialView === 'toggle' && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeView === 'list' ? 'bg-white shadow text-brand-off-black' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fa-solid fa-list text-xs" /> List
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeView === 'calendar' ? 'bg-white shadow text-brand-off-black' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fa-regular fa-calendar text-xs" /> Calendar
              </button>
            </div>
          )}
          {showViewAll && (
            <a href="/events" className="text-sm font-semibold text-brand-blue hover:underline flex items-center gap-1">
              View All <i className="fa-solid fa-arrow-right text-xs" />
            </a>
          )}
        </div>
      </div>

      {/* Calendar month nav */}
      {activeView === 'calendar' && (
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fa-solid fa-chevron-left text-sm text-gray-600" />
          </button>
          <span className="font-semibold text-brand-off-black">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <i className="fa-solid fa-chevron-right text-sm text-gray-600" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── CALENDAR VIEW ── */}
          {activeView === 'calendar' && (
            <div>
              <div className="grid grid-cols-7 mb-1">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                {getCalendarDays().map((day, i) => {
                  const dayEvents = day ? eventsOnDay(day) : []
                  const dateKey   = day ? `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}` : ''
                  const isSelected = selectedDate === dateKey
                  return (
                    <div
                      key={i}
                      onClick={() => day && handleDayClick(day)}
                      className={`
                        bg-white min-h-[72px] p-1.5 flex flex-col transition-colors
                        ${day ? 'cursor-pointer hover:bg-blue-50' : ''}
                        ${isSelected ? '!bg-blue-50 ring-2 ring-inset ring-brand-blue' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                            isToday(day) ? 'bg-brand-blue text-white' : 'text-gray-700'
                          }`}>
                            {day}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            {dayEvents.slice(0, 2).map(e => (
                              <div
                                key={e._id}
                                className={`text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate font-medium ${
                                  EVENT_TYPE_COLORS[e.eventType || ''] || 'bg-gray-400'
                                }`}
                                title={e.title}
                              >
                                {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[10px] text-gray-400 font-medium">+{dayEvents.length - 2} more</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Selected event card */}
              {selectedEvent && (
                <div className="mt-4">
                  <EventCard event={selectedEvent} variant="default" />
                </div>
              )}

              {events.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No events this month.</p>
              )}
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {activeView === 'list' && (
            <>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fa-regular fa-calendar-xmark text-3xl text-gray-300 mb-3 block" />
                  <p className="text-gray-400 text-sm">No {filter === 'past' ? 'past' : 'upcoming'} events at this time.</p>
                  {showViewAll && filter === 'upcoming' && (
                    <a href="/events?tab=past" className="text-sm text-brand-blue hover:underline mt-2 inline-block">
                      View past events
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {events.map(event => (
                    <EventCard key={event._id} event={event} variant="compact" />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}