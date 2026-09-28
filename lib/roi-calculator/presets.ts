import type {
  FirmProfile,
  Role,
  AumBand,
  ProfilePreset,
  RoleFraming,
  AumBandConfig,
  ModelInputs,
} from './types';

import {
  HORIZON,
  RECOVERY_RAMP,
  PRICING_UPLIFT_BPS,
  ANNUAL_REPRICING_RATE,
  PRICING_ATTRITION,
  BILLING_OPS_COST_RATE,
  OPS_EFFICIENCY_GAIN,
  OPS_EFFICIENCY_RAMP,
  OPS_HEADCOUNT_AVOIDANCE_RATE,
  EV_MULTIPLE,
  DISCOUNT_RATE,
} from './constants';

export const profilePresets: Record<FirmProfile, ProfilePreset> = {
  ria_hybrid: {
    label: 'RIA / Hybrid RIA',
    description: 'Fee-based advisory firms, including hybrid models',
    userDefaults: {
      organicGrowth: 5,
      ebitdaMargin: 30,
      leakageRate: 4,
    },
    profileParams: { advisorPayout: 52 },
    terminology: {
      revenueLabel: 'Gross advisory revenue',
      leakageLabel: 'Revenue leakage recovered',
      pricingLabel: 'Pricing alignment uplift',
      efficiencyLabel: 'Billing ops efficiency savings',
    },
  },

  advisor_platform: {
    label: 'Advisor Platform / Aggregator',
    description: 'Investor-backed, acquisitive, or multi-team advisory platforms',
    userDefaults: {
      organicGrowth: 8,
      ebitdaMargin: 28,
      leakageRate: 5,
    },
    profileParams: { advisorPayout: 45 },
    terminology: {
      revenueLabel: 'Gross platform revenue',
      leakageLabel: 'Revenue leakage recovered',
      pricingLabel: 'Pricing alignment uplift',
      efficiencyLabel: 'Billing ops efficiency savings',
    },
  },

  private_wealth: {
    label: 'UHNW / Private Wealth',
    description: 'Bespoke pricing, household complexity, and alternative assets',
    userDefaults: {
      organicGrowth: 4,
      ebitdaMargin: 35,
      leakageRate: 6,
    },
    profileParams: { advisorPayout: 40 },
    terminology: {
      revenueLabel: 'Gross wealth advisory revenue',
      leakageLabel: 'Fee leakage recovered',
      pricingLabel: 'Fee alignment uplift',
      efficiencyLabel: 'Fee ops efficiency savings',
    },
  },

  asset_manager: {
    label: 'Asset Manager',
    description: 'Institutional or intermediary asset managers with fee complexity',
    userDefaults: {
      organicGrowth: 5,
      ebitdaMargin: 35,
      leakageRate: 3,
    },
    profileParams: { advisorPayout: 30 },
    terminology: {
      revenueLabel: 'Gross management fee revenue',
      leakageLabel: 'Fee leakage recovered',
      pricingLabel: 'Fee alignment uplift',
      efficiencyLabel: 'Fee ops efficiency savings',
    },
  },
};

export const roleFraming: Record<Role, RoleFraming> = {
  executive: {
    defaultLabel: 'Executive',
    headline: 'See how PureFacts drives growth and enterprise value',
    highlightedOutputs: ['fiveYearCumulativeNetEbitda', 'year5EvUplift', 'roiMultiple'],
    description: 'Understand how revenue recovery and pricing discipline translate into EBITDA growth and enterprise value.',
    summaryTemplate:
      'Based on your inputs, PureFacts could generate {fiveYearCumulativeNetEbitda} in cumulative EBITDA improvement over 5 years, with an estimated {year5EvUplift} in enterprise value uplift by Year 5.',
  },
  finance: {
    defaultLabel: 'Finance',
    headline: 'Quantify the financial return and payback',
    highlightedOutputs: ['fiveYearCumulativeNetEbitda', 'roiMultiple', 'avgAnnualRevenueRecovery'],
    description: 'See bottom-line EBITDA impact, return timing, and total investment cost.',
    summaryTemplate:
      'The model projects {fiveYearCumulativeNetEbitda} in cumulative net EBITDA over 5 years, alongside {avgAnnualRevenueRecovery} in average annual revenue recovery.',
  },
  operations: {
    defaultLabel: 'Operations',
    headline: 'Improve revenue capture and operational efficiency',
    highlightedOutputs: ['fiveYearCumulativeNetEbitda', 'avgAnnualRevenueRecovery', 'year5LeakageRecovery'],
    description: 'Measure the operational value of more accurate and scalable revenue workflows.',
    summaryTemplate:
      'Addressing revenue leakage could recover {year5LeakageRecovery} annually by Year 5, driving {fiveYearCumulativeNetEbitda} in cumulative EBITDA improvement.',
  },
  business_leader: {
    defaultLabel: 'Business Leader',
    headline: 'See the full revenue opportunity across your business',
    highlightedOutputs: ['fiveYearCumulativeNetEbitda', 'year5EvUplift', 'year5PricingUplift'],
    description: 'Surface recoverable revenue and pricing opportunity, and understand where economics improve.',
    summaryTemplate:
      'Across your book, PureFacts could unlock {year5PricingUplift} in annual pricing uplift by Year 5 and {fiveYearCumulativeNetEbitda} in cumulative EBITDA improvement.',
  },
  strategy_product: {
    defaultLabel: 'Strategy / Product',
    headline: 'Model the strategic value of better revenue infrastructure',
    highlightedOutputs: ['fiveYearCumulativeNetEbitda', 'year5EvUplift', 'year5PricingUplift'],
    description: 'See how cleaner revenue operations support scale, insight, and growth.',
    summaryTemplate:
      'Cleaner revenue infrastructure could generate {fiveYearCumulativeNetEbitda} in cumulative EBITDA and {year5EvUplift} in enterprise value uplift by Year 5.',
  },
};

export const aumBandConfigs: Record<AumBand, AumBandConfig> = {
  '5b_10b': {
    label: '$5B to $10B',
    description: 'Growth-stage advisory firms',
    defaultAum: 7_500_000_000,
    feeRateOverride: 80,
    estimatedLicenseCost: 0,
    estimatedImplementationCost: 0,
    estimatedInternalCost: 0,
  },
  '10b_25b': {
    label: '$10B to $25B',
    description: 'Mid-market firms',
    defaultAum: 15_000_000_000,
    feeRateOverride: 70,
    estimatedLicenseCost: 0,
    estimatedImplementationCost: 0,
    estimatedInternalCost: 0,
  },
  '25b_100b': {
    label: '$25B to $100B',
    description: 'Large enterprises',
    defaultAum: 50_000_000_000,
    feeRateOverride: 55,
    estimatedLicenseCost: 0,
    estimatedImplementationCost: 0,
    estimatedInternalCost: 0,
  },
  over_100b: {
    label: '$100B+',
    description: 'Enterprise / institutional scale',
    defaultAum: 150_000_000_000,
    feeRateOverride: 45,
    estimatedLicenseCost: 0,
    estimatedImplementationCost: 0,
    estimatedInternalCost: 0,
  },
};

export function buildDefaults(
  firmProfile: FirmProfile,
  aumBand: AumBand,
): ModelInputs {
  const profile = profilePresets[firmProfile];
  const band = aumBandConfigs[aumBand];

  return {
    user: {
      aum: band.defaultAum,
      feeRate: band.feeRateOverride,
      organicGrowth: profile.userDefaults.organicGrowth,
      ebitdaMargin: profile.userDefaults.ebitdaMargin,
      leakageRate: profile.userDefaults.leakageRate,
    },
    params: {
      advisorPayout: profile.profileParams.advisorPayout,
      recoveryRamp: RECOVERY_RAMP,
      pricingUpliftBps: PRICING_UPLIFT_BPS,
      annualRepricingRate: ANNUAL_REPRICING_RATE,
      pricingAttrition: PRICING_ATTRITION,
      billingOpsCostRate: BILLING_OPS_COST_RATE,
      opsEfficiencyGain: OPS_EFFICIENCY_GAIN,
      opsEfficiencyRamp: OPS_EFFICIENCY_RAMP,
      opsHeadcountAvoidanceRate: OPS_HEADCOUNT_AVOIDANCE_RATE,
      annualLicenseCost: band.estimatedLicenseCost,
      oneTimeImplementationCost: band.estimatedImplementationCost,
      internalImplementationCost: band.estimatedInternalCost,
      evMultiple: EV_MULTIPLE,
      discountRate: DISCOUNT_RATE,
      horizon: HORIZON,
    },
  };
}

export function getRoleLabel(role: Role): string {
  return roleFraming[role].defaultLabel;
}
