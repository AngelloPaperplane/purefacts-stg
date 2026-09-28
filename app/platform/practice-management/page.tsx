import type { Metadata } from "next";
import Script from "next/script";
import PracticeManagementPage from "@/components/sections/PracticeManagementPage";
import { ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Practice Management Software | Revenue Analytics | PureFacts",
  description:
    "PureFacts Practice Management gives wealth firms AI-powered pricing intelligence, advisor scoring, and next-best actions to grow revenue and profitability.",
  alternates: {
    canonical: "https://purefacts.com/platform/practice-management",
  },
  openGraph: {
    title: "Practice Management Software | Revenue Analytics | PureFacts",
    description:
      "PureFacts Practice Management gives wealth firms AI-powered pricing intelligence, advisor scoring, and next-best actions to grow revenue and profitability.",
    url: "https://purefacts.com/platform/practice-management",
    siteName: "PureFacts",
    images: [
      {
        url: ogImage(),
        width: 1200,
        height: 630,
        alt: "Practice Management Software — Revenue Analytics by PureFacts",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Practice Management Software | Revenue Analytics | PureFacts",
    description:
      "PureFacts Practice Management gives wealth firms AI-powered pricing intelligence, advisor scoring, and next-best actions to grow revenue and profitability.",
    images: [ogImage()],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://purefacts.com/platform/practice-management#software",
      name: "PureFacts Practice Management",
      description:
        "Practice Management is the revenue performance analytics module within the PureRevenue Platform. It provides wealth and asset management firms with AI-powered pricing intelligence, advisor-level scoring across pricing, value, loyalty, and practice effectiveness, and AI-native next-best actions connected to the Revenue Book of Record.",
      applicationCategory: "FinancialApplication",
      operatingSystem: "Web",
      url: "https://purefacts.com/platform/practice-management",
      offers: {
        "@type": "Offer",
        url: "https://purefacts.com/contact",
      },
      provider: {
        "@type": "Organization",
        "@id": "https://purefacts.com/#organization",
        name: "PureFacts",
      },
      featureList: [
        "Pricing Score — pricing performance across advisors, clients, and peer groups",
        "Value Score — revenue captured vs. value delivered",
        "Loyalty Score — client retention risk identification",
        "Practice Effectiveness Score — advisor benchmarking",
        "AI-native next-best advisor actions",
        "Connected to the Revenue Book of Record",
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://purefacts.com/platform/practice-management#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://purefacts.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Platform",
          item: "https://purefacts.com/platform",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Practice Management",
          item: "https://purefacts.com/platform/practice-management",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://purefacts.com/platform/practice-management#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is advisor practice analytics software?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Advisor practice analytics software gives wealth and asset management firms visibility into how individual advisors are performing across pricing, client retention, revenue capture, and practice effectiveness. PureFacts Practice Management connects those analytics to the Revenue Book of Record so that pricing intelligence is grounded in actual fee, billing, and compensation data rather than activity data alone.",
          },
        },
        {
          "@type": "Question",
          name: "How does PureFacts Practice Management identify pricing gaps?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Practice Management calculates a Pricing Score for each advisor, client, product, branch, and peer group by comparing actual pricing against comparable relationships and peer benchmarks. Gaps where relationships are priced below market or below the value being delivered are surfaced as actionable insights, not just data points for analysts to interpret.",
          },
        },
        {
          "@type": "Question",
          name: "What are the four intelligence scores in PureFacts Practice Management?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Practice Management surfaces four intelligence scores. The Pricing Score shows where pricing is strong and where revenue is slipping relative to peers. The Value Score compares revenue captured against the value delivered to each client relationship. The Loyalty Score identifies client retention risk before it becomes lost revenue. The Practice Effectiveness Score benchmarks advisor performance across pricing discipline, client growth, wallet share, and profitability.",
          },
        },
        {
          "@type": "Question",
          name: "How does Practice Management connect to the Revenue Book of Record?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Practice Management shares the same data foundation as Fees and Billing and Compensation inside the PureRevenue Platform. All pricing intelligence, advisor scoring, and next-best actions are derived from the Revenue Book of Record, which consolidates client, account, contract, and pricing rule data across the firm. This means practice analytics reflect actual revenue data, not just CRM activity or pipeline estimates.",
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <Script
        id="practice-management-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PracticeManagementPage />
    </>
  );
}