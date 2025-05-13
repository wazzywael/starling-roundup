import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { vi } from "vitest";

vi.mock("../api/starlingApi", () => ({
  getAccounts: vi
    .fn()
    .mockResolvedValue({ accountUid: "123", defaultCategory: "default" }),
  getTransactions: vi.fn().mockResolvedValue([
    {
      amount: { currency: "GBP", minorUnits: 125 },
      counterPartyName: "Pret",
      direction: "OUT",
      feedItemUid: "txn-1",
      transactionTime: new Date().toISOString(),
      source: "CARD_PAYMENT",
      reference: "Lunch at Pret",
    },
  ]),
}));

describe("App Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main app flow and shows loading state initially", async () => {
    render(<App />);

    expect(screen.getByText(/Loading transactions.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/💰 Starling Round-Up Saver/i)
      ).toBeInTheDocument();
    });
  });

  it("renders transaction details after loading", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Lunch at Pret/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/£0.75 saved 💡/i)).toBeInTheDocument();
  });

  it("renders the transfer round-up section correctly", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Transfer Round-Up/i)).toBeInTheDocument();
    });
  });
});
