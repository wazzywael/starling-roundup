import React, { useState } from "react";
import {
  createSavingsGoal,
  getSavingsGoals,
  addToSavingsGoal,
} from "../api/starlingApi";

type Props = {
  roundUpAmount: number;
  accountUid: string;
};

const SavingsManager: React.FC<Props> = ({ accountUid, roundUpAmount }) => {
  const [status, setStatus] = useState("");

  const handleTransfer = async () => {
    try {
      setStatus("Checking savings goals...");

      const goals = await getSavingsGoals(accountUid);
      console.log('goals goals', goals);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let goal = goals.savingsGoalList.find((g: any) => g.name === "Round-up Saver");
      console.log("goal", goal);

      if (!goal) {
        setStatus("Creating savings goal...");
        const newGoalUid = await createSavingsGoal(accountUid);
        goal = { savingsGoalUid: newGoalUid };
      }

      if (roundUpAmount === 0) {
        setStatus("No round-up needed.");
        return;
      }

      setStatus(`Transferring £${(roundUpAmount / 100).toFixed(2)}...`);
      await addToSavingsGoal(accountUid, goal.savingsGoalUid, roundUpAmount);
      setStatus("Transfer successful!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setStatus("Error occurred during transfer.");
    }
  };

  return (
    <div>
      <button onClick={handleTransfer}>Save Round-Up</button>
      <p>{status}</p>
    </div>
  );
};

export default SavingsManager;
