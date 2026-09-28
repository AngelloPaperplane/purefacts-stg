'use client'

import { useEffect, useRef } from 'react'

const PORTAL_ID = '3218774'
const FORM_ID   = '3d3590c3-54ae-4c0a-8bab-ff44991d44cc'

export default function NewsletterForm() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return

    const load = () => {
      if (!(window as any).hbspt) return
      ;(window as any).hbspt.forms.create({
        portalId: PORTAL_ID,
        formId:   FORM_ID,
        target:   '#newsletter-hs-form',
        cssClass: 'hs-newsletter-form',
      })
    }

    if ((window as any).hbspt) {
      load()
    } else {
      const script = document.createElement('script')
      script.src = '//js.hsforms.net/forms/embed/v2.js'
      script.async = true
      script.onload = load
      document.head.appendChild(script)
    }
  }, [])

  return <div id="newsletter-hs-form" ref={ref} />
}