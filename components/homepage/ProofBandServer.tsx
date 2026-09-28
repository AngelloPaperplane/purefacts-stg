import { getHomepageSettings } from "@/lib/sanity/queries";
import ProofBand from "./ProofBand";

export default async function ProofBandServer() {
  const settings = await getHomepageSettings();
  return <ProofBand logos={settings?.clientLogos ?? []} />;
}
