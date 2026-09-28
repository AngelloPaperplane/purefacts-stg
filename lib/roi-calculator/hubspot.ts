import type { QualifierSelection, UserInputs, ModelOutputs, ModelParameters } from './types';
import { profilePresets, aumBandConfigs, getRoleLabel } from './presets';
import { formatChallenges } from './content';
import { formatMillions, formatCompact } from './format';

const PORTAL_ID = '3218774';
const FORM_ID = '0a35afd5-1ac8-415b-94c2-7c40a89bf20b';

export function buildContextString(
  qualifier: QualifierSelection,
  userInputs: UserInputs,
  params: ModelParameters,
  outputs: ModelOutputs,
): string {
  const profile = profilePresets[qualifier.firmProfile].label;
  const role = getRoleLabel(qualifier.role);
  const band = aumBandConfigs[qualifier.aumBand].label;

  return [
    `Profile: ${profile} | Role: ${role} | AUM Band: ${band}`,
    `Challenges: ${formatChallenges(qualifier.challenges)}`,
    `Inputs: AUM ${formatCompact(userInputs.aum)} | Fee Rate ${userInputs.feeRate} bps | Growth ${userInputs.organicGrowth}% | Margin ${userInputs.ebitdaMargin}% | Payout ${params.advisorPayout}%`,
    `Leakage: ${userInputs.leakageRate}%`,
    `Results: 5Y EBITDA ${formatMillions(outputs.fiveYearCumulativeNetEbitda)} | Y5 EV ${formatMillions(outputs.year5EvUplift)} | Avg Recovery ${formatMillions(outputs.avgAnnualRevenueRecovery)} | Avg Ops ${formatCompact(outputs.avgAnnualOpsSavings)}`,
  ].join('\n');
}

export async function submitToHubSpot(
  name: string,
  email: string,
  company: string,
  action: string,
  context: string,
): Promise<void> {
  try {
    await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            { name: 'firstname', value: name },
            { name: 'email', value: email },
            { name: 'company', value: company },
            { name: 'message', value: `${action}\n\n${context}` },
          ],
          context: {
            pageUri: typeof window !== 'undefined' ? window.location.href : '',
            pageName: `Enterprise Value Simulator — ${action}`,
          },
        }),
      },
    );
  } catch {
    // Silent fail — lead capture is best-effort
  }
}
