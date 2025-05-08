import React, { useState } from "react";
import {
  createSavingsGoal,
  getSavingsGoals,
  addToSavingsGoal,
} from "../api/starlingApi";
import type { Savings } from "../types/types";
import type { AxiosError } from "axios";

type Props = {
  roundUpAmount: number;
  accountUid: string;
};

const SavingsManager: React.FC<Props> = ({ accountUid, roundUpAmount }) => {
  const [status, setStatus] = useState("");

  const handleTransfer = async () => {
    try {
      setStatus("Checking savings goals...");

      const goals: Savings[] = (await getSavingsGoals(accountUid)).savingsGoalList;
      console.log('goals goals', goals);
      let goal: Pick<Savings, 'savingsGoalUid'> | undefined = goals.find((g: Savings) => g.name === "Round-up Saver");
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
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response) {
        const errorData = axiosError.response.data as {
          error?: string;
          error_description?: string;
        };
    
        console.error(
          `API Error: ${axiosError.response.status} - ${errorData.error_description || axiosError.message}`
        );
        setStatus("API error occurred during transfer.");
      } else {
        console.error("Unexpected error:", axiosError.message);
        setStatus("Unexpected error occurred.");
      }
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
