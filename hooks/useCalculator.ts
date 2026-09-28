'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
  QualifierSelection,
  UserInputs,
  ModelParameters,
  ModelOutputs,
} from '@/lib/roi-calculator/types';
import { buildDefaults } from '@/lib/roi-calculator/presets';
import { computeAll } from '@/lib/roi-calculator/model';

export function useCalculator(
  qualifier: QualifierSelection,
  initialUserInputs?: UserInputs | null,
  initialPayoutOverride?: number | null,
) {
  const defaults = useMemo(
    () => buildDefaults(qualifier.firmProfile, qualifier.aumBand),
    [qualifier.firmProfile, qualifier.aumBand],
  );

  // Seed state from the assumptions screen if provided, otherwise fall back to profile defaults
  const seedInputs = initialUserInputs ?? defaults.user;
  const seedPayout = initialPayoutOverride ?? defaults.params.advisorPayout;

  const [userInputs, setUserInputs] = useState<UserInputs>(seedInputs);
  const [modelParams, setModelParams] = useState<ModelParameters>(() => ({
    ...defaults.params,
    advisorPayout: seedPayout,
  }));

  const modelOutputs: ModelOutputs = useMemo(
    () => computeAll({ user: userInputs, params: modelParams }),
    [userInputs, modelParams],
  );

  const updateUserInput = useCallback(
    <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
      setUserInputs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateAdvisorPayout = useCallback((value: number) => {
    setModelParams((prev) => ({ ...prev, advisorPayout: value }));
  }, []);

  // Reset goes back to what the user set on the assumptions screen, not profile defaults
  const resetToDefaults = useCallback(() => {
    setUserInputs(seedInputs);
    setModelParams((prev) => ({ ...prev, advisorPayout: seedPayout }));
  }, [seedInputs, seedPayout]);

  return {
    userInputs,
    modelParams,
    modelOutputs,
    defaults,
    updateUserInput,
    updateAdvisorPayout,
    resetToDefaults,
  };
}