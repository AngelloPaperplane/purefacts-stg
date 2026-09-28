import type { Metadata } from 'next';
import ROICalculatorPage from '@/components/sections/roi-calculator/ROICalculatorPage';
import BreadcrumbJsonLd from '@/components/ui/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Enterprise Value Simulator | PureFacts Financial Solutions',
  description: 'Estimate the 5-year financial impact of better revenue infrastructure. Model leakage recovery, pricing alignment, and operational efficiency for your firm.',
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/resources/enterprise-value-simulator" />
      <ROICalculatorPage />
    </>
  );
}