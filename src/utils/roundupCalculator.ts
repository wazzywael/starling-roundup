// src/utils/roundupCalculator.ts

import type { Transaction } from "../types/types";

export function calculateRoundUp(transactions: Transaction[]): number {
  return transactions
    .filter(tx => tx.direction === "OUT")
    .reduce((sum, tx) => {
      const spent = tx.amount.minorUnits;
      const roundUp = 100 - (spent % 100);
      return roundUp !== 100 ? sum + roundUp : sum;
    }, 0);
}
