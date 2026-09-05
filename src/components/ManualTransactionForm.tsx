import React from 'react';
import { Transaction, CounterpartyType, AccountStatus } from '../types';
import {
  DollarSign,
  KeyRound,
  Globe,
  Clock,
  Building,
  ShieldAlert,
  HelpCircle,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_MANUAL_TRANSACTION } from '../data/dataset';

interface ManualTransactionFormProps {
  transaction: Transaction;
  onChange: (updated: Transaction) => void;
  onReset: () => void;
}

export const ManualTransactionForm: React.FC<ManualTransactionFormProps> = ({
  transaction,
  onChange,
  onReset,
}) => {
  const updateField = <K extends keyof Transaction>(field: K, value: Transaction[K]) => {
    onChange({
      ...transaction,
      [field]: value,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateField('Txn_Amount_USD', isNaN(val) ? 0 : Math.max(0, val));
  };

  const adjustNumber = (
    field: 'Login_Attempts_Fail_Count' | 'Transactions_In_Last_Hour',
    delta: number,
    min: number = 0,
    max: number = 50
  ) => {
    const current = transaction[field] || 0;
    const nextVal = Math.max(min, Math.min(max, current + delta));
    updateField(field, nextVal);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Top note & reset */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Manual Parameter Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust individual variables to test how the AI risk model responds to behavioral changes.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
          title="Reset to standard defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Grid of 6 Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field 1: Transaction Amount (USD) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-amount"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span>Transaction Amount (USD)</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Amounts over $1,500 elevate fraud probability scoring.
              </div>
            </div>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 font-medium text-sm">$</span>
            <input
              id="manual-amount"
              type="number"
              step="0.01"
              min="0"
              value={transaction.Txn_Amount_USD || ''}
              onChange={handleAmountChange}
              placeholder="100.00"
              className="w-full bg-slate-900 text-white font-medium pl-8 pr-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Field 2: Failed Login Attempts */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-failed-logins"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Failed Login Attempts</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-52 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Multiple failed attempts before a transaction strongly signal brute-force or credential stuffing.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustNumber('Login_Attempts_Fail_Count', -1, 0, 10)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              aria-label="Decrease failed login attempts"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="manual-failed-logins"
              type="number"
              min="0"
              max="10"
              value={transaction.Login_Attempts_Fail_Count}
              onChange={(e) =>
                updateField('Login_Attempts_Fail_Count', Math.max(0, parseInt(e.target.value) || 0))
              }
              className="flex-1 bg-slate-900 text-center text-white font-semibold py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => adjustNumber('Login_Attempts_Fail_Count', 1, 0, 10)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              aria-label="Increase failed login attempts"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Field 3: VPN Used */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-vpn-toggle"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Was a VPN Used?</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Anonymizing VPNs mask IP addresses and alter geolocation risk calculations.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">
              {transaction.Is_VPN_Used
                ? 'VPN / Proxy masking enabled'
                : 'Direct residential IP'}
            </span>
            <button
              id="manual-vpn-toggle"
              type="button"
              role="switch"
              aria-checked={transaction.Is_VPN_Used}
              onClick={() => updateField('Is_VPN_Used', !transaction.Is_VPN_Used)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                transaction.Is_VPN_Used ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  transaction.Is_VPN_Used ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Field 4: Transactions Made in the Last Hour */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-velocity"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Transactions Made in Last Hour</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Velocity checks trigger on rapid bursts of checkout attempts.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustNumber('Transactions_In_Last_Hour', -1, 1, 30)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              aria-label="Decrease velocity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              id="manual-velocity"
              type="number"
              min="1"
              max="30"
              value={transaction.Transactions_In_Last_Hour}
              onChange={(e) =>
                updateField('Transactions_In_Last_Hour', Math.max(1, parseInt(e.target.value) || 1))
              }
              className="flex-1 bg-slate-900 text-center text-white font-semibold py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={() => adjustNumber('Transactions_In_Last_Hour', 1, 1, 30)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              aria-label="Increase velocity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Field 5: Account Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-account-status"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Account Status</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Suspended, Dormant, or Flagged accounts carry high prior risk weight.
              </div>
            </div>
          </div>
          <select
            id="manual-account-status"
            value={transaction.Account_Status}
            onChange={(e) => updateField('Account_Status', e.target.value as AccountStatus)}
            className="w-full bg-slate-900 text-white font-medium px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="Active">Active (Healthy status)</option>
            <option value="New_Account">New Account (&lt; 30 days old)</option>
            <option value="Dormant">Dormant (Inactive &gt; 180 days)</option>
            <option value="Flagged">Flagged (Previous incident review)</option>
            <option value="Suspended">Suspended (Restricted activity)</option>
          </select>
        </div>

        {/* Field 6: Counterparty Type */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="manual-counterparty"
              className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Who is Receiving the Money?</span>
            </label>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-[11px] text-slate-200 rounded shadow-lg border border-slate-700 z-10 pointer-events-none">
                Unverified merchants and private individuals carry higher chargeback exposure.
              </div>
            </div>
          </div>
          <select
            id="manual-counterparty"
            value={transaction.Counterparty_Type}
            onChange={(e) => updateField('Counterparty_Type', e.target.value as CounterpartyType)}
            className="w-full bg-slate-900 text-white font-medium px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
          >
            <option value="Individual">Individual (P2P)</option>
            <option value="Small_Business">Small Business (Verified Merchant)</option>
            <option value="Mega_Corporation">Mega Corporation (Enterprise Tier-1)</option>
            <option value="Financial_Institution">Financial Institution (Bank / Broker)</option>
            <option value="Unverified_Merchant">Unverified Merchant (High Exposure)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
