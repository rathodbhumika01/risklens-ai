import React from 'react';
import { Database, Binary, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-slate-800/80 text-center space-y-3">
      {/* Model Spec Line required by prompt */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
          <Binary className="w-3.5 h-3.5 text-blue-400" />
          Random Forest
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          Trained on 5,000+ transactions
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ROC-AUC: 0.92
        </span>
      </div>

      <div className="text-[11px] text-slate-500">
        RiskLens AI • Enterprise Transaction Risk & Fraud Prevention Intelligence
      </div>
    </footer>
  );
};
