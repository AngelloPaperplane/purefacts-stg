import type { Metadata } from 'next';
import YourJourneyClient from '@/components/sections/YourJourneyClient';

export const metadata: Metadata = {
  title: 'Your Journey to Revenue Optimization | PureFacts',
  description:
    'Five stops. Real insights. A clear picture of how PureFacts helps financial firms unlock revenue they did not know they were losing.',
};

export default function YourJourneyPage() {
  return <YourJourneyClient />;
}
