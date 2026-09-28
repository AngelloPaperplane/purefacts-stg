'use client'

import { useEffect, useRef } from 'react'

interface Props {
  formId: string
  portalId?: string
  region?: string
}

export default function HubSpotForm({ formId, portalId = '3218774', region = 'na1' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const created = useRef(false)

  useEffect(() => {
    created.current = false

    function initForm() {
      if (created.current || !containerRef.current) return
      const win = window as any
      if (!win.hbspt?.forms?.create) return
      created.current = true
      win.hbspt.forms.create({
        portalId,
        formId,
        region,
        target: `#hs-form-${formId}`,
      })
    }

    // If hbspt is already present (loaded by global layout script), init immediately
    if ((window as any).hbspt?.forms?.create) {
      initForm()
      return
    }

    // Otherwise inject the script and wait
    const existing = document.querySelector('script[src*="hsforms.net"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = '//js.hsforms.net/forms/embed/v2.js'
      script.charset = 'utf-8'
      script.defer = true
      document.head.appendChild(script)
    }

    // Poll until hbspt is ready
    const interval = setInterval(() => {
      if ((window as any).hbspt?.forms?.create) {
        clearInterval(interval)
        initForm()
      }
    }, 150)

    return () => clearInterval(interval)
  }, [formId, portalId, region])

  return (
    <div
      id={`hs-form-${formId}`}
      ref={containerRef}
      className="hs-form-wrapper"
    />
  )
}