// src/types/types.ts

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
  