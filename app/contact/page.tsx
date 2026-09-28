import type { Metadata } from 'next'
import ContactCanvas from '@/components/sections/ContactCanvas'
import HubSpotContactForm from '@/components/sections/HubSpotContactForm'
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Contact Us | PureFacts Financial Solutions',
  description:
    'Talk to our experts and see how PureFacts helps you turn revenue operations into a strategic growth advantage.',
}

const OFFICES = [
  {
    city: 'Toronto',
    tag: 'HQ',
    lines: ['48 Yonge Street', 'Suite 900', 'Toronto, Ontario', 'M5E 1G6'],
    maps: 'https://maps.google.com/?q=48+Yonge+Street+Toronto',
  },
  {
    city: 'New York',
    tag: null,
    lines: ['230 Park Ave', 'Suite 314', 'New York, NY', '10169'],
    maps: 'https://maps.google.com/?q=230+Park+Ave+New+York',
  },
  {
    city: 'Lisbon',
    tag: null,
    lines: ['R. do Mar Vermelho N°2-1.2,', 'Lisboa', 'Portugal', '1990-152'],
    maps: 'https://maps.google.com/?q=Rua+do+Mar+Vermelho+Lisboa',
  },
  {
    city: 'Zurich',
    tag: null,
    lines: ['Baslerstrasse 60', 'Zürich', 'Switzerland', '8048'],
    maps: 'https://maps.google.com/?q=Baslerstrasse+60+Zürich',
  },
]

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/contact" />

      {/* ── 1. Hero + form ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-[#110e0c]"
        aria-label="Contact PureFacts"
      >

        {/* Animated canvas background */}
        <ContactCanvas />

        {/* Gradient rule at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 h-px"
          style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
          aria-hidden="true"
        />

        {/* Two-column content row */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-12 sm:py-14 lg:flex-row lg:items-center lg:gap-20">

          {/* Left: copy + contact */}
          <div className="flex-1 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4 sm:mb-5">
              Get In Touch
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
              See How Much Revenue<br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
              >
                You&apos;re Missing
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base text-gray-300 leading-relaxed sm:mt-6 sm:text-lg">
              Talk to our experts and see how PureFacts helps you turn revenue operations
              into a strategic growth advantage.
            </p>
            <div
              className="my-6 h-px w-16 sm:my-8"
              style={{ background: 'linear-gradient(90deg, #FB5607, #4760FF)' }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-4">
              <a
                href="mailto:info@purefacts.com"
                className="group flex items-center gap-4 text-gray-200 hover:text-white transition-colors"
                aria-label="Email PureFacts at info@purefacts.com"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  aria-hidden="true"
                >
                  <i
                    className="fa-solid fa-envelope text-base"
                    style={{ background: 'linear-gradient(135deg,#FB5607,#4760FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  />
                </span>
                <span className="text-base font-medium group-hover:underline underline-offset-4">
                  info@purefacts.com
                </span>
              </a>
              <a
                href="tel:18885969338"
                className="group flex items-center gap-4 text-gray-200 hover:text-white transition-colors"
                aria-label="Call PureFacts at 1-888-596-9338"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  aria-hidden="true"
                >
                  <i
                    className="fa-solid fa-phone text-base"
                    style={{ background: 'linear-gradient(135deg,#FB5607,#4760FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  />
                </span>
                <span className="text-base font-medium group-hover:underline underline-offset-4">
                  1-888-596-9338
                </span>
              </a>
            </div>
          </div>
          {/* end left col */}

          {/* Right: form card with gradient border */}
          <div className="w-full lg:w-[480px] shrink-0">
            <div
              className="p-[2px]"
              style={{ background: 'linear-gradient(135deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
            >
              <div
                style={{
                  background: 'rgba(17,14,12,0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-1">Request A Demo</h2>
                  <p className="text-sm text-gray-400 mb-5 sm:mb-6">
                    Fill in your details and we&apos;ll be in touch within one business day.
                  </p>
                  <HubSpotContactForm />
                </div>
              </div>
            </div>
          </div>
          {/* end right col */}

        </div>
        {/* end content row */}

      </section>
      {/* end hero */}

      {/* ── 2. Global offices ────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-20" aria-label="Global offices">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-brand-off-black sm:text-3xl">Our Offices</h2>
          <p className="mt-3 max-w-2xl text-base text-gray-600">
            Our global presence extends across some of the world&apos;s leading financial centers,
            where our regional teams are ready to support your journey toward wealth management
            excellence.
          </p>
          <div
            className="h-px w-full mt-8 mb-8 sm:mt-10 sm:mb-10"
            style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607, #4760FF, #0DCCFF)' }}
            aria-hidden="true"
          />
          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-3 lg:grid-cols-4">
            {OFFICES.map(office => (
              <address key={office.city} className="flex flex-col gap-2 not-italic">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-bold text-brand-off-black text-base sm:text-lg">{office.city}</h3>
                  {office.tag && (
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5"
                      style={{ background: 'linear-gradient(90deg, #FACC22, #FB5607)', color: '#111' }}
                      aria-label="Headquarters"
                    >
                      {office.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {office.lines.map((line, i) => (
                    <p key={i} className="text-sm text-gray-500">{line}</p>
                  ))}
                </div>
                <a
                  href={office.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm font-semibold text-brand-blue hover:underline underline-offset-4"
                  aria-label={`Get directions to PureFacts ${office.city} office`}
                >
                  Get directions
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </address>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}