import React, { useState } from 'react';
import { RiskAnalysisResult } from '../types';
import { RiskGauge } from './RiskGauge';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
  UserCheck,
  CheckCircle2,
  Share2,
  Copy,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ResultsSectionProps {
  result: RiskAnalysisResult;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-blue-400" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-amber-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'ShieldAlert':
      default:
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium Severity
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Normal / Safe
          </span>
        );
    }
  };

  const handleCopyAudit = () => {
    const text = `RiskLens AI Analysis
Transaction ID: ${result.transactionSnapshot.id}
Score: ${result.score}% (${result.level} Risk)
Action: ${result.recommendedAction.type}
Timestamp: ${result.analyzedAt}
Explanation: ${result.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  const isHighRisk = result.level === 'High';
  const isMediumRisk = result.level === 'Medium';

  return (
    <section
      id="analysis-results"
      aria-label="Analysis Results"
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Result Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Transaction Risk Assessment
          </h2>
          <p className="text-xs text-slate-400">
            Evaluated by Random Forest Classifier against 5,000+ benchmarked fraud signatures
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Analyzed at {result.analyzedAt}</span>
          <button
            onClick={handleCopyAudit}
            className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Copy audit summary to clipboard"
          >
            {copiedAudit ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Grid: Large Risk Score Card (A) & Recommended Action (D) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* A. Large Risk Score Card */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-between relative overflow-hidden shadow-sm">
          {/* Subtle colored glow corner */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 pointer-events-none ${
              isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />

          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Risk Score
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Confidence: {(result.modelConfidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="my-3">
            <RiskGauge score={result.score} level={result.level} size={185} />
          </div>

          <div className="w-full text-center pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            {result.level === 'Low' && (
              <span className="text-emerald-400 font-medium">
                Safe transaction profile with normal attributes
              </span>
            )}
            {result.level === 'Medium' && (
              <span className="text-amber-400 font-medium">
                Elevated risk indicators detected; proceed with caution
              </span>
            )}
            {result.level === 'High' && (
              <span className="text-rose-400 font-medium">
                Severe fraud probability; critical warning triggers
              </span>
            )}
          </div>
        </div>

        {/* D. Recommended Action */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recommended Action
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Decision SLA: Immediate
              </span>
            </div>

            {/* Action Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${result.recommendedAction.bgClass} ${result.recommendedAction.borderClass}`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-950/70 border border-current flex items-center justify-center flex-shrink-0">
                {getActionIcon(result.recommendedAction.iconName)}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {result.recommendedAction.type}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${result.recommendedAction.badgeClass}`}
                  >
                    {result.recommendedAction.subtitle}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.recommendedAction.description}
                </p>
              </div>
            </div>

            {/* Transaction Key Metrics Quick Glance */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 block">Amount</span>
                <span className="text-xs font-bold text-white">
                  ${result.transactionSnapshot.Txn_Amount_USD.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 block">Network</span>
                <span className="text-xs font-bold text-white">
                  {result.transactionSnapshot.Is_VPN_Used ? 'VPN Proxy' : 'Direct IP'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 block">Failed Logins</span>
                <span className="text-xs font-bold text-white">
                  {result.transactionSnapshot.Login_Attempts_Fail_Count} attempts
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Operational standard operating procedure
            </span>
            <button
              type="button"
              onClick={() => setActionExecuted(true)}
              disabled={actionExecuted}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                actionExecuted
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95'
              }`}
            >
              {actionExecuted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Action Recorded in Log</span>
                </>
              ) : (
                <>
                  <span>Apply Recommended Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* B. Risk Explanation Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Why did the AI flag this?
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Natural Language Reasoning
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-200 text-sm leading-relaxed">
          {result.explanation}
        </div>
      </div>

      {/* C. Key Risk Signals */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            Key Risk Signals ({result.signals.length})
          </h3>
          <span className="text-xs text-slate-400">
            Correlated across 40+ transaction attributes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.signals.map((sig) => (
            <div
              key={sig.id}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {sig.title}
                  </h4>
                  {getSeverityBadge(sig.severity)}
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed">
                  {sig.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
