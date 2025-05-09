import React, { useState } from "react";
import {
  createSavingsGoal,
  getSavingsGoals,
  addToSavingsGoal,
} from "../api/starlingApi";
import type { Savings } from "../types/types";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";

type Props = {
  roundUpAmount: number;
  accountUid: string;
};

const SavingsManager: React.FC<Props> = ({ accountUid, roundUpAmount }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      setStatus("Checking savings goals...");

      const goals: Savings[] = (await getSavingsGoals(accountUid))
        .savingsGoalList;
      console.log("goals goals", goals);
      let goal: Pick<Savings, "savingsGoalUid"> | undefined = goals.find(
        (g: Savings) => g.name === "Round-up Saver"
      );
      console.log("goal", goal);

      if (!goal) {
        setStatus("Creating savings goal...");
        const newGoalUid = await createSavingsGoal(accountUid);
        goal = { savingsGoalUid: newGoalUid };
      }

      if (roundUpAmount === 0) {
        toast("No round-up needed.", { icon: "ℹ️" });
        setStatus("No round-up needed.");
        setLoading(false);
        return;
      }

      setStatus(`Transferring £${(roundUpAmount / 100).toFixed(2)}...`);
      await addToSavingsGoal(accountUid, goal.savingsGoalUid, roundUpAmount);
      toast.success("💰 Transfer successful!");
      setStatus("✅ Transfer successful!");
    } catch (err) {
      const axiosError = err as AxiosError;

      if (axiosError.response) {
        const errorData = axiosError.response.data as {
          error?: string;
          error_description?: string;
        };

        console.error(
          `API Error: ${axiosError.response.status} - ${
            errorData.error_description || axiosError.message
          }`
        );
        toast.error("💰 Transfer unsuccessful!");
        setStatus("❌ API error occurred during transfer.");
      } else {
        console.error("Unexpected error:", axiosError.message);
        toast.error("💰 Transfer unsuccessful!");
        setStatus("❌ Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md space-y-3">
      <button
        onClick={handleTransfer}
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {loading ? "Transferring..." : "Transfer Round-Up"}
      </button>

      {status && (
        <p
          className={`text-sm ${
            status.includes("✅")
              ? "text-green-600"
              : status.includes("❌")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default SavingsManager;
