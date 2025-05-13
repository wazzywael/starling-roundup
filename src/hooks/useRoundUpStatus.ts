import { useCallback, useEffect, useState } from "react";
import { getAccounts, getTransactions } from "../api/starlingApi";
import type { Transaction } from "../types/types";
import {
  calculateRoundUp,
  getLastRoundUpDate,
  getRoundUpEligibleTransactions,
  isCooldownActive,
} from "../utils/roundupCalculator";

interface RoundUpStatus {
  accountUid: string;
  roundUpAmount: number;
  cooldownActive: boolean;
  lastRoundUpDate: Date | null;
  loading: boolean;
  transactions: Transaction[];
  hasPendingRoundUp: boolean;
  fetchData: () => Promise<void>;
}

export function useRoundUpStatus(): RoundUpStatus {
  const [accountUid, setAccountUid] = useState("");
  const [roundUpAmount, setRoundUpAmount] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [lastRoundUpDate, setLastRoundUpDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasPendingRoundUp, setHasPendingRoundUp] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const account = await getAccounts();
      const accountUid = account.accountUid;
      const defaultCategory = account.defaultCategory;
      setAccountUid(accountUid);

      const all = await getTransactions(accountUid, defaultCategory);
      setTransactions(all);

      const last = getLastRoundUpDate(all);
      const eligible = getRoundUpEligibleTransactions(all);
      const trulyEligible = last
      ? eligible.filter(tx => new Date(tx.transactionTime) > last)
      : eligible;
      const amount = calculateRoundUp(trulyEligible);
      const hasPendingRoundUp = trulyEligible.length > 0 && amount > 0;
      setHasPendingRoundUp(hasPendingRoundUp);

      setRoundUpAmount(amount);
      setLastRoundUpDate(last);
      setCooldownActive(isCooldownActive(last));
    } catch (err) {
      console.error("Error loading round-up status", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    accountUid,
    roundUpAmount,
    cooldownActive,
    lastRoundUpDate,
    loading,
    transactions,
    hasPendingRoundUp,
    fetchData,
  };
}
