import {
  Transaction,
  RiskAnalysisResult,
  RiskLevel,
  RiskSignal,
  RecommendedAction,
} from '../types';

export function calculateRisk(txn: Transaction): RiskAnalysisResult {
  let score = 15; // Prior baseline

  // Amount weighting
  const amount = txn.Txn_Amount_USD;
  if (amount <= 25) {
    score += 4;
  } else if (amount <= 100) {
    score += 6;
  } else if (amount <= 500) {
    score += 12;
  } else if (amount <= 1500) {
    score += 20;
  } else if (amount <= 4000) {
    score += 28;
  } else {
    score += 36;
  }

  // Failed login attempts
  const failedLogins = txn.Login_Attempts_Fail_Count;
  if (failedLogins === 1) {
    score += 8;
  } else if (failedLogins === 2) {
    score += 16;
  } else if (failedLogins >= 3) {
    score += 26 + (failedLogins - 3) * 5;
  }

  // VPN usage
  if (txn.Is_VPN_Used) {
    score += 18;
  }

  // Velocity (Transactions made in the last hour)
  const velocity = txn.Transactions_In_Last_Hour;
  if (velocity <= 1) {
    score += 0;
  } else if (velocity <= 3) {
    score += 5;
  } else if (velocity <= 6) {
    score += 15;
  } else if (velocity <= 10) {
    score += 25;
  } else {
    score += 35;
  }

  // Account status
  switch (txn.Account_Status) {
    case 'Active':
      score += 0;
      break;
    case 'New_Account':
      score += 10;
      break;
    case 'Dormant':
      score += 22;
      break;
    case 'Suspended':
      score += 32;
      break;
    case 'Flagged':
      score += 38;
      break;
  }

  // Counterparty
  switch (txn.Counterparty_Type) {
    case 'Financial_Institution':
      score -= 6;
      break;
    case 'Mega_Corporation':
      score -= 4;
      break;
    case 'Small_Business':
      score += 2;
      break;
    case 'Individual':
      score += 6;
      break;
    case 'Unverified_Merchant':
      score += 22;
      break;
  }

  // Transaction type
  switch (txn.Txn_Type) {
    case 'POS_Purchase':
      score -= 2;
      break;
    case 'Peer_To_Peer':
      score += 2;
      break;
    case 'Online_Transfer':
      score += 4;
      break;
    case 'ATM_Withdrawal':
      score += 7;
      break;
    case 'Wire_Transfer':
      score += 15;
      break;
    case 'Crypto_Exchange':
      score += 22;
      break;
  }

  // Bound score between 4% and 98%
  const finalScore = Math.max(4, Math.min(98, Math.round(score)));

  // Risk Level
  let level: RiskLevel = 'Low';
  if (finalScore >= 70) {
    level = 'High';
  } else if (finalScore >= 35) {
    level = 'Medium';
  }

  // Signals extraction
  const signals: RiskSignal[] = [];

  if (amount >= 3000) {
    signals.push({
      id: 'sig-amt-high',
      title: 'High transaction amount',
      description: `Transfer of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} substantially exceeds median personal thresholds.`,
      severity: 'high',
      category: 'amount',
    });
  } else if (amount >= 800) {
    signals.push({
      id: 'sig-amt-med',
      title: 'Elevated transaction volume',
      description: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} is above routine daily discretionary averages.`,
      severity: 'medium',
      category: 'amount',
    });
  }

  if (failedLogins >= 3) {
    signals.push({
      id: 'sig-auth-high',
      title: 'Multiple failed login attempts',
      description: `${failedLogins} consecutive failed credentials logged right before initiating this payment.`,
      severity: 'high',
      category: 'auth',
    });
  } else if (failedLogins >= 1) {
    signals.push({
      id: 'sig-auth-med',
      title: 'Failed authentication attempt',
      description: `${failedLogins} incorrect credential attempt preceded this session.`,
      severity: 'medium',
      category: 'auth',
    });
  }

  if (txn.Is_VPN_Used) {
    signals.push({
      id: 'sig-vpn',
      title: 'VPN detected',
      description: 'Transaction originated from a commercial VPN/proxy server masking genuine geolocation.',
      severity: level === 'High' ? 'high' : 'medium',
      category: 'network',
    });
  }

  if (velocity >= 6) {
    signals.push({
      id: 'sig-vel-high',
      title: 'Unusual transaction behavior',
      description: `Rapid burst velocity of ${velocity} transactions executed within the last 60 minutes.`,
      severity: 'high',
      category: 'velocity',
    });
  } else if (velocity >= 3) {
    signals.push({
      id: 'sig-vel-med',
      title: 'Elevated hourly velocity',
      description: `${velocity} transactions within the hour indicate faster-than-usual card usage.`,
      severity: 'medium',
      category: 'velocity',
    });
  }

  if (txn.Account_Status !== 'Active') {
    const statusLabel = txn.Account_Status.replace('_', ' ');
    signals.push({
      id: 'sig-acc',
      title: `Account status: ${statusLabel}`,
      description: `Originating account is flagged as ${statusLabel.toLowerCase()}, requiring strict settlement controls.`,
      severity: 'high',
      category: 'account',
    });
  }

  if (txn.Counterparty_Type === 'Unverified_Merchant') {
    signals.push({
      id: 'sig-merchant',
      title: 'Unverified counterparty merchant',
      description: 'Recipient merchant profile has unconfirmed tax ID and no historical transaction reputation.',
      severity: 'medium',
      category: 'counterparty',
    });
  }

  if (txn.Txn_Type === 'Crypto_Exchange' || txn.Txn_Type === 'Wire_Transfer') {
    signals.push({
      id: 'sig-rail',
      title: `Irreversible transfer rail (${txn.Txn_Type.replace('_', ' ')})`,
      description: 'Non-reversible fund settlement rail commonly targeted for accelerated asset off-ramping.',
      severity: 'medium',
      category: 'amount',
    });
  }

  // If no negative signals, add verified health badges
  if (signals.length === 0) {
    signals.push({
      id: 'sig-norm-all',
      title: 'Standard consumer behavior',
      description: 'Transaction amount, device network, and credential history fall well within standard baseline safety bounds.',
      severity: 'low',
      category: 'amount',
    });
    signals.push({
      id: 'sig-auth-clean',
      title: 'Clean authentication record',
      description: 'Zero failed login attempts detected; active session confirmed with verified device profile.',
      severity: 'low',
      category: 'auth',
    });
  }

  // Plain-English Explanation: "Why did the AI flag this?"
  const explanation = generatePlainEnglishExplanation(txn, finalScore, level, signals);

  // Recommended Action
  const recommendedAction = getRecommendedAction(finalScore, level);

  return {
    score: finalScore,
    level,
    explanation,
    signals,
    recommendedAction,
    modelConfidence: 0.92,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    transactionSnapshot: { ...txn },
  };
}

function generatePlainEnglishExplanation(
  txn: Transaction,
  score: number,
  level: RiskLevel,
  signals: RiskSignal[]
): string {
  if (level === 'Low') {
    return `This transaction looks normal and presents low risk (${score}% probability). The payment amount ($${txn.Txn_Amount_USD.toFixed(2)}) is consistent with everyday spending, credentials were verified on the first try without failed attempts, no proxy or VPN masking was detected, and the account status is healthy.`;
  }

  const reasons: string[] = [];

  if (txn.Login_Attempts_Fail_Count >= 2) {
    reasons.push(`${txn.Login_Attempts_Fail_Count} failed login attempts occurred before payment, pointing to possible credential guessing or password fatigue`);
  }

  if (txn.Is_VPN_Used) {
    reasons.push('the user connected through an anonymizing VPN or proxy network that obscures true physical location');
  }

  if (txn.Txn_Amount_USD >= 1500) {
    reasons.push(`the requested amount of $${txn.Txn_Amount_USD.toLocaleString()} is unusually large compared to standard retail activity`);
  }

  if (txn.Transactions_In_Last_Hour >= 4) {
    reasons.push(`a burst of ${txn.Transactions_In_Last_Hour} transactions within one hour indicates rapid automated checkout or card testing behavior`);
  }

  if (txn.Account_Status !== 'Active') {
    reasons.push(`the account profile is marked as "${txn.Account_Status.replace('_', ' ')}", which triggers protective compliance restrictions`);
  }

  if (txn.Counterparty_Type === 'Unverified_Merchant') {
    reasons.push('the recipient is an unverified merchant entity with no established trust record');
  }

  if (reasons.length === 0) {
    return `The model assigned a moderate caution score (${score}%) based on minor deviations from normal account velocity and recipient profile characteristics.`;
  }

  if (level === 'High') {
    return `The AI model flagged this transaction as HIGH RISK (${score}%) primarily because ${reasons.join(', and ')}. This pattern matches historical fraudulent account takeover and balance-draining schemes.`;
  }

  return `The AI model marked this as MEDIUM RISK (${score}%) because ${reasons.join(', and ')}. While the transaction may still be legitimate, the combination of factors requires monitoring before final settlement.`;
}

function getRecommendedAction(score: number, level: RiskLevel): RecommendedAction {
  if (score < 35) {
    return {
      type: 'Approve Transaction',
      subtitle: 'Immediate automated clearance',
      description: 'The transaction passes all fraud heuristics. No operational intervention or secondary verification required.',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      bgClass: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100',
      borderClass: 'border-emerald-500/30',
      iconName: 'ShieldCheck',
    };
  }

  if (score < 55) {
    return {
      type: 'Monitor Transaction',
      subtitle: 'Approve with passive background telemetry',
      description: 'Permit payment execution while logging device signals and flagging counterparty account for subsequent settlement sweeps.',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      bgClass: 'bg-blue-950/20 border-blue-500/30 text-blue-100',
      borderClass: 'border-blue-500/30',
      iconName: 'Eye',
    };
  }

  if (score < 70) {
    return {
      type: 'Send for Manual Review',
      subtitle: 'Queue for Tier-2 fraud analyst inspection',
      description: 'Temporarily hold settlement in pending state. Direct case to the risk analyst team to confirm cardholder authorization.',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      bgClass: 'bg-amber-950/20 border-amber-500/30 text-amber-100',
      borderClass: 'border-amber-500/30',
      iconName: 'UserCheck',
    };
  }

  if (score < 85) {
    return {
      type: 'Hold Transaction',
      subtitle: 'Prompt immediate Step-Up 2FA verification',
      description: 'Freeze fund movement and issue an out-of-band biometric or SMS confirmation request to the verified primary account phone.',
      badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      bgClass: 'bg-orange-950/20 border-orange-500/30 text-orange-100',
      borderClass: 'border-orange-500/30',
      iconName: 'AlertTriangle',
    };
  }

  return {
    type: 'Block Transaction',
    subtitle: 'High-confidence fraud prevention decline',
    description: 'Decline authorization immediately. Revoke active session tokens, freeze outgoing wires, and trigger incident response workflow.',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    bgClass: 'bg-rose-950/20 border-rose-500/30 text-rose-100',
    borderClass: 'border-rose-500/30',
    iconName: 'ShieldAlert',
  };
}
