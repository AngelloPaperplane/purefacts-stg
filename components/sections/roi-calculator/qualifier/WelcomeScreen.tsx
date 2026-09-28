'use client';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  return (
    <div className="min-h-[70vh] bg-[#f4f4f4] flex items-center justify-center p-6">
      <div className="w-full max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#fb5607] mb-4">
          Enterprise Value Simulator
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#140f0c] tracking-tight leading-tight">
          Model your 5-year revenue opportunity
        </h1>

        <p className="text-[#140f0c]/60 mt-4 text-base leading-relaxed max-w-md mx-auto">
          Estimate the financial impact of better revenue infrastructure, including leakage recovery, pricing alignment, and operational efficiency.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center max-w-lg mx-auto">
          {[
            { label: 'EBITDA Impact', desc: '5-year incremental EBITDA from revenue recovery and pricing' },
            { label: 'Revenue & Pricing', desc: 'Capture leakage and unlock pricing alignment across your book' },
            { label: 'Enterprise Value', desc: 'See the downstream EV impact of improved firm economics' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-[#140f0c]/8 px-5 py-4">
              <div className="text-[#3b84ff] font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-[#140f0c]/55 mt-1 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="btn-primary mt-10 inline-flex items-center gap-2"
        >
          Get Started
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="mt-4 text-xs text-[#140f0c]/50">
          Takes less than 60 seconds &middot; No sign-up required
        </p>
      </div>
    </div>
  );
}