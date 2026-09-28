import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automated Fee Billing Engine for Asset Managers | FeeManager",
  description:
    "Automate end-to-end fee operations from data and contracts to calculation, approvals, booking, and GL-ready exports. Reduce breaks and close with confidence.",
};

export default function FeeManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}