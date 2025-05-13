import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TransactionList from "../../components/TransactionList";
import type { Transaction } from "../../types/types";

const mockTransaction = (
  overrides: Partial<Transaction> = {},
  index = 0
): Transaction => ({
  amount: { currency: "GBP", minorUnits: 123 },
  counterPartyName: "Vendor",
  direction: "OUT",
  feedItemUid: `tx-${index}`,
  transactionTime: new Date("2024-05-01").toISOString(),
  source: "CARD",
  reference: "Ref: 123",
  ...overrides,
});

describe("TransactionList", () => {
  let transactions: Transaction[];

  beforeEach(() => {
    transactions = [
      mockTransaction({}, 1),
      mockTransaction(
        {
          amount: { currency: "GBP", minorUnits: 500 },
          reference: "External Payment",
        },
        2
      ),
      mockTransaction(
        {
          direction: "IN",
          amount: { currency: "GBP", minorUnits: 2500 },
          reference: "Ref: 999",
        },
        3
      ),
      mockTransaction(
        {
          source: "INTERNAL_TRANSFER",
          counterPartyName: "Round-up Saver",
          reference: "",
          amount: { currency: "GBP", minorUnits: 75 },
        },
        4
      ),
    ];
  });

  it("renders the title and table headers", () => {
    render(<TransactionList transactions={transactions} />);
    expect(
      screen.getByRole("heading", { name: /recent transactions/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/reference/i)).toBeInTheDocument();
    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Amount/i })
    ).toBeInTheDocument();
  });

  it("displays transaction data correctly", () => {
    render(<TransactionList transactions={transactions} />);

    expect(screen.getByText(/Incoming Payment: 123/)).toBeInTheDocument();
    expect(screen.getByText(/Outgoing Payment/)).toBeInTheDocument();
    expect(screen.getByText(/Incoming Payment: 999/)).toBeInTheDocument();
    expect(screen.getByText(/💰 Rounded-Up Amount/)).toBeInTheDocument();

    // Amounts
    expect(screen.getByText("-£1.23")).toBeInTheDocument(); // OUT
    expect(screen.getByText("+£25.00")).toBeInTheDocument(); // IN

    // Round-up value for 123p → 77p
    expect(screen.getByText("+£0.77 saved 💡")).toBeInTheDocument();
  });

  it("applies special styling for round-up transfers", () => {
    render(<TransactionList transactions={transactions} />);

    const roundUpRow = screen.getByText("💰 Rounded-Up Amount").closest("tr");
    expect(roundUpRow).toHaveClass("bg-yellow-50");
  });

  it("shows pagination if more than 10 items", () => {
    const manyTransactions = Array.from({ length: 15 }, (_, i) =>
      mockTransaction({}, i)
    );

    render(<TransactionList transactions={manyTransactions} />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("paginates correctly when next/previous buttons are clicked", () => {
    const manyTransactions = Array.from({ length: 15 }, (_, i) =>
      mockTransaction({ reference: `Ref: ${i}` }, i)
    );

    render(<TransactionList transactions={manyTransactions} />);

    // Page 1 should contain Ref: 0 to Ref: 9
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`Incoming Payment: ${i}`)).toBeInTheDocument();
    }

    // Click next
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    // Page 2 should contain Ref: 10 to Ref: 14
    for (let i = 10; i < 15; i++) {
      expect(screen.getByText(`Incoming Payment: ${i}`)).toBeInTheDocument();
    }

    // Click previous
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("handles empty reference gracefully", () => {
    const tx: Transaction = mockTransaction({
      reference: "",
      source: "INTERNAL_TRANSFER",
      counterPartyName: "Round-up Saver",
    });

    render(<TransactionList transactions={[tx]} />);

    expect(screen.getByText("💰 Rounded-Up Amount")).toBeInTheDocument();
  });
});
