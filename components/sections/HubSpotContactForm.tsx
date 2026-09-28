'use client'

import { useEffect } from 'react'

// TODO: Replace portalId and formId with your actual HubSpot values
const PORTAL_ID = '3218774'
const FORM_ID   = 'b820aed5-c4fe-4c71-8c4f-dc9a42cf4a8f'

export default function HubSpotForm() {
  useEffect(() => {
    // Load HubSpot forms script if not already present
    if (document.getElementById('hs-forms-script')) {
      createForm()
      return
    }
    const script = document.createElement('script')
    script.id = 'hs-forms-script'
    script.src = '//js.hsforms.net/forms/embed/v2.js'
    script.charset = 'utf-8'
    script.type = 'text/javascript'
    script.onload = createForm
    document.body.appendChild(script)

    function createForm() {
      if ((window as any).hbspt) {
        ;(window as any).hbspt.forms.create({
          portalId: PORTAL_ID,
          formId: FORM_ID,
          target: '#hubspot-form-target',
          cssClass: 'hs-contact-form',
        })
      }
    }
  }, [])

  return <div id="hubspot-form-target" className="hs-form-wrapper" />
}