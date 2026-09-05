import React from 'react';
import { ChevronDown, Info, SlidersHorizontal, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ isExpanded, onToggle }) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-300">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Info className="w-3 h-3" />
          </span>
          <span>How RiskLens AI Works</span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            (3-step automated fraud intelligence)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{isExpanded ? 'Hide' : 'Show steps'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-blue-400' : 'text-slate-500'
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select or Enter Details</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Choose a real transaction from the historical dataset or input custom parameters such as amount, login attempts, and network proxy.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Risk Evaluation</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  The Random Forest model correlates 40+ behavioral attributes to compute an objective fraud probability score from 0% to 100%.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actionable Intelligence</span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  Receive a plain-English explanation of why the risk score was flagged, warning signal badges, and recommended banking response.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
