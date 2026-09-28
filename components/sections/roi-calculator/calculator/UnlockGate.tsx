'use client';

import { useState } from 'react';
import type { QualifierSelection, UserInputs, ModelOutputs, ModelParameters } from '@/lib/roi-calculator/types';
import { buildContextString, submitToHubSpot } from '@/lib/roi-calculator/hubspot';

export interface LeadInfo {
  name: string;
  email: string;
  company: string;
}

interface Props {
  qualifier: QualifierSelection;
  userInputs: UserInputs;
  modelParams: ModelParameters;
  modelOutputs: ModelOutputs;
  onUnlock: (info: LeadInfo) => void;
}

export function UnlockGate({ qualifier, userInputs, modelParams, modelOutputs, onUnlock }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [sendCase, setSendCase] = useState(true);
  const [sending, setSending] = useState(false);

  const isValid = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const handleSubmit = async () => {
    if (!isValid) return;
    setSending(true);
    const context = buildContextString(qualifier, userInputs, modelParams, modelOutputs);
    const action = sendCase ? 'Unlock Report + Business Case Requested' : 'Unlock Report';
    await submitToHubSpot(name, email, company, action, context);
    setSending(false);
    onUnlock({ name, email, company });
  };

  const inputClass = `w-full border border-[#140f0c]/15 px-3 py-2 text-sm text-[#140f0c]
                      focus:outline-none focus:ring-2 focus:ring-[#3b84ff]/40 focus:border-[#3b84ff]
                      transition-colors placeholder:text-[#140f0c]/30`;

  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center pt-6 sm:pt-12 overflow-y-auto">
      <div className="bg-white border border-[#140f0c]/12 shadow-2xl w-full max-w-md p-6 sm:p-8 mx-4 mb-6" style={{ borderRadius: 10 }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#3b84ff]/10 mb-3">
            <svg className="w-6 h-6 text-[#3b84ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#140f0c]">Unlock the Full Report</h3>
          <p className="text-sm text-[#140f0c]/55 mt-1">
            Enter your details to see the complete analysis. A PureFacts representative will follow up.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#140f0c]/50 block mb-1">
              Name <span className="text-[#fb5607]">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} style={{ borderRadius: 6 }} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#140f0c]/50 block mb-1">
              Work email <span className="text-[#fb5607]">*</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={inputClass} style={{ borderRadius: 6 }} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#140f0c]/50 block mb-1">
              Company <span className="text-[#140f0c]/25">(optional)</span>
            </label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className={inputClass} style={{ borderRadius: 6 }} />
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={sendCase}
              onChange={(e) => setSendCase(e.target.checked)}
              className="border-[#140f0c]/25 text-[#3b84ff] focus:ring-[#3b84ff]/40"
            />
            <span className="text-sm text-[#140f0c]/70">Sign up for marketing emails</span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || sending}
          className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Unlocking...' : 'Unlock Report'}
        </button>
      </div>
    </div>
  );
}