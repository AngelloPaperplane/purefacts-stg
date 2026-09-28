import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd'

export const metadata = {
  title: 'Privacy Policy | PureFacts',
  description: 'How PureFacts collects, uses, and protects your personal information.',
}

const sections = [
  {
    heading: 'Why Do We Collect Personal Information?',
    body: `PureFacts collects personal information from our users and prospective users in order to provide services and information to you.

We may also collect personal information to allow us to manage and develop our business and operations, including: informing you of, and supplying you with information other than that which you specifically requested; enabling PureFacts to comply with applicable law or regulatory requirements; and any other reasonable purpose to which you consent.

Any information that is collected is treated as confidential and will be respected in accordance with this Privacy Policy. While every attempt will be made to honour your privacy and safeguard your confidential information, PureFacts cannot guarantee the confidentiality or security of information transmitted electronically. By accessing the Website, you agree not to hold PureFacts responsible for any damages or losses you incur by transmitting electronic information to us.`,
  },
  {
    heading: 'What Is Personal Information?',
    bullets: [
      'Your name, address, telephone number, and email address; information requests; business relationship or business operations information.',
      'General anonymous information related to your use of our Website, such as the date and time you visit and the pages you view.',
      '"Cookie" information from your browser to identify your computer and provide us with a record of your visits.',
    ],
  },
  {
    heading: 'How Do We Collect Personal Information?',
    body: `We may use third-party web masters and analytics providers, including Google Analytics, HubSpot, and Microsoft Clarity, to help us gather and analyze information about the areas you visit on our Website in order to enhance your user experience and to help us analyze the use of our Website.

These third parties may use cookies and similar technologies to collect usage and interaction data in an aggregated or anonymized form for analytics, performance monitoring, and user experience improvements.`,
  },
  {
    heading: 'What Is a Cookie?',
    body: `Cookies are tiny pieces of data that can be sent to your browser and stored on your hard drive so that you are recognized the next time you visit our Website. Cookies are not used to determine the personal identity of anyone who is merely browsing our Website. They help us track traffic patterns to determine a user's preferred location and language so we can direct them appropriately.

The technology used to gather "cookie" information is provided by your internet browser and may be turned off using your browser preference settings. Visiting the Website with analytics cookies disabled should have no significant impact on your browsing experience, but some features may not be fully accessible.`,
  },
  {
    heading: 'Google Analytics',
    body: `We use Google Analytics to view anonymized information about our website's performance, including the most frequently viewed pages, average time on page, and acquisition sources. This helps us understand which areas of our website are popular and which we need to improve. For more information, please review Google's privacy policy.`,
  },
  {
    heading: 'HubSpot',
    body: `HubSpot is a marketing and sales software application that we use to analyze email campaigns and track onsite form completions. For more information, please review HubSpot's privacy policy.`,
  },
  {
    heading: 'Microsoft Clarity',
    body: `We use Microsoft Clarity to better understand how visitors interact with our Website, including user navigation, engagement patterns, and usability insights. This helps us improve our Website content and user experience.

By using our Website, you agree that PureFacts and Microsoft may collect and use this data in accordance with their respective privacy practices. For more information, please review Microsoft's privacy statement.`,
  },
  {
    heading: 'Disclosure of Your Personal Information',
    intro: 'We will only disclose your information where:',
    bullets: [
      'We are required to do so by legal or regulatory requirements.',
      'It is necessary to protect the rights and property of PureFacts.',
      'Emergencies occur or where use is necessary to protect the safety of a person or group of persons.',
      'The information is public personal information.',
      'It is required by employees, contractors, and consultants who assist us in managing our relationship with you, including third parties that provide or collaborate in the provision of services.',
      'We have obtained your consent.',
    ],
    footer: 'We will not sell, transfer, or otherwise disclose any of your personal information to any third party without your express consent.',
  },
  {
    heading: 'Consent and Opting-Out',
    body: `Your consent to the collection, use, and disclosure of your personal information may be given verbally, in writing, electronically, or by using our products and services. You may withdraw your consent at any time as long as you give us reasonable notice of withdrawal.`,
  },
  {
    heading: 'Third-Party Links',
    body: `Our Website may sometimes contain links to other sites that are not governed by this Privacy Policy. Visitors to our Website may be directed to third-party sites for more information, such as events, content sponsorships, vendor services, government entities, non-profits, and social networks. PureFacts makes no representations or warranties regarding how user data is stored or used on third-party servers. We recommend reviewing the privacy policy of each third-party site linked from our Website.`,
  },
  {
    heading: 'How to Contact Us',
    body: `To obtain access to your information, report incorrect information, file a complaint, or make any enquiries about this Privacy Policy, please contact our Chief Information Security Officer at:`,
    contact: 'security@purefacts.com',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white">
      <BreadcrumbJsonLd pathname="/privacy-policy" />

      {/* Page header */}
      <div className="bg-[#f4f4f4] border-b border-[#e8e8e8]">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <p className="text-[#fb5607] text-xs font-semibold uppercase tracking-widest mb-3">
            Legal
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#140f0c]">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-[#140f0c]/50">
            Last updated May 21, 2026
          </p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-2 sm:pt-12">
        <p className="text-base leading-relaxed text-[#140f0c]/75">
          PureFacts is committed to protecting your privacy when you browse our
          Website. The handling of all personal information is governed by the
          Personal Information Protection and Electronic Documents Act. We may
          update this Privacy Policy from time to time, so please review it
          regularly.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10 sm:py-10 sm:space-y-12">
        {sections.map((section, i) => (
          <section
            key={i}
            className="border-t border-[#e8e8e8] pt-8 sm:pt-10"
            aria-labelledby={`privacy-section-${i}`}
          >
            <h2
              id={`privacy-section-${i}`}
              className="text-lg font-bold text-[#140f0c] mb-4 sm:text-xl"
            >
              {section.heading}
            </h2>

            {section.intro && (
              <p className="text-[#140f0c]/75 leading-relaxed mb-3">
                {section.intro}
              </p>
            )}

            {section.body &&
              section.body.split('\n\n').map((para, j) => (
                <p
                  key={j}
                  className="text-[#140f0c]/75 leading-relaxed mb-4 last:mb-0"
                >
                  {para}
                </p>
              ))}

            {section.bullets && (
              <ul className="space-y-2 mb-4" role="list">
                {section.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[#140f0c]/75 leading-relaxed"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#3b84ff] flex-shrink-0"
                      aria-hidden="true"
                    />

                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.footer && (
              <p className="text-[#140f0c]/75 leading-relaxed mt-3">
                {section.footer}
              </p>
            )}

            {section.contact && (
              <a
                href={`mailto:${section.contact}`}
                className="inline-block mt-2 text-[#3b84ff] hover:underline font-medium"
                aria-label={`Email PureFacts security team at ${section.contact}`}
              >
                {section.contact}
              </a>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}