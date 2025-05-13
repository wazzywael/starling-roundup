import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useRoundUpStatus } from "../../hooks/useRoundUpStatus";
import * as api from "../../api/starlingApi";
import * as calc from "../../utils/roundupCalculator";
import type { Transaction } from "../../types/types";

describe("useRoundUpStatus", () => {
  const mockAccount = {
    accountUid: "account-123",
    defaultCategory: "category-abc",
  };

  const mockTransactions: Transaction[] = [
    {
      amount: { currency: "GBP", minorUnits: 199 },
      counterPartyName: "Coffee Shop",
      direction: "OUT",
      feedItemUid: "tx-123",
      transactionTime: new Date("2024-05-10").toISOString(),
      source: "CARD",
      reference: "Latte",
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(api, "getAccounts").mockResolvedValue(mockAccount);
    vi.spyOn(api, "getTransactions").mockResolvedValue(mockTransactions);

    vi.spyOn(calc, "getLastRoundUpDate").mockReturnValue(
      new Date("2024-05-05")
    );
    vi.spyOn(calc, "getRoundUpEligibleTransactions").mockReturnValue(
      mockTransactions
    );
    vi.spyOn(calc, "calculateRoundUp").mockReturnValue(101);
    vi.spyOn(calc, "isCooldownActive").mockReturnValue(false);
  });

  it("fetches and calculates round-up status correctly", async () => {
    const { result } = renderHook(() => useRoundUpStatus());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(api.getAccounts).toHaveBeenCalled();
    expect(api.getTransactions).toHaveBeenCalledWith(
      "account-123",
      "category-abc"
    );
    expect(calc.getLastRoundUpDate).toHaveBeenCalledWith(mockTransactions);
    expect(calc.getRoundUpEligibleTransactions).toHaveBeenCalledWith(
      mockTransactions
    );
    expect(calc.calculateRoundUp).toHaveBeenCalled();

    expect(result.current.accountUid).toBe("account-123");
    expect(result.current.roundUpAmount).toBe(101);
    expect(result.current.cooldownActive).toBe(false);
    expect(result.current.hasPendingRoundUp).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.transactions).toEqual(mockTransactions);
  });

  it("handles error during fetch", async () => {
    vi.spyOn(api, "getAccounts").mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useRoundUpStatus());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.roundUpAmount).toBe(0);
    expect(result.current.accountUid).toBe("");
    expect(result.current.transactions).toEqual([]);
  });
});
