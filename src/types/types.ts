export interface Account {
  accountUid: string;
  defaultCategory: string;
}

export interface Transaction {
  amount: {
    currency: string;
    minorUnits: number;
  };
  direction: "IN" | "OUT";
  transactionTime: string;
  source: string;
  reference: string;
}

export interface Savings {
  name: string,
  savingsGoalUid: string,
}