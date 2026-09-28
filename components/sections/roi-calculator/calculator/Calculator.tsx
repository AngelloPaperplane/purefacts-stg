'use client';

import { useRef, useState, useCallback } from 'react';
import * as ReactDOM from 'react-dom/client';
import type { QualifierSelection, UserInputs } from '@/lib/roi-calculator/types';
import { useCalculator } from '@/hooks/useCalculator';
import { profilePresets, roleFraming, getRoleLabel, aumBandConfigs } from '@/lib/roi-calculator/presets';
import { formatChallenges } from '@/lib/roi-calculator/content';
import { buildContextString, submitToHubSpot } from '@/lib/roi-calculator/hubspot';
import { ExecutiveSummary } from '../dashboard/ExecutiveSummary';
import { StickyKpiBar } from '../dashboard/StickyKpiBar';
import { SecondaryKpiGrid } from '../dashboard/SecondaryKpiGrid';
import { StackedEbitdaChart } from '../dashboard/StackedEbitdaChart';
import { ModelDetails } from '../dashboard/ModelDetails';
import { InlineInputs } from './InlineInputs';
import { UnlockGate, type LeadInfo } from './UnlockGate';
import { PrintLayout } from './PrintLayout';

const UNLOCKED_KEY = 'ev-sim-unlocked';
const LEAD_INFO_KEY = 'ev-sim-lead-info';

function readStoredLeadInfo(): LeadInfo | null {
  try {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem(LEAD_INFO_KEY) : null;
    return raw ? JSON.parse(raw) as LeadInfo : null;
  } catch { return null; }
}

interface Props {
  qualifier: QualifierSelection;
  initialUserInputs: UserInputs;
  initialPayoutOverride: number;
  onChangeProfile: () => void;
}

export function Calculator({ qualifier, initialUserInputs, initialPayoutOverride, onChangeProfile }: Props) {
  const { userInputs, modelParams, modelOutputs, updateUserInput, updateAdvisorPayout, resetToDefaults } =
    useCalculator(qualifier, initialUserInputs, initialPayoutOverride);

  const profile = profilePresets[qualifier.firmProfile];
  const role = roleFraming[qualifier.role];
  const roleLabel = getRoleLabel(qualifier.role);
  const aumBand = aumBandConfigs[qualifier.aumBand];
  const selectedChallenges = formatChallenges(qualifier.challenges);

  const heroRef = useRef<HTMLElement>(null);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(() => readStoredLeadInfo());
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(UNLOCKED_KEY) === 'true' && readStoredLeadInfo() !== null,
  );
  const [caseSent, setCaseSent] = useState(false);
  const [caseSending, setCaseSending] = useState(false);

  const handleChangeProfile = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(UNLOCKED_KEY);
      sessionStorage.removeItem(LEAD_INFO_KEY);
    }
    onChangeProfile();
  }, [onChangeProfile]);

  const handleRequestCase = useCallback(async () => {
    if (caseSending) return;
    setCaseSending(true);

    if (leadInfo) {
      const context = buildContextString(qualifier, userInputs, modelParams, modelOutputs);
      await submitToHubSpot(leadInfo.name, leadInfo.email, leadInfo.company, 'Report Downloaded', context);
    }

    try {
      if (typeof window !== 'undefined') {
        const html2pdf = (await import('html2pdf.js')).default;

        // Render PrintLayout into a real visible DOM node so html2canvas can capture it.
        // visibility:hidden / left:-9999px both cause blank output — must be in viewport.
        const container = document.createElement('div');
        container.style.cssText =
          'position:fixed;top:0;left:0;width:1100px;z-index:-9999;pointer-events:none;background:#fff;';
        document.body.appendChild(container);

        // Mount and wait for React to flush
        await new Promise<void>((resolve) => {
          const root = ReactDOM.createRoot(container);
          root.render(
            <PrintLayout
              qualifier={qualifier}
              userInputs={userInputs}
              modelParams={modelParams}
              outputs={modelOutputs}
              leadName={leadInfo?.name ?? ''}
              leadCompany={leadInfo?.company ?? ''}
            />,
          );
          setTimeout(resolve, 150);
        });

        await html2pdf()
          .set({
            margin: 0,
            filename: `PureFacts-EV-Simulator-${leadInfo?.company || 'Report'}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1100 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: ['css', 'legacy'] },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any)
          .from(container.firstElementChild as HTMLElement)
          .save();

        document.body.removeChild(container);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
    }

    setCaseSending(false);
    setCaseSent(true);
  }, [leadInfo, caseSending, qualifier, userInputs, modelParams, modelOutputs]);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Sticky context bar */}
      <div className="bg-white border-b border-[#140f0c]/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fb5607]">Enterprise Value Simulator</p>
            <p className="text-xs text-[#140f0c]/40 mt-0.5 truncate">
              {profile.label} &middot; {roleLabel} &middot; {aumBand.label} AUM
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleChangeProfile}
              className="text-sm text-[#140f0c]/50 hover:text-[#3b84ff] transition-colors whitespace-nowrap hidden sm:block"
            >
              Change profile
            </button>
            <button
              onClick={resetToDefaults}
              className="text-sm px-3 py-1.5 border border-[#140f0c]/15 text-[#140f0c]/60
                         hover:bg-white hover:border-[#3b84ff] hover:text-[#3b84ff] transition-colors whitespace-nowrap"
              style={{ borderRadius: 6 }}
            >
              &#x21BA; Reset
            </button>
          </div>
        </div>
      </div>

      <StickyKpiBar outputs={modelOutputs} heroRef={heroRef} />

      {/* Always-visible top section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-5 space-y-5">
        <div className="border border-[#3b84ff]/20 bg-[#3b84ff]/5 px-5 py-2.5" style={{ borderRadius: 10 }}>
          <p className="text-[#140f0c] font-semibold text-sm">{role.headline}</p>
          <p className="text-[#140f0c]/60 text-xs mt-0.5">{role.description}</p>
          <p className="text-[11px] text-[#140f0c]/50 mt-2">
            <span className="font-semibold">Selected priorities:</span> {selectedChallenges}
          </p>
        </div>

        <InlineInputs
          userInputs={userInputs}
          advisorPayout={modelParams.advisorPayout}
          onUpdateUserInput={updateUserInput}
          onUpdateAdvisorPayout={updateAdvisorPayout}
          onReset={resetToDefaults}
        />

        <ExecutiveSummary ref={heroRef} outputs={modelOutputs} role={role} highlightedOutputs={role.highlightedOutputs} />
        <StackedEbitdaChart schedule={modelOutputs.schedule} />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#140f0c]/15 to-transparent" />
      </div>

      {/* Gated section */}
      <div className={`relative ${!unlocked ? 'max-h-[600px] overflow-hidden' : ''}`}>
        {!unlocked && (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#f4f4f4]/60 to-[#f4f4f4]/92 backdrop-blur-sm" />
            <UnlockGate
              qualifier={qualifier}
              userInputs={userInputs}
              modelParams={modelParams}
              modelOutputs={modelOutputs}
              onUnlock={(info) => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem(UNLOCKED_KEY, 'true');
                  sessionStorage.setItem(LEAD_INFO_KEY, JSON.stringify(info));
                }
                setLeadInfo(info);
                setUnlocked(true);
              }}
            />
          </>
        )}

        <div className={!unlocked ? 'pointer-events-none select-none' : ''}>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
            <SecondaryKpiGrid outputs={modelOutputs} highlightedOutputs={role.highlightedOutputs} />
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 space-y-4">
            <ModelDetails schedule={modelOutputs.schedule} params={modelParams} />
          </div>

          {/* CTA band */}
          <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-[#140f0c] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6" style={{ borderRadius: 10 }}>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white font-semibold text-base">
                  Get your personalized business case
                </h3>
                <p className="text-[#f4f4f4]/55 text-sm mt-1.5 leading-relaxed">
                  Receive a detailed analysis tailored to your firm profile, including strategic projections, relevant case studies, and actionable recommendations.
                </p>
              </div>
              {caseSent ? (
                <div className="flex items-center gap-2 text-[#ffb30c] text-sm font-medium whitespace-nowrap shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded
                </div>
              ) : (
                <button
                  onClick={handleRequestCase}
                  disabled={caseSending}
                  className="btn-alt inline-flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {caseSending ? 'Generating...' : 'Download the Report'}
                </button>
              )}
            </div>
            <p className="text-xs text-[#140f0c]/35 text-center mt-4">
              For planning purposes only. This is not financial, legal, or investment advice.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}