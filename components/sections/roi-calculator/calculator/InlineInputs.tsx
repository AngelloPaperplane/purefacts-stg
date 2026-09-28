'use client';

import { useState } from 'react';
import type { UserInputs } from '@/lib/roi-calculator/types';
import { SliderInput } from '../ui/SliderInput';
import { AumInput } from '../ui/AumInput';

interface Props {
  userInputs: UserInputs;
  advisorPayout: number;
  onUpdateUserInput: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;
  onUpdateAdvisorPayout: (value: number) => void;
  onReset: () => void;
}

export function InlineInputs({ userInputs, advisorPayout, onUpdateUserInput, onUpdateAdvisorPayout, onReset }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white border border-[#140f0c]/10 overflow-hidden" style={{ borderRadius: 10 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 text-left flex items-center justify-between hover:bg-[#f4f4f4] transition-colors"
        style={{ borderRadius: expanded ? '10px 10px 0 0' : 10 }}
      >
        <span className="text-sm font-medium text-[#140f0c]">Model Your Firm</span>
        <div className="flex items-center gap-3">
          {expanded && (
            <span
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-[#140f0c]/35 hover:text-[#3b84ff] transition-colors"
            >
              Reset
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#140f0c]/35 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#140f0c]/8 pt-3">
          <AumInput value={userInputs.aum} onChange={(v) => onUpdateUserInput('aum', v)} />

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <SliderInput label="Blended fee rate" value={userInputs.feeRate} onChange={(v) => onUpdateUserInput('feeRate', v)} min={20} max={150} step={5} unit="bps" />
            <SliderInput label="Organic growth rate" value={userInputs.organicGrowth} onChange={(v) => onUpdateUserInput('organicGrowth', v)} min={0} max={100} step={1} unit="%" />
            <SliderInput label="EBITDA margin" value={userInputs.ebitdaMargin} onChange={(v) => onUpdateUserInput('ebitdaMargin', v)} min={15} max={50} step={5} unit="%" />
            <SliderInput label="Advisor payout" value={advisorPayout} onChange={onUpdateAdvisorPayout} min={20} max={70} step={1} unit="%" />
          </div>

          <div className="mt-3 pt-2 border-t border-[#140f0c]/8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[#140f0c]/35 hover:text-[#3b84ff] flex items-center gap-1.5 transition-colors"
            >
              <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Advanced
            </button>

            {showAdvanced && (
              <div className="mt-2 max-w-xs">
                <SliderInput label="Revenue leakage (% of revenue)" value={userInputs.leakageRate} onChange={(v) => onUpdateUserInput('leakageRate', v)} min={1} max={10} step={0.5} unit="%" />
                <p className="text-[10px] text-[#140f0c]/35 mt-0.5 leading-relaxed">
                  Estimated revenue leakage as a percentage of gross revenue. Default based on firm profile.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}