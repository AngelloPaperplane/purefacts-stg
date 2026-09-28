'use client';

import { useState } from 'react';
import type { FirmProfile, Role, AumBand, FirmChallenge, QualifierSelection } from '@/lib/roi-calculator/types';
import { StepFirmProfile } from './StepFirmProfile';
import { StepRole } from './StepRole';
import { StepChallenges } from './StepChallenges';
import { StepAumBand } from './StepAumBand';

interface Props {
  onComplete: (selection: QualifierSelection) => void;
  initialStep?: number;
  initialQualifier?: QualifierSelection;
}

const STEP_LABELS = ['Firm profile', 'Your role', 'AUM range', 'Current problems'];

export function QualifierGate({ onComplete, initialStep, initialQualifier }: Props) {
  const [step, setStep] = useState(initialStep ?? 0);
  const [firmProfile, setFirmProfile] = useState<FirmProfile | null>(initialQualifier?.firmProfile ?? null);
  const [role, setRole] = useState<Role | null>(initialQualifier?.role ?? null);
  const [aumBand, setAumBand] = useState<AumBand | null>(initialQualifier?.aumBand ?? null);
  const [challenges, setChallenges] = useState<FirmChallenge[]>(initialQualifier?.challenges ?? []);

  const handleFirmProfile = (fp: FirmProfile) => { setFirmProfile(fp); setStep(1); };
  const handleRole = (r: Role) => { setRole(r); setStep(2); };
  const handleAumBand = (ab: AumBand) => { setAumBand(ab); setStep(3); };
  const handleChallengeToggle = (value: FirmChallenge) => {
    setChallenges((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };
  const handleChallengesContinue = () => {
    if (firmProfile && role && aumBand && challenges.length > 0) {
      onComplete({ firmProfile, role, aumBand, challenges });
    }
  };
  const handleBack = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="min-h-[70vh] bg-[#f4f4f4] flex items-center justify-center p-6">
      <div className={`w-full ${step === 3 ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <div className="text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fb5607] mb-3">
            Enterprise Value Simulator
          </p>
          <h1 className="text-2xl font-bold text-[#140f0c]">
            Tell us about your firm
          </h1>
          <p className="text-[#140f0c]/55 mt-1">
            We&#39;ll tailor the model to your profile and priorities.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`h-1 w-16 sm:w-20 transition-colors duration-300 ${
                  i <= step ? 'bg-[#3b84ff]' : 'bg-[#140f0c]/15'
                }`}
              />
              <span className="text-[11px] text-[#140f0c]/55 mt-1.5 hidden sm:block">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white border border-[#140f0c]/8 shadow-lg p-8 md:p-8" style={{ borderRadius: 10 }}>
          {step === 0 && <StepFirmProfile onSelect={handleFirmProfile} />}
          {step === 1 && <StepRole onSelect={handleRole} onBack={handleBack} />}
          {step === 2 && <StepAumBand onSelect={handleAumBand} onBack={handleBack} />}
          {step === 3 && (
            <StepChallenges
              selected={challenges}
              onToggle={handleChallengeToggle}
              onContinue={handleChallengesContinue}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}