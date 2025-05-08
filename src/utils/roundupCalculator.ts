import type { Transaction } from "../types/types";

export function calculateRoundUp(transactions: Transaction[]): number {
  return transactions
    .filter(item => item.direction === "OUT")
    .reduce((sum, item) => {
      const spent = item.amount.minorUnits;
      const roundUp = 100 - (spent % 100);
      return roundUp !== 100 ? sum + roundUp : sum;
    }, 0);
}
