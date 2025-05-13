import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import * as api from "../../api/starlingApi";
import SavingsManager from "../../components/SavingsManager";

// Mock the API
vi.mock("../../api/starlingApi");

describe("SavingsManager", () => {
  const baseProps = {
    accountUid: "account-1",
    roundUpAmount: 100,
    cooldownActive: false,
    lastRoundUpDate: new Date("2025-05-10"),
    hasPendingRoundUp: false,
    refreshData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables transfer button during cooldown", () => {
    render(<SavingsManager {...baseProps} cooldownActive={true} />);
    expect(
      screen.getByRole("button", { name: /Weekly Transfer Limit Reached/i })
    ).toBeDisabled();
  });

  it("shows last round-up date and next available date during cooldown", () => {
    render(<SavingsManager {...baseProps} cooldownActive={true} />);
    expect(screen.getByText(/Last round-up:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Next round-up available in:/i)
    ).toBeInTheDocument();
  });

  it("toggles visibility of savings goals list", async () => {
    vi.mocked(api.getSavingsGoals).mockResolvedValue({
      savingsGoalList: [
        {
          savingsGoalUid: "goal-1",
          name: "Round-up Saver",
          totalSaved: { minorUnits: 12345 },
        },
        {
          savingsGoalUid: "goal-2",
          name: "Holiday Fund",
          totalSaved: { minorUnits: 6789 },
        },
      ],
    });

    render(<SavingsManager {...baseProps} cooldownActive={true} />);

    const toggleButton = screen.getByRole("button", {
      name: /view all savings goals/i,
    });

    // Click to show goals
    fireEvent.click(toggleButton);
    expect(
      await screen.findByText("💼 Your Savings Goals:")
    ).toBeInTheDocument();
    expect(screen.getByText("Round-up Saver")).toBeInTheDocument();
    expect(screen.getByText("Holiday Fund")).toBeInTheDocument();

    // Click to hide goals
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.queryByText("💼 Your Savings Goals:")
      ).not.toBeInTheDocument();
    });
  });

  it("displays total saved when data is available", async () => {
    vi.mocked(api.getSavingsGoals).mockResolvedValue({
      savingsGoalList: [
        {
          savingsGoalUid: "goal-1",
          name: "Round-up Saver",
          totalSaved: { minorUnits: 23456 },
        },
      ],
    });

    render(<SavingsManager {...baseProps} cooldownActive={true} />);
    expect(await screen.findByText(/£234.56/)).toBeInTheDocument();
  });
});
