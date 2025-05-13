import type { Transaction } from "../types/types";

/**
 * Calculate the total round-up amount from a list of eligible transactions.
 */
export function calculateRoundUp(transactions: Transaction[]): number {
  return transactions
    .filter((transaction) => transaction.direction === "OUT")
    .reduce((sum, transaction) => {
      const spent = transaction.amount.minorUnits;
      const roundUp = 100 - (spent % 100);
      return roundUp !== 100 ? sum + roundUp : sum;
    }, 0);
}

/**
 * Identify past round-up transfer transactions.
 * These are INTERNAL_TRANSFERs to the "Round-up Saver".
 */
export function filterRoundUpTransfers(
  transactions: Transaction[]
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.direction === "OUT" &&
      transaction.source === "INTERNAL_TRANSFER" &&
      transaction.counterPartyName === "Round-up Saver"
  );
}

/**
 * Get the date of the most recent round-up transfer.
 */
export function getLastRoundUpDate(transactions: Transaction[]): Date | null {
  const transfers = filterRoundUpTransfers(transactions);

  if (!transfers.length) return null;

  const mostRecent = transfers.reduce((latest, transaction) =>
    new Date(transaction.transactionTime) > new Date(latest.transactionTime)
      ? transaction
      : latest
  );

  return new Date(mostRecent.transactionTime);
}

/**
 * Determine if the 7-day round-up cooldown is active.
 */
export function isCooldownActive(lastRoundUpDate: Date | null): boolean {
  if (!lastRoundUpDate) return false;

  const cooldownEnd = new Date(lastRoundUpDate);
  cooldownEnd.setDate(cooldownEnd.getDate() + 7);

  return Date.now() < cooldownEnd.getTime();
}

/**
 * Get transactions that are eligible to be included in round-up.
 * Excludes internal round-up transfers.
 */
export function getRoundUpEligibleTransactions(
  transactions: Transaction[]
): Transaction[] {
  const roundUpTransferIds = new Set(
    filterRoundUpTransfers(transactions).map((transaction) => transaction.feedItemUid)
  );

  return transactions.filter((transaction) => !roundUpTransferIds.has(transaction.feedItemUid));
}
