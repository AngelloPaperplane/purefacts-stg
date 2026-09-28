import { Metadata } from "next";
import Script from "next/script";
import Hero from "@/components/homepage/Hero";
import KineticChallengeStatic from "@/components/homepage/KineticChallengeStatic";
import CostSection from "@/components/homepage/CostSection";
import CategoryDefinition from "@/components/homepage/CategoryDefinition";
import ProofBandServer from "@/components/homepage/ProofBandServer";
import ContactRow from "@/components/homepage/ContactRow";
import PlatformSection from "@/components/homepage/PlatformSection";
import FAQSection from "@/components/homepage/FAQSection";
import { DEFAULT_OG_IMAGE } from '@/lib/og'

export const metadata: Metadata = {
  title: "Revenue Performance Management Software | PureFacts",
  description:
    "PureFacts is the revenue performance management platform for wealth and asset management firms. Connect fees, compensation, and practice data on a single Revenue Book of Record.",
  alternates: {
    canonical: "https://purefacts.com/",
  },
  openGraph: {
    title: "Revenue Performance Management Platform | PureFacts",
    description:
      "PureFacts connects fees, compensation, and practice management on a single Revenue Book of Record for wealth and asset management firms.",
    url: "https://purefacts.com",
    siteName: "PureFacts Financial Solutions",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "PureFacts Revenue Performance Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revenue Performance Management Platform | PureFacts",
    description:
      "Connect fees, compensation, and practice management on a single Revenue Book of Record.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://purefacts.com/#organization",
      name: "PureFacts Financial Solutions",
      legalName: "PureFacts Financial Solutions Inc.",
      url: "https://purefacts.com",
      logo: {
        "@type": "ImageObject",
        url: "https://purefacts.com/logo-white.svg",
        width: 200,
        height: 60,
      },
      description:
        "PureFacts is the revenue performance management platform for wealth and asset management firms, connecting fee billing, advisor compensation, and practice management on a single Revenue Book of Record.",
      foundingDate: "2010",
      address: {
        "@type": "PostalAddress",
        streetAddress: "48 Yonge Street, Suite 900",
        addressLocality: "Toronto",
        addressRegion: "ON",
        postalCode: "M5E 1G6",
        addressCountry: "CA",
      },
      sameAs: [
        "https://www.linkedin.com/company/purefacts-financial-solutions-inc-/",
        "https://www.facebook.com/PureFactsFS/",
        "https://www.youtube.com/@purefactsfinancialsolutions/",
      ],
      knowsAbout: [
        "Revenue Performance Management",
        "Fee Billing",
        "Advisor Compensation",
        "Wealth Management Technology",
        "Asset Management Software",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://purefacts.com/#website",
      name: "PureFacts Financial Solutions",
      url: "https://purefacts.com",
      publisher: {
        "@id": "https://purefacts.com/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://purefacts.com/platform#software",
      name: "PureRevenue Platform",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Revenue Management Software",
      operatingSystem: "Web",
      description:
        "Enterprise revenue performance management platform for wealth and asset management firms. Includes Fees and Billing, Compensation, and Practice Management modules built on the Revenue Book of Record.",
      featureList: [
        "Fee billing automation",
        "Advisor compensation management",
        "Practice management and revenue intelligence",
        "Revenue Book of Record",
        "Revenue leakage detection",
      ],
      provider: {
        "@id": "https://purefacts.com/#organization",
      },
      offers: {
        "@type": "Offer",
        seller: {
          "@id": "https://purefacts.com/#organization",
        },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is revenue performance management for wealth management firms?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Revenue performance management is the discipline of designing, capturing, distributing, measuring, and optimizing revenue across the full revenue lifecycle. For wealth and asset management firms, it connects commercial strategy to the operational systems that support fee billing, advisor compensation, and practice-level revenue intelligence. Without a centralized approach, firms risk revenue leakage, billing errors, operational inefficiencies, and limited visibility into profitability.",
          },
        },
        {
          "@type": "Question",
          name: "What is a Revenue Book of Record?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A Revenue Book of Record is a centralized system that serves as the authoritative source for all revenue-related data, calculations, workflows, and reporting across an organization. For wealth and asset management firms, it consolidates information related to fee billing, advisor compensation, revenue sharing, and practice performance. This creates a consistent and auditable foundation for managing revenue operations.",
          },
        },
        {
          "@type": "Question",
          name: "What does PureFacts do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PureFacts is a B2B enterprise fintech company that helps wealth and asset management firms improve revenue performance through its PureRevenue Platform. The platform connects Fees and Billing, Compensation, and Practice Management on a single Revenue Book of Record. By centralizing revenue operations, PureFacts enables firms to automate complex workflows, reduce revenue leakage, improve billing and compensation accuracy, and gain actionable revenue intelligence.",
          },
        },
        {
          "@type": "Question",
          name: "How much revenue do wealth management firms lose to billing errors and operational leakage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Revenue leakage is a significant challenge for wealth management firms. Manual processes, disconnected systems, inaccurate fee calculations, and compensation errors can result in lost revenue and increased operational costs. Common sources of leakage include incorrect fee billing, missed billing opportunities, data inconsistencies, and compensation calculation errors. Implementing automated revenue performance management solutions can help firms identify and recover lost revenue while reducing future leakage.",
          },
        },
        {
          "@type": "Question",
          name: "What are the best software solutions for revenue performance management?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The best revenue performance management software solutions provide automation, transparency, scalability, and analytics across the revenue lifecycle. Key capabilities include revenue calculation and reconciliation, fee billing automation, advisor compensation management, revenue reporting and analytics, and enterprise integration. For wealth and asset management firms, PureFacts combines Fees and Billing, Compensation, and Practice Management on a single platform, helping firms reduce revenue leakage, improve operational efficiency, and gain actionable revenue intelligence.",
          },
        },
        {
          "@type": "Question",
          name: "How do you compare revenue performance management tools by features?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "When evaluating revenue performance management tools, organizations should compare platforms based on revenue automation capabilities, billing and fee management functionality, compensation management support, reporting and analytics, data accuracy and governance, integration with existing systems, and scalability for future growth. For wealth and asset management firms, solutions that unify revenue workflows on a single platform often deliver greater value than disconnected point solutions.",
          },
        },
        {
          "@type": "Question",
          name: "What are the best practices for implementing a revenue performance management strategy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Successful revenue performance management strategies focus on aligning people, processes, and technology around revenue optimization. Best practices include: establishing a single source of truth for revenue data, automating manual revenue and billing processes, standardizing compensation and fee calculation rules, monitoring performance with consistent KPIs, improving data quality and governance, integrating revenue systems across business functions, and continuously analyzing and optimizing revenue outcomes.",
          },
        },
        {
          "@type": "Question",
          name: "What are the key revenue cycle management performance indicators?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Key performance indicators for revenue cycle management measure the effectiveness, accuracy, and efficiency of revenue operations. Common KPIs include revenue leakage rate, billing accuracy, revenue realization rate, days sales outstanding, fee collection rate, compensation accuracy, revenue per advisor, operating margin, and cost to collect revenue. For wealth and asset management firms, monitoring these metrics helps identify inefficiencies and improve revenue outcomes.",
          },
        },
        {
          "@type": "Question",
          name: "What are the 7 principles of revenue management?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The seven core principles of revenue management help organizations maximize revenue while improving operational efficiency: understand your client segments, align pricing and fees with value delivered, forecast revenue accurately, optimize resource allocation, use data-driven decision-making, continuously monitor performance metrics, and adapt strategies based on market and business conditions. In wealth and asset management, applying these principles requires accurate revenue data, transparent reporting, and automated operational processes.",
          },
        },
        {
          "@type": "Question",
          name: "What are the top-rated revenue performance management platforms for enterprise use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Enterprise revenue performance management platforms are designed to support complex revenue models, large-scale operations, and regulatory requirements. Leading solutions offer enterprise-grade scalability, workflow automation, advanced reporting and analytics, revenue governance controls, integration with core business systems, and multi-entity support. For wealth and asset management enterprises, the PureFacts PureRevenue Platform provides a comprehensive solution built specifically for the industry's unique requirements.",
          },
        },
      ],
    },
  ],
};

export default function NewHomePage() {
  return (
    <>
      <Script
        id="homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <main id="main-content">
        {/* 1. Dark hero challenges the visitor immediately */}
        <Hero />

        {/* 2. Kinetic text makes the problem visceral */}
        <KineticChallengeStatic />

        {/* 3. Cost of the status quo — industry stats that indict */}
        <CostSection />

        {/* 4. Category definition — Revenue Performance as a discipline */}
        <CategoryDefinition />

        {/* 5. Platform — the data journey */}
        <PlatformSection />

        {/* 6. Proof band — scale stats + logos */}
        <ProofBandServer />

        {/* 7. Contact row — gradient border panel */}
        <ContactRow />

        {/* 8. FAQ — visible on-page content backing FAQPage schema */}
        <FAQSection />
      </main>
    </>
  );
}