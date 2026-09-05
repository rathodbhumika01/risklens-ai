import React, { useState } from 'react';
import { Transaction } from '../types';
import { SAMPLE_DATASET } from '../data/dataset';
import {
  DollarSign,
  CreditCard,
  Building2,
  Globe,
  KeyRound,
  ShieldAlert,
  Dices,
  Code2,
  ChevronDown,
  User,
  Store,
  Landmark,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface DatasetTransactionCardProps {
  transaction: Transaction;
  onSelectTransaction: (txn: Transaction) => void;
  onPullRandom: () => void;
}

export const DatasetTransactionCard: React.FC<DatasetTransactionCardProps> = ({
  transaction,
  onSelectTransaction,
  onPullRandom,
}) => {
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  const getCounterpartyIcon = (type: string) => {
    switch (type) {
      case 'Mega_Corporation':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'Financial_Institution':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'Small_Business':
        return <Store className="w-4 h-4 text-amber-400" />;
      case 'Individual':
        return <User className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
  };

  const formatTxnType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Randomizer Button & Preset Quick-Select */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onPullRandom}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>Pull Random Transaction</span>
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            From 5,000+ real transaction records
          </span>
        </div>

        {/* Dataset Quick Picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="sample-picker" className="text-xs text-slate-400 whitespace-nowrap">
            Sample:
          </label>
          <select
            id="sample-picker"
            value={transaction.id}
            onChange={(e) => {
              const selected = SAMPLE_DATASET.find((t) => t.id === e.target.value);
              if (selected) onSelectTransaction(selected);
            }}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 max-w-[200px] truncate"
          >
            {SAMPLE_DATASET.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}: {t.name} (${t.Txn_Amount_USD.toFixed(0)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean Labeled Transaction Details Card (No raw JSON as requested) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {transaction.id}
            </span>
            <h3 className="text-sm font-semibold text-white">
              {transaction.name}
            </h3>
          </div>
          {transaction.location && (
            <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-500" />
              {transaction.location}
            </span>
          )}
        </div>

        {/* 6 Labeled Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Transaction Amount */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Transaction Amount
              </span>
              <div className="text-lg font-bold text-white tracking-tight">
                ${transaction.Txn_Amount_USD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Transaction Type */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Transaction Type
              </span>
              <div className="text-sm font-semibold text-slate-200 capitalize">
                {formatTxnType(transaction.Txn_Type)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Counterparty Type */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Counterparty Type
              </span>
              <div className="text-sm font-semibold text-slate-200 capitalize">
                {formatTxnType(transaction.Counterparty_Type)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center">
              {getCounterpartyIcon(transaction.Counterparty_Type)}
            </div>
          </div>

          {/* 4. VPN Used */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                VPN Used
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    transaction.Is_VPN_Used
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {transaction.Is_VPN_Used ? 'Yes (Detected)' : 'No (Direct IP)'}
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                transaction.Is_VPN_Used
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <Globe className="w-5 h-5" />
            </div>
          </div>

          {/* 5. Failed Login Attempts */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Failed Login Attempts
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {transaction.Login_Attempts_Fail_Count}
                </span>
                <span className="text-xs text-slate-500">
                  {transaction.Login_Attempts_Fail_Count === 0 ? '(Clean auth)' : 'pre-auth fails'}
                </span>
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                transaction.Login_Attempts_Fail_Count >= 2
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-slate-800 border-slate-700/60 text-slate-300'
              }`}
            >
              <KeyRound className="w-5 h-5" />
            </div>
          </div>

          {/* 6. Account Status */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
                Account Status
              </span>
              <div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                    transaction.Account_Status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : transaction.Account_Status === 'New_Account'
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {transaction.Account_Status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Secondary Audit Collapsible (Non-intrusive, strictly optional for fintech inspection) */}
        <div className="pt-2 border-t border-slate-800/50">
          <button
            type="button"
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showJsonInspector ? 'Hide raw model payload' : 'Inspect raw model payload'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showJsonInspector ? 'rotate-180' : ''}`} />
          </button>

          {showJsonInspector && (
            <div className="mt-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
              <pre>{JSON.stringify(transaction, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
