export interface Account {
  accountUid: string;
  defaultCategory: string;
}

export interface Transaction {
  amount: {
    currency: string;
    minorUnits: number;
  };
  counterPartyName: string;
  direction: "IN" | "OUT";
  feedItemUid: string;
  transactionTime: string;
  source: string;
  reference: string;
}

export interface Savings {
  name: string;
  savingsGoalUid: string;
  totalSaved: {
    minorUnits: number;
  };
}
