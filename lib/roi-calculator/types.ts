// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ROI Calculator v2 — Type definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type FirmProfile =
  | 'ria_hybrid'
  | 'advisor_platform'
  | 'private_wealth'
  | 'asset_manager';

export type Role =
  | 'executive'
  | 'finance'
  | 'operations'
  | 'business_leader'
  | 'strategy_product';

export type AumBand =
  | '5b_10b'
  | '10b_25b'
  | '25b_100b'
  | 'over_100b';

export type FirmChallenge =
  | 'fragmented_data'
  | 'legacy_tech'
  | 'revenue_leakage'
  | 'pricing_complexity'
  | 'compensation_complexity'
  | 'mna_integration'
  | 'scaling_operations'
  | 'regulatory_pressure'
  | 'reporting_visibility';

export interface QualifierSelection {
  firmProfile: FirmProfile;
  role: Role;
  challenges: FirmChallenge[];
  aumBand: AumBand;
}

export interface UserInputs {
  aum: number;
  feeRate: number;
  organicGrowth: number;
  ebitdaMargin: number;
  leakageRate: number;
}

export interface ModelParameters {
  advisorPayout: number;
  recoveryRamp: number[];
  pricingUpliftBps: number;
  annualRepricingRate: number;
  pricingAttrition: number;
  billingOpsCostRate: number;
  opsEfficiencyGain: number;
  opsEfficiencyRamp: number[];
  opsHeadcountAvoidanceRate: number;
  annualLicenseCost: number;
  oneTimeImplementationCost: number;
  internalImplementationCost: number;
  evMultiple: number;
  discountRate: number;
  horizon: number;
}

export interface ModelInputs {
  user: UserInputs;
  params: ModelParameters;
}

export interface YearlyOutput {
  year: number;
  projectedAum: number;
  baselineRevenue: number;
  baselineEbitda: number;
  leakageFullRun: number;
  leakageRecoveryRate: number;
  leakageRevenueRealized: number;
  cumulativeRepricedPct: number;
  legacyAumRepriced: number;
  grossPricingUplift: number;
  netPricingUplift: number;
  incrementalRevenue: number;
  advisorPayoutOnIncremental: number;
  opsBaseCost: number;
  opsSavingsRealized: number;
  grossIncrementalEbitda: number;
  pureFactsRecurringCost: number;
  pureFactsOneTimeCost: number;
  netIncrementalEbitda: number;
  cumulativeNetEbitda: number;
  totalRevenue: number;
  totalEbitda: number;
  totalEbitdaMarginPct: number;
  baselineEv: number;
  evUpliftFromPF: number;
  totalEv: number;
  discountFactor: number;
  presentValueOfNetEbitda: number;
}

export interface ModelOutputs {
  schedule: YearlyOutput[];
  fiveYearCumulativeNetEbitda: number;
  fiveYearTotalCost: number;
  roiMultiple: number;
  paybackYear: number;
  year5EvUplift: number;
  avgAnnualRevenueRecovery: number;
  avgAnnualOpsSavings: number;
  year1NetIncrementalEbitda: number;
  year5NetIncrementalEbitda: number;
  year5LeakageRecovery: number;
  year5PricingUplift: number;
  year5OpsSavings: number;
  year5AdvisorPayoutOnIncremental: number;
  year5EbitdaMarginExpansionBps: number;
  year5TotalRevenue: number;
  year5TotalEbitda: number;
  year5BaselineEbitda: number;
  npv: number;
}

export interface ProfilePreset {
  label: string;
  description: string;
  userDefaults: Omit<UserInputs, 'aum' | 'feeRate'>;
  profileParams: {
    advisorPayout: number;
  };
  terminology: {
    revenueLabel: string;
    leakageLabel: string;
    pricingLabel: string;
    efficiencyLabel: string;
  };
}

export interface RoleFraming {
  defaultLabel: string;
  headline: string;
  highlightedOutputs: string[];
  description: string;
  summaryTemplate: string;
}

export interface AumBandConfig {
  label: string;
  description: string;
  defaultAum: number;
  feeRateOverride: number;
  estimatedLicenseCost: number;
  estimatedImplementationCost: number;
  estimatedInternalCost: number;
}
