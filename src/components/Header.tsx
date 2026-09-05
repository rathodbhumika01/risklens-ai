import React from 'react';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenHowItWorks?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowItWorks }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Branding on the Left */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20 text-white">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                RiskLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Fintech Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              AI-powered transaction risk intelligence
            </p>
          </div>
        </div>

        {/* Status Indicator & Quick Guide on the Right */}
        <div className="flex items-center gap-3">
          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
              title="Learn how RiskLens scores transactions"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>How it works</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-200 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              AI Model Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
