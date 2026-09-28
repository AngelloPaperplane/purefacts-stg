import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata = {
  title: 'Terms of Use | PureFacts',
  description: 'Terms and conditions for using the PureFacts website.',
}

const sections = [
  {
    heading: 'Agreement to Terms',
    body: `By using the PureFacts Website, you agree to comply with these Terms of Use. If you do not agree to these terms and conditions, you are not welcome to use our Website. PureFacts reserves the right to change and update these terms at any time.`,
  },
  {
    heading: 'No Financial Advice',
    body: `PureFacts is not registered with the Ontario Securities Commission nor any other securities commission or regulator and is not licensed to provide any specific financial or other advice. The Website does not intend to deliver financial, legal, accounting, investment, or tax advice, and should not be relied upon for such purposes. Consult with your professional advisor who will advise you in the context of your personal circumstances.

The Website makes no promises or guarantees of any kind. Anyone who chooses to use the Website does so at their own risk.`,
  },
  {
    heading: 'Intellectual Property',
    body: `The contents of the PureFacts Website, including logos, trademarks, and trade names, are the sole property of PureFacts and are copyrighted and trademark registered. You may not use PureFacts logos, trademarks, or Website content for any purpose without our consent. Unauthorized downloading, retransmission, storage, copying, redistribution, reproduction, or republication in any manner is forbidden.`,
  },
  {
    heading: 'Third-Party Links',
    body: `Websites connected by hyperlinks to our Website may have been developed by third parties. PureFacts does not guarantee the accuracy of any information contained in independent websites. Other websites linked to PureFacts, as well as the products, information, and services they promote, are not endorsed or approved by PureFacts. PureFacts assumes no liability for any harm that may result from visiting these sites.

You are prohibited from hyperlinking web URLs to our Website without our prior written consent.`,
  },
  {
    heading: 'Prohibited Use',
    body: `Any use of our Website in a manner that is statutorily illegal under applicable laws is a violation of these terms. Such use includes, but is not limited to, distribution of content involving child pornography, terrorist threats, phishing, credit card fraud, racketeering, defamation, slander, or infringement of copyright, patent, trademark, or trade secret.

You may not use the Website to transmit any worms, viruses, or code of a destructive nature; facilitate IRC bots, proxies, or game servers; engage in denial-of-service attacks; distribute unsolicited email or spam; or facilitate unauthorized vulnerability testing. Framing, mirroring, scraping, or data mining of the Website or its content in any form is strictly prohibited.`,
  },
  {
    heading: 'Privacy and Data Security',
    body: `While every attempt will be made to honour your privacy and safeguard your confidential information, PureFacts cannot guarantee the confidentiality or security of information transmitted electronically. By accessing the Website, you agree not to hold PureFacts responsible for any damages or losses you incur by transmitting electronic information to us.

We collect personal information such as your name and email address when you access the Website for our internal record keeping. We are committed to ensuring that your information is secure and will use it on an aggregated, anonymous basis. Please refer to our Privacy Policy for full details.`,
  },
  {
    heading: 'Waiver',
    body: `If either party breaches or defaults under this Agreement and the other forgives that breach or default, it does not mean either party will forgive that breach continuing or agrees to forgive any future breach or default. In every case, forgiveness for any breach or default must be given in writing.`,
  },
  {
    heading: 'Severability',
    body: `If any of these terms or conditions is found to be illegal, void, or unenforceable, that term or condition shall be considered deleted from the Terms of Use, and all other remaining terms and conditions shall continue to be valid and enforceable.`,
  },
  {
    heading: 'Governing Law',
    body: `The Terms of Use are governed by the laws of Ontario and Canada and are not intended to conflict with any other laws. By using the Website, you agree to abide by the laws of the Province of Ontario and the federal laws of Canada as applicable regarding any issues arising from, connected with, or relating to the Website or these Terms of Use.`,
  },
]

export default function TermsOfUsePage() {
  return (
    <main className="bg-white">
          <BreadcrumbJsonLd pathname="/terms-of-use" />

      {/* Page header */}
      <div className="bg-[#f4f4f4] border-b border-[#e8e8e8]">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <p className="text-[#fb5607] text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#140f0c]">Terms of Use</h1>
          <p className="mt-3 text-sm text-[#140f0c]/50">Effective date: October 22, 2024</p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-2 sm:pt-12">
        <p className="text-base leading-relaxed text-[#140f0c]/75">
          Please read these Terms of Use carefully before using the PureFacts website. By accessing or using our Website, you agree to be bound by the terms described below.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10 sm:py-10 sm:space-y-12">
        {sections.map((section, i) => (
          <section key={i} className="border-t border-[#e8e8e8] pt-8 sm:pt-10" aria-labelledby={`terms-section-${i}`}>
            <h2
              id={`terms-section-${i}`}
              className="text-lg font-bold text-[#140f0c] mb-4 sm:text-xl"
            >
              {section.heading}
            </h2>
            {section.body.split('\n\n').map((para, j) => (
              <p key={j} className="text-[#140f0c]/75 leading-relaxed mb-4 last:mb-0">{para}</p>
            ))}
          </section>
        ))}
      </div>

      {/* Footer note */}
      <div className="max-w-4xl mx-auto px-6 pb-12 sm:pb-16">
        <div className="border-t border-[#e8e8e8] pt-8 sm:pt-10">
          <p className="text-sm text-[#140f0c]/50">
            Questions about these terms? Contact us at{' '}
            <a
              href="mailto:info@purefacts.com"
              className="text-[#3b84ff] hover:underline"
              aria-label="Email PureFacts at info@purefacts.com"
            >
              info@purefacts.com
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}