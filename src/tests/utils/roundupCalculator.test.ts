import {
  calculateRoundUp,
  filterRoundUpTransfers,
  getLastRoundUpDate,
  isCooldownActive,
  getRoundUpEligibleTransactions,
} from "../../utils/roundupCalculator";
import type { Transaction } from "../../types/types";

const baseTransaction = {
  amount: { currency: "GBP", minorUnits: 199 },
  counterPartyName: "Vendor",
  direction: "OUT" as const,
  feedItemUid: "tx-1",
  transactionTime: new Date("2024-05-01").toISOString(),
  source: "CARD",
  reference: "Ref",
};

describe("roundupCalculator utils", () => {
  describe("calculateRoundUp", () => {
    it("calculates correct round-up amount", () => {
      const transactions: Transaction[] = [
        { ...baseTransaction, amount: { currency: "GBP", minorUnits: 199 } }, // 1p
        { ...baseTransaction, amount: { currency: "GBP", minorUnits: 250 } }, // 50p
        { ...baseTransaction, amount: { currency: "GBP", minorUnits: 400 } }, // 0p (skip)
        {
          ...baseTransaction,
          direction: "IN",
          amount: { currency: "GBP", minorUnits: 120 },
        }, // IN (skip)
      ];

      const result = calculateRoundUp(transactions);
      expect(result).toBe(1 + 50); // 51
    });
  });

  describe("filterRoundUpTransfers", () => {
    it("filters round-up transfer transactions", () => {
      const transactions: Transaction[] = [
        {
          ...baseTransaction,
          feedItemUid: "a",
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Round-up Saver",
        },
        {
          ...baseTransaction,
          feedItemUid: "b",
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Other Saver",
        },
        {
          ...baseTransaction,
          feedItemUid: "c",
          source: "CARD",
        },
      ];

      const result = filterRoundUpTransfers(transactions);
      expect(result).toHaveLength(1);
      expect(result[0].feedItemUid).toBe("a");
    });
  });

  describe("getLastRoundUpDate", () => {
    it("returns null if no transfers", () => {
      const transactions: Transaction[] = [
        { ...baseTransaction, source: "CARD" },
      ];

      expect(getLastRoundUpDate(transactions)).toBeNull();
    });

    it("returns date of the most recent round-up transfer", () => {
      const transactions: Transaction[] = [
        {
          ...baseTransaction,
          feedItemUid: "x",
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Round-up Saver",
          transactionTime: new Date("2024-04-01").toISOString(),
        },
        {
          ...baseTransaction,
          feedItemUid: "y",
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Round-up Saver",
          transactionTime: new Date("2024-05-01").toISOString(),
        },
      ];

      const result = getLastRoundUpDate(transactions);
      expect(result?.toISOString()).toBe(new Date("2024-05-01").toISOString());
    });
  });

  describe("isCooldownActive", () => {
    it("returns false if no last round-up date", () => {
      expect(isCooldownActive(null)).toBe(false);
    });

    it("returns true if within 7 days", () => {
      const last = new Date();
      last.setDate(last.getDate() - 3);

      expect(isCooldownActive(last)).toBe(true);
    });

    it("returns false if more than 7 days ago", () => {
      const last = new Date();
      last.setDate(last.getDate() - 10);

      expect(isCooldownActive(last)).toBe(false);
    });
  });

  describe("getRoundUpEligibleTransactions", () => {
    it("filters out transactions that are round-up transfers", () => {
      const transactions: Transaction[] = [
        {
          ...baseTransaction,
          feedItemUid: "1",
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Round-up Saver",
        },
        {
          ...baseTransaction,
          feedItemUid: "2",
          source: "CARD",
        },
      ];

      const result = getRoundUpEligibleTransactions(transactions);
      expect(result).toHaveLength(1);
      expect(result[0].feedItemUid).toBe("2");
    });
  });
});
