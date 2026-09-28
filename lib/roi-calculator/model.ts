import type { ModelInputs, ModelOutputs, YearlyOutput } from './types';

export function computeProjectedAum(baseAum: number, growthRate: number, year: number): number {
  return baseAum * Math.pow(1 + growthRate / 100, year);
}

export function computeBaselineRevenue(projectedAum: number, feeRate: number): number {
  return projectedAum * (feeRate / 10_000);
}

export function computeBaselineEbitda(baselineRevenue: number, ebitdaMargin: number): number {
  return baselineRevenue * (ebitdaMargin / 100);
}

export function computeLeakageFullRun(baselineRevenue: number, leakageRate: number): number {
  return baselineRevenue * (leakageRate / 100);
}

export function computeLeakageRevenueRealized(leakageFullRun: number, recoveryRampPct: number): number {
  const capped = Math.min(recoveryRampPct, 100);
  return leakageFullRun * (capped / 100);
}

export function computeCumulativeRepricedPct(annualRepricingRate: number, year: number): number {
  return Math.min(annualRepricingRate * year, 100);
}

export function computeNetPricingUplift(
  originalAum: number,
  cumulativeRepricedPct: number,
  pricingUpliftBps: number,
  attritionPct: number,
): number {
  const repricedAum = originalAum * (cumulativeRepricedPct / 100);
  const gross = repricedAum * (pricingUpliftBps / 10_000);
  return gross * (1 - attritionPct / 100);
}

export function computeOpsSavings(
  baselineRevenue: number,
  priorBaselineRevenue: number,
  billingOpsCostRate: number,
  efficiencyGain: number,
  efficiencyRampPct: number,
  headcountAvoidanceRate: number,
): number {
  const baseCost = baselineRevenue * billingOpsCostRate;
  const capped = Math.min(efficiencyRampPct, 100);
  const existingEfficiency = baseCost * (efficiencyGain / 100) * (capped / 100);
  const revenueGrowthDelta = Math.max(baselineRevenue - priorBaselineRevenue, 0);
  const headcountAvoidance = revenueGrowthDelta * billingOpsCostRate * (headcountAvoidanceRate / 100);
  return existingEfficiency + headcountAvoidance;
}

export function computeGrossIncrementalEbitda(
  incrementalRevenue: number,
  advisorPayout: number,
  opsSavings: number,
): number {
  return incrementalRevenue * (1 - advisorPayout / 100) + opsSavings;
}

export function computeNetIncrementalEbitda(
  grossIncrementalEbitda: number,
  recurringLicenseCost: number,
  oneTimeCost: number,
): number {
  return grossIncrementalEbitda - recurringLicenseCost - oneTimeCost;
}

export function computeEvUplift(netIncrementalEbitda: number, evMultiple: number): number {
  return netIncrementalEbitda * evMultiple;
}

export function computeAll(inputs: ModelInputs): ModelOutputs {
  const { user, params } = inputs;
  const horizon = params.horizon;
  const originalAum = user.aum;

  const schedule: YearlyOutput[] = [];
  let cumulativeNet = 0;

  for (let y = 1; y <= horizon; y++) {
    const rampIdx = y - 1;

    const projectedAum = computeProjectedAum(user.aum, user.organicGrowth, y);
    const baselineRevenue = computeBaselineRevenue(projectedAum, user.feeRate);
    const baselineEbitda = computeBaselineEbitda(baselineRevenue, user.ebitdaMargin);

    const leakageFullRun = computeLeakageFullRun(baselineRevenue, user.leakageRate);
    const recoveryRampPct = params.recoveryRamp[rampIdx] ?? params.recoveryRamp[params.recoveryRamp.length - 1];
    const leakageRevenueRealized = computeLeakageRevenueRealized(leakageFullRun, recoveryRampPct);

    const cumulativeRepricedPct = computeCumulativeRepricedPct(params.annualRepricingRate, y);
    const legacyAumRepriced = originalAum * (cumulativeRepricedPct / 100);
    const grossPricingUplift = legacyAumRepriced * (params.pricingUpliftBps / 10_000);
    const netPricingUplift = computeNetPricingUplift(
      originalAum, cumulativeRepricedPct, params.pricingUpliftBps, params.pricingAttrition,
    );

    const incrementalRevenue = leakageRevenueRealized + netPricingUplift;
    const advisorPayoutOnIncremental = incrementalRevenue * (params.advisorPayout / 100);

    const opsBaseCost = baselineRevenue * params.billingOpsCostRate;
    const opsRampPct = params.opsEfficiencyRamp[rampIdx] ?? params.opsEfficiencyRamp[params.opsEfficiencyRamp.length - 1];
    const priorBaselineRevenue = y === 1
      ? computeBaselineRevenue(user.aum, user.feeRate)
      : schedule[y - 2].baselineRevenue;
    const opsSavingsRealized = computeOpsSavings(
      baselineRevenue, priorBaselineRevenue, params.billingOpsCostRate,
      params.opsEfficiencyGain, opsRampPct, params.opsHeadcountAvoidanceRate,
    );

    const grossIncrementalEbitda = computeGrossIncrementalEbitda(
      incrementalRevenue, params.advisorPayout, opsSavingsRealized,
    );

    const pureFactsRecurringCost = params.annualLicenseCost;
    const oneTimeTotalCost = params.oneTimeImplementationCost + params.internalImplementationCost;
    const pureFactsOneTimeCost = y === 1 ? oneTimeTotalCost : 0;

    const netIncrementalEbitda = computeNetIncrementalEbitda(
      grossIncrementalEbitda, pureFactsRecurringCost, pureFactsOneTimeCost,
    );

    cumulativeNet += netIncrementalEbitda;

    const totalRevenue = baselineRevenue + incrementalRevenue;
    const totalEbitda = baselineEbitda + netIncrementalEbitda;
    const totalEbitdaMarginPct = totalRevenue > 0 ? (totalEbitda / totalRevenue) * 100 : 0;
    const baselineEv = baselineEbitda * params.evMultiple;
    const evUpliftFromPF = computeEvUplift(netIncrementalEbitda, params.evMultiple);
    const totalEv = totalEbitda * params.evMultiple;

    const discountFactor = 1 / Math.pow(1 + params.discountRate / 100, y);
    const presentValueOfNetEbitda = netIncrementalEbitda * discountFactor;

    schedule.push({
      year: y,
      projectedAum,
      baselineRevenue,
      baselineEbitda,
      leakageFullRun,
      leakageRecoveryRate: recoveryRampPct,
      leakageRevenueRealized,
      cumulativeRepricedPct,
      legacyAumRepriced,
      grossPricingUplift,
      netPricingUplift,
      incrementalRevenue,
      advisorPayoutOnIncremental,
      opsBaseCost,
      opsSavingsRealized,
      grossIncrementalEbitda,
      pureFactsRecurringCost,
      pureFactsOneTimeCost,
      netIncrementalEbitda,
      cumulativeNetEbitda: cumulativeNet,
      totalRevenue,
      totalEbitda,
      totalEbitdaMarginPct,
      baselineEv,
      evUpliftFromPF,
      totalEv,
      discountFactor,
      presentValueOfNetEbitda,
    });
  }

  const y1 = schedule[0];
  const y5 = schedule[horizon - 1];

  const fiveYearCumulativeNetEbitda = y5.cumulativeNetEbitda;

  const oneTimeTotalCost = params.oneTimeImplementationCost + params.internalImplementationCost;
  const fiveYearTotalCost = params.annualLicenseCost * horizon + oneTimeTotalCost;

  const roiMultiple = fiveYearTotalCost > 0
    ? fiveYearCumulativeNetEbitda / fiveYearTotalCost
    : Infinity;

  let paybackYear = Infinity;
  for (const row of schedule) {
    if (row.cumulativeNetEbitda > 0) {
      paybackYear = row.year;
      break;
    }
  }

  const npv = schedule.reduce((sum, row) => sum + row.presentValueOfNetEbitda, 0);

  const avgAnnualRevenueRecovery =
    schedule.reduce((sum, row) => sum + row.leakageRevenueRealized, 0) / horizon;
  const avgAnnualOpsSavings =
    schedule.reduce((sum, row) => sum + row.opsSavingsRealized, 0) / horizon;

  const baselineEbitdaMarginY5 = user.ebitdaMargin;
  const year5EbitdaMarginExpansionBps = Math.round(
    (y5.totalEbitdaMarginPct - baselineEbitdaMarginY5) * 100,
  );

  return {
    schedule,
    fiveYearCumulativeNetEbitda,
    fiveYearTotalCost,
    roiMultiple,
    paybackYear,
    year5EvUplift: y5.evUpliftFromPF,
    avgAnnualRevenueRecovery,
    avgAnnualOpsSavings,
    year1NetIncrementalEbitda: y1.netIncrementalEbitda,
    year5NetIncrementalEbitda: y5.netIncrementalEbitda,
    year5LeakageRecovery: y5.leakageRevenueRealized,
    year5PricingUplift: y5.netPricingUplift,
    year5OpsSavings: y5.opsSavingsRealized,
    year5AdvisorPayoutOnIncremental: y5.advisorPayoutOnIncremental,
    year5EbitdaMarginExpansionBps,
    year5TotalRevenue: y5.totalRevenue,
    year5TotalEbitda: y5.totalEbitda,
    year5BaselineEbitda: y5.baselineEbitda,
    npv,
  };
}
