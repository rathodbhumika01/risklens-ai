import React, { useState } from 'react';
import { Header } from './components/Header';
import { HowItWorks } from './components/HowItWorks';
import { DatasetTransactionCard } from './components/DatasetTransactionCard';
import { ManualTransactionForm } from './components/ManualTransactionForm';
import { ResultsSection } from './components/ResultsSection';
import { Footer } from './components/Footer';

import {
  Transaction,
  RiskAnalysisResult,
  RiskSignal,
  RecommendedAction,
  RiskLevel,
} from './types';

import {
  SAMPLE_DATASET,
  DEFAULT_MANUAL_TRANSACTION,
  getRandomDatasetTransaction,
} from './data/dataset';

import {
  Database,
  PenTool,
  Search,
  Loader2,
} from 'lucide-react';


export default function App() {

  // ----------------------------------
  // UI STATE
  // ----------------------------------

  const [activeTab, setActiveTab] =
    useState<'dataset' | 'manual'>('dataset');

  const [isHowItWorksOpen, setIsHowItWorksOpen] =
    useState(false);

  const [datasetTxn, setDatasetTxn] =
    useState<Transaction>(SAMPLE_DATASET[0]);

  const [manualTxn, setManualTxn] =
    useState<Transaction>(DEFAULT_MANUAL_TRANSACTION);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisResult, setAnalysisResult] =
    useState<RiskAnalysisResult | null>(null);


  // ----------------------------------
  // CURRENT TRANSACTION
  // ----------------------------------

  const currentTransaction =
    activeTab === 'dataset'
      ? datasetTxn
      : manualTxn;


  // ----------------------------------
  // RANDOM DATASET TRANSACTION (real CSV row from backend)
  // ----------------------------------

  const handlePullRandom = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/random-transaction`);
      const data = await res.json();
      setDatasetTxn(data);
    } catch (error) {
      console.error('Failed to pull transaction:', error);
      alert('Unable to fetch a transaction from the backend. Make sure it is running on port 8000.');
    }
  };


  // ----------------------------------
  // GENERATE RISK SIGNALS
  // ----------------------------------

  const generateSignals = (
    transaction: Transaction,
    level: RiskLevel
  ): RiskSignal[] => {

    const signals: RiskSignal[] = [];


    // VPN
    if (transaction.Is_VPN_Used) {

      signals.push({
        id: 'vpn',
        title: 'VPN / Proxy Detected',
        description:
          'The transaction originated through a VPN or proxy connection.',
        severity: 'high',
        category: 'network',
      });

    }


    // FAILED LOGINS
    if (
      transaction.Login_Attempts_Fail_Count >= 2
    ) {

      signals.push({
        id: 'failed-logins',
        title: 'Multiple Failed Logins',
        description:
          `${transaction.Login_Attempts_Fail_Count} failed login attempts were detected.`,
        severity:
          transaction.Login_Attempts_Fail_Count >= 4
            ? 'high'
            : 'medium',
        category: 'auth',
      });

    }


    // TRANSACTION VELOCITY
    if (
      transaction.Transactions_In_Last_Hour >= 3
    ) {

      signals.push({
        id: 'velocity',
        title: 'High Transaction Velocity',
        description:
          `${transaction.Transactions_In_Last_Hour} transactions occurred within the last hour.`,
        severity:
          transaction.Transactions_In_Last_Hour >= 7
            ? 'high'
            : 'medium',
        category: 'velocity',
      });

    }


    // HIGH AMOUNT
    if (
      transaction.Txn_Amount_USD >= 3000
    ) {

      signals.push({
        id: 'amount',
        title: 'High Transaction Amount',
        description:
          `Transaction amount of $${transaction.Txn_Amount_USD.toLocaleString()} is unusually high.`,
        severity:
          transaction.Txn_Amount_USD >= 7000
            ? 'high'
            : 'medium',
        category: 'amount',
      });

    }


    // ACCOUNT STATUS
    if (
      transaction.Account_Status !== 'Active'
    ) {

      signals.push({
        id: 'account',
        title: 'Account Status Alert',
        description:
          `The account status is currently ${transaction.Account_Status}.`,
        severity: 'high',
        category: 'account',
      });

    }


    // UNVERIFIED MERCHANT
    if (
      transaction.Counterparty_Type ===
      'Unverified_Merchant'
    ) {

      signals.push({
        id: 'counterparty',
        title: 'Unverified Counterparty',
        description:
          'The transaction involves an unverified merchant.',
        severity: 'high',
        category: 'counterparty',
      });

    }


    // LOW RISK DEFAULT SIGNAL
    if (signals.length === 0) {

      signals.push({
        id: 'normal',
        title: 'Normal Transaction Pattern',
        description:
          'No significant fraud indicators were detected.',
        severity: 'low',
        category: 'amount',
      });

    }


    return signals;

  };


  // ----------------------------------
  // RECOMMENDED ACTION
  // ----------------------------------

  const getRecommendedAction = (
    level: RiskLevel
  ): RecommendedAction => {

    if (level === 'Low') {

      return {
        type: 'Approve Transaction',
        subtitle: 'LOW RISK',
        description:
          'The transaction shows normal behavior patterns and can be approved.',
        badgeClass:
          'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        bgClass:
          'bg-emerald-500/5',
        borderClass:
          'border-emerald-500/30',
        iconName:
          'ShieldCheck',
      };

    }


    if (level === 'Medium') {

      return {
        type: 'Monitor Transaction',
        subtitle: 'MEDIUM RISK',
        description:
          'Some unusual indicators were detected. Monitor the transaction for additional activity.',
        badgeClass:
          'bg-amber-500/15 text-amber-400 border-amber-500/30',
        bgClass:
          'bg-amber-500/5',
        borderClass:
          'border-amber-500/30',
        iconName:
          'Eye',
      };

    }


    return {
      type: 'Send for Manual Review',
      subtitle: 'HIGH RISK',
      description:
        'Multiple fraud indicators were detected. Manual verification is recommended before approval.',
      badgeClass:
        'bg-rose-500/15 text-rose-400 border-rose-500/30',
      bgClass:
        'bg-rose-500/5',
      borderClass:
        'border-rose-500/30',
      iconName:
        'ShieldAlert',
    };

  };


  // ----------------------------------
  // ANALYZE USING BACKEND API
  // Dataset tab -> real CSV row scored with full features (/score-by-id)
  // Manual tab -> user-entered fields scored with default fillers (/analyze-transaction)
  // ----------------------------------

  const handleAnalyze = async () => {

    setIsAnalyzing(true);

    try {

      const endpoint =
  activeTab === 'dataset'
    ? `${import.meta.env.VITE_API_URL}/score-by-id`
    : `${import.meta.env.VITE_API_URL}/analyze-transaction`;

      const requestBody =
        activeTab === 'dataset'
          ? { id: currentTransaction.id }
          : {
              Txn_Amount_USD: currentTransaction.Txn_Amount_USD,
              Txn_Type: currentTransaction.Txn_Type,
              Counterparty_Type: currentTransaction.Counterparty_Type,
              Is_VPN_Used: currentTransaction.Is_VPN_Used,
              Login_Attempts_Fail_Count: currentTransaction.Login_Attempts_Fail_Count,
              Transactions_In_Last_Hour: currentTransaction.Transactions_In_Last_Hour,
              Account_Status: currentTransaction.Account_Status,
            };

      const response = await fetch(
        endpoint,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify(requestBody),

        }
      );


      if (!response.ok) {

        throw new Error(
          'Backend API error'
        );

      }


      const data =
        await response.json();


      // Convert backend response
      // into frontend UI format

      const riskLevel =
        data.risk_level as RiskLevel;


      const result:
        RiskAnalysisResult = {

        score:
          Math.round(
            data.risk_score * 100
          ),

        level:
          riskLevel,

        explanation:
          data.explanation,

        signals:
          generateSignals(
            currentTransaction,
            riskLevel
          ),

        recommendedAction:
          getRecommendedAction(
            riskLevel
          ),

        modelConfidence:
          Math.max(
            data.risk_score,
            1 - data.risk_score
          ),

        analyzedAt:
          new Date().toLocaleTimeString(),

        transactionSnapshot:
          currentTransaction,

      };


      setAnalysisResult(
        result
      );


      // Scroll to results

      setTimeout(() => {

        const resultEl =
          document.getElementById(
            'analysis-results'
          );

        if (resultEl) {

          resultEl.scrollIntoView({
            behavior:
              'smooth',
            block:
              'start',
          });

        }

      }, 100);


    } catch (error) {

      console.error(
        'Analysis error:',
        error
      );

      alert(
        'Unable to connect to the RiskLens AI backend. Please make sure the backend is running on port 8000.'
      );

    } finally {

      setIsAnalyzing(false);

    }

  };


  // ----------------------------------
  // UI
  // ----------------------------------

  return (

    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">

      <Header
        onOpenHowItWorks={() =>
          setIsHowItWorksOpen(
            (prev) => !prev
          )
        }
      />


      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">


        {/* INTRODUCTION */}

        <section className="space-y-3">

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">

            <div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">

                Transaction Risk Assessment

              </h2>


              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">

                RiskLens AI analyzes transaction attributes to detect fraudulent behavior in real time,
                calculating probability scores and generating clear explanations.

              </p>

            </div>

          </div>


          <HowItWorks
            isExpanded={
              isHowItWorksOpen
            }
            onToggle={() =>
              setIsHowItWorksOpen(
                (prev) => !prev
              )
            }
          />

        </section>


        {/* INPUT METHOD */}

        <section className="space-y-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">

              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">

                1

              </span>

              <span>

                Choose Input Method

              </span>

            </div>


            <span className="text-xs text-slate-500">

              {activeTab === 'dataset'
                ? 'Testing with dataset transactions'
                : 'Custom field parameters'}

            </span>

          </div>


          {/* TABS */}

          <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800">


            <button

              type="button"

              onClick={() =>
                setActiveTab(
                  'dataset'
                )
              }

              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dataset'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}

            >

              <Database className="w-4 h-4" />

              <span>

                Dataset Transaction

              </span>

            </button>


            <button

              type="button"

              onClick={() =>
                setActiveTab(
                  'manual'
                )
              }

              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}

            >

              <PenTool className="w-4 h-4" />

              <span>

                Enter Manually

              </span>

            </button>

          </div>


          {/* TRANSACTION INPUT */}

          <div className="pt-1">

            {activeTab === 'dataset' ? (

              <DatasetTransactionCard

                transaction={
                  datasetTxn
                }

                onSelectTransaction={
                  (txn) =>
                    setDatasetTxn(
                      txn
                    )
                }

                onPullRandom={
                  handlePullRandom
                }

              />

            ) : (

              <ManualTransactionForm

                transaction={
                  manualTxn
                }

                onChange={
                  (updated) =>
                    setManualTxn(
                      updated
                    )
                }

                onReset={() =>
                  setManualTxn(
                    DEFAULT_MANUAL_TRANSACTION
                  )
                }

              />

            )}

          </div>

        </section>


        {/* ANALYZE BUTTON */}

        <section className="pt-2 flex flex-col items-center">

          <button

            type="button"

            onClick={
              handleAnalyze
            }

            disabled={
              isAnalyzing
            }

            className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] py-3.5 px-8 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 border border-blue-400/30"

          >

            {isAnalyzing ? (

              <>

                <Loader2 className="w-5 h-5 animate-spin text-white" />

                <span>

                  Analyzing Risk...

                </span>

              </>

            ) : (

              <>

                <Search className="w-5 h-5 text-blue-200" />

                <span>

                  Analyze Transaction

                </span>

              </>

            )}

          </button>


          <span className="text-[11px] text-slate-500 mt-2">

            Powered by RiskLens AI Machine Learning Model

          </span>

        </section>


        {/* RESULTS */}

        {analysisResult && (

          <div className="pt-4">

            <ResultsSection
              result={
                analysisResult
              }
            />

          </div>

        )}

      </main>


      <Footer />

    </div>

  );

}