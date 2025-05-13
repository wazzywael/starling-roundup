import { render, screen } from "@testing-library/react";
import RoundUpDisplay from "../../components/RoundUpDisplay";

describe("RoundUpDisplay", () => {
  it("displays potential savings when not in cooldown and roundUpAmount > 0", () => {
    render(
      <RoundUpDisplay
        roundUpAmount={125}
        cooldownActive={false}
        hasPendingRoundUp={false}
      />
    );
    expect(screen.getByTestId("roundup-message")).toHaveTextContent(
      "You could save £1.25 now!"
    );
  });

  it("displays already transferred message when in cooldown and no pending round-up", () => {
    render(
      <RoundUpDisplay
        roundUpAmount={0}
        cooldownActive={true}
        hasPendingRoundUp={false}
      />
    );
    expect(
      screen.getByText(
        /✅ Congratulations, you’ve already transferred your last round-up amount!/i
      )
    ).toBeInTheDocument();
  });

  it("displays pending round-up message when in cooldown and pending round-up", () => {
    render(
      <RoundUpDisplay
        roundUpAmount={250}
        cooldownActive={true}
        hasPendingRoundUp={true}
      />
    );
    expect(screen.getByTestId("next-roundup-message")).toHaveTextContent(
      /🕒 You'll be able to save £2\.50 in your next weekly round-up./i
    );
  });

  it("displays no eligible transactions message when not in cooldown and roundUpAmount is 0", () => {
    render(
      <RoundUpDisplay
        roundUpAmount={0}
        cooldownActive={false}
        hasPendingRoundUp={false}
      />
    );
    expect(
      screen.getByText(/No round-up eligible transactions yet/i)
    ).toBeInTheDocument();
  });
});
