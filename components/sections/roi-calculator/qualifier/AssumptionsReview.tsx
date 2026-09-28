'use client';

import { useState } from 'react';
import type { QualifierSelection, UserInputs } from '@/lib/roi-calculator/types';
import { buildDefaults, profilePresets, aumBandConfigs } from '@/lib/roi-calculator/presets';
import { SliderInput } from '../ui/SliderInput';
import { AumInput } from '../ui/AumInput';

interface Props {
  qualifier: QualifierSelection;
  onCalculate: (overrides: UserInputs, advisorPayout: number) => void;
  onBack: () => void;
}

export function AssumptionsReview({ qualifier, onCalculate, onBack }: Props) {
  const defaults = buildDefaults(qualifier.firmProfile, qualifier.aumBand);
  const profile = profilePresets[qualifier.firmProfile];
  const band = aumBandConfigs[qualifier.aumBand];

  const [values, setValues] = useState<UserInputs>(defaults.user);
  const [payout, setPayout] = useState(defaults.params.advisorPayout);

  const update = <K extends keyof UserInputs>(key: K, val: UserInputs[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-[70vh] bg-[#f4f4f4] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fb5607] mb-3">
            Review Assumptions
          </p>
          <h1 className="text-2xl font-bold text-[#140f0c]">
            Review your planning defaults
          </h1>
          <p className="text-[#140f0c]/55 mt-2 max-w-md mx-auto">
            Defaults are based on {profile.label} firms at {band.label} AUM. Adjust below or proceed directly.
          </p>
        </div>

        <div className="bg-white border border-[#140f0c]/8 shadow-lg p-8" style={{ borderRadius: 10 }}>
          <AumInput value={values.aum} onChange={(v) => update('aum', v)} />

          <div className="mt-3 pt-3 border-t border-[#140f0c]/8">
            <SliderInput label="Blended fee rate" value={values.feeRate} onChange={(v) => update('feeRate', v)} min={20} max={150} step={5} unit="bps" />
            <SliderInput label="Organic growth rate" value={values.organicGrowth} onChange={(v) => update('organicGrowth', v)} min={0} max={100} step={1} unit="%" />
            <SliderInput label="EBITDA margin" value={values.ebitdaMargin} onChange={(v) => update('ebitdaMargin', v)} min={15} max={50} step={5} unit="%" />
            <SliderInput label="Advisor payout" value={payout} onChange={setPayout} min={20} max={70} step={1} unit="%" />
          </div>

          <p className="text-xs text-[#140f0c]/40 mt-5 leading-relaxed">
            These are directional planning estimates. You can refine them on the results page as well.
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="text-sm text-[#140f0c]/40 hover:text-[#3b84ff] flex items-center gap-1 transition-colors"
            >
              <span className="text-base leading-none">&larr;</span> Back
            </button>
            <button
              onClick={() => onCalculate(values, payout)}
              className="btn-primary flex items-center gap-2"
            >
              See My Results
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}