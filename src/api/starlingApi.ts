import type { Account, Savings, Transaction } from "../types/types";
import { http } from "./http";

/**
 * Gets the primary user account from Starling API.
 */
export const getAccounts = async () => {
  const response = await http.request<{ accounts: Account[] }>({
    url: `/api/accounts`,
    method: "GET",
  });
  console.log("response getAccounts", response);

  return response.accounts[0]; // Adjust if needed
};

/**
 * Gets transactions (feed items) for the last 7 days.
 */
export const getTransactions = async (
  accountUid: string,
  categoryUid: string
) => {
  const changesSince = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  console.log("changes since", changesSince);

  const response = await http.request<{ feedItems: Transaction[] }>({
    url: `/api/feed/account/${accountUid}/category/${categoryUid}`,
    method: "GET",
    params: {
      changesSince,
    },
  });

  console.log("response getTransactions", response);

  return response.feedItems;
};

/**
 * Creates a new savings goal.
 */
export const createSavingsGoal = async (accountUid: string) => {
  const response = await http.request<{
    savingsGoalUid: string;
  }>({
    url: `/api/account/${accountUid}/savings-goals`,
    method: "PUT",
    data: {
      name: "Round-up Saver",
      currency: "GBP",
      target: {
        currency: "GBP",
        minorUnits: 100000,
      },
    },
  });

  return response.savingsGoalUid;
};

/**
 * Fetch all savings goals.
 */
export const getSavingsGoals = async (accountUid: string) => {
  const response = await http.request<{ savingsGoalList: Savings[] }>({
    url: `/api/account/${accountUid}/savings-goals`,
    method: "GET",
  });
  console.log("response getSavings", response);
  return response || [];
};

/**
 * Transfers money to a given savings goal.
 */
export const addToSavingsGoal = async (
  accountUid: string,
  savingsGoalUid: string,
  amountMinorUnits: number
) => {
  const transferUid = crypto.randomUUID();

  const response = await http.request({
    url: `/api/account/${accountUid}/savings-goals/${savingsGoalUid}/add-money/${transferUid}`,
    method: "PUT",
    data: {
      amount: {
        currency: "GBP",
        minorUnits: amountMinorUnits,
      },
    },
  });

  return response;
};
