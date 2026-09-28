import type { FirmChallenge } from './types';

export interface FirmChallengeOption {
  value: FirmChallenge;
  label: string;
  description: string;
}

export const firmChallengeOptions: FirmChallengeOption[] = [
  {
    value: 'fragmented_data',
    label: 'Fragmented data / poor data quality',
    description: 'Disconnected sources, missing fields, and inconsistent records slow billing and reporting.',
  },
  {
    value: 'legacy_tech',
    label: 'Legacy systems / tech debt',
    description: 'Aging platforms and brittle integrations create manual workarounds and rework.',
  },
  {
    value: 'revenue_leakage',
    label: 'Revenue leakage / billing errors',
    description: 'Fee exceptions, missed billing logic, and reconciliation gaps erode earned revenue.',
  },
  {
    value: 'pricing_complexity',
    label: 'Pricing, discount, or fee schedule complexity',
    description: 'Non-standard schedules and overrides make pricing harder to govern consistently.',
  },
  {
    value: 'compensation_complexity',
    label: 'Compensation, rebate, or payout complexity',
    description: 'Compensation plans, rebates, and payout rules are difficult to align and audit.',
  },
  {
    value: 'mna_integration',
    label: 'M&A or platform integration',
    description: 'Acquisitions and platform consolidation create inconsistent logic, controls, and reporting.',
  },
  {
    value: 'scaling_operations',
    label: 'Scaling operations without adding headcount',
    description: 'Growth is outpacing the current operating model and manual capacity.',
  },
  {
    value: 'regulatory_pressure',
    label: 'Regulatory, audit, or control pressure',
    description: 'Auditability, approvals, and defensible controls are becoming harder to maintain.',
  },
  {
    value: 'reporting_visibility',
    label: 'Limited revenue reporting / forecasting visibility',
    description: 'Leaders do not have a timely, trusted view of revenue performance and trends.',
  },
];

const challengeLabels: Record<FirmChallenge, string> = Object.fromEntries(
  firmChallengeOptions.map((option) => [option.value, option.label]),
) as Record<FirmChallenge, string>;

export function getChallengeLabel(value: FirmChallenge): string {
  return challengeLabels[value];
}

export function formatChallenges(values: FirmChallenge[]): string {
  return values.map(getChallengeLabel).join('; ');
}
