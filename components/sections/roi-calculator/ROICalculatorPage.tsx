'use client';

import { useState, useCallback } from 'react';
import type { QualifierSelection, UserInputs } from '@/lib/roi-calculator/types';
import { WelcomeScreen } from './qualifier/WelcomeScreen';
import { QualifierGate } from './qualifier/QualifierGate';
import { AssumptionsReview } from './qualifier/AssumptionsReview';
import { LoadingTransition } from './LoadingTransition';
import { Calculator } from './calculator/Calculator';

type FlowStep =
  | { id: 'welcome' }
  | { id: 'qualifier'; resumeAtStep?: number; qualifier?: QualifierSelection }
  | { id: 'assumptions'; qualifier: QualifierSelection }
  | { id: 'loading'; qualifier: QualifierSelection; inputOverrides: UserInputs; payoutOverride: number }
  | { id: 'results'; qualifier: QualifierSelection; inputOverrides: UserInputs; payoutOverride: number };

export default function ROICalculatorPage() {
  const [step, setStep] = useState<FlowStep>({ id: 'welcome' });

  const handleStart = useCallback(() => setStep({ id: 'qualifier' }), []);

  const handleQualifierComplete = useCallback((selection: QualifierSelection) => {
    setStep({ id: 'assumptions', qualifier: selection });
  }, []);

  const handleCalculate = useCallback(
    (_inputOverrides: UserInputs, payoutOverride: number, qualifier: QualifierSelection) => {
      setStep({ id: 'loading', qualifier, inputOverrides: _inputOverrides, payoutOverride });
    },
    [],
  );

  const handleLoadingComplete = useCallback(() => {
    if (step.id !== 'loading') return;
    setStep({ id: 'results', qualifier: step.qualifier, inputOverrides: step.inputOverrides, payoutOverride: step.payoutOverride });
  }, [step]);

  const handleChangeProfile = useCallback(() => setStep({ id: 'welcome' }), []);

  const handleBack = useCallback(() => {
    if (step.id === 'assumptions') {
      // Return to QualifierGate starting at the challenges step (step 3)
      setStep({ id: 'qualifier', resumeAtStep: 3, qualifier: step.qualifier });
    } else if (step.id === 'qualifier') {
      setStep({ id: 'welcome' });
    }
  }, [step]);

  if (step.id === 'welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (step.id === 'qualifier') {
    return (
      <QualifierGate
        onComplete={handleQualifierComplete}
        initialStep={step.resumeAtStep}
        initialQualifier={step.qualifier}
      />
    );
  }

  if (step.id === 'assumptions') {
    return (
      <AssumptionsReview
        qualifier={step.qualifier}
        onCalculate={(overrides, payout) => handleCalculate(overrides, payout, step.qualifier)}
        onBack={handleBack}
      />
    );
  }

  if (step.id === 'loading') {
    return (
      <LoadingTransition
        qualifier={step.qualifier}
        onComplete={handleLoadingComplete}
      />
    );
  }

  if (step.id === 'results') {
    return (
      <Calculator
        qualifier={step.qualifier}
        initialUserInputs={step.inputOverrides}
        initialPayoutOverride={step.payoutOverride}
        onChangeProfile={handleChangeProfile}
      />
    );
  }

  return null;
}