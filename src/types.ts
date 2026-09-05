export type TransactionType =
  | 'POS_Purchase'
  | 'Online_Transfer'
  | 'ATM_Withdrawal'
  | 'Wire_Transfer'
  | 'Peer_To_Peer'
  | 'Crypto_Exchange';

export type CounterpartyType =
  | 'Individual'
  | 'Small_Business'
  | 'Mega_Corporation'
  | 'Financial_Institution'
  | 'Unverified_Merchant';

export type AccountStatus =
  | 'Active'
  | 'Suspended'
  | 'Dormant'
  | 'Flagged'
  | 'New_Account';

export interface Transaction {
  id: string;
  name: string;
  Txn_Amount_USD: number;
  Txn_Type: string;
  Counterparty_Type: string;
  Is_VPN_Used: boolean;
  Login_Attempts_Fail_Count: number;
  Transactions_In_Last_Hour: number;
  Account_Status: string;
  timestamp?: string;
  location?: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskSignal {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'amount' | 'auth' | 'network' | 'velocity' | 'account' | 'counterparty';
}

export type ActionType =
  | 'Approve Transaction'
  | 'Monitor Transaction'
  | 'Send for Manual Review'
  | 'Hold Transaction'
  | 'Block Transaction';

export interface RecommendedAction {
  type: ActionType;
  subtitle: string;
  description: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  iconName: string;
}

export interface RiskAnalysisResult {
  score: number;
  level: RiskLevel;
  explanation: string;
  signals: RiskSignal[];
  recommendedAction: RecommendedAction;
  modelConfidence: number;
  analyzedAt: string;
  transactionSnapshot: Transaction;
}