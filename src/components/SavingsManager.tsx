import React, { useEffect, useRef, useState } from "react";
import {
  createSavingsGoal,
  getSavingsGoals,
  addToSavingsGoal,
} from "../api/starlingApi";
import type { Savings } from "../types/types";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import RoundUpDisplay from "./RoundUpDisplay";

type Props = {
  roundUpAmount: number;
  accountUid: string;
};

const SavingsManager: React.FC<Props> = ({ accountUid, roundUpAmount }) => {
  const [loading, setLoading] = useState(false);
  const [totalSaved, setTotalSaved] = useState<number | null>(null);
  const [hasTransferred, setHasTransferred] = useState(false);
  const [isTransferComplete, setIsTransferComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [allGoals, setAllGoals] = useState<Savings[]>([]);
  const [showSavings, setShowSavings] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (roundUpAmount > 0) {
      setHasTransferred(false);
      setIsTransferComplete(false);
    }
  }, [roundUpAmount]);

  useEffect(() => {
    if (showConfirmDialog) {
      confirmButtonRef.current?.focus();
    }
  }, [showConfirmDialog]);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const goals: Savings[] = (await getSavingsGoals(accountUid))
        .savingsGoalList;
      let goal: Pick<Savings, "savingsGoalUid"> | undefined = goals.find(
        (g: Savings) => g.name === "Round-up Saver"
      );

      if (!goal) {
        toast.success("New Savings Goal Created!");
        const newGoalUid = await createSavingsGoal(accountUid);
        goal = { savingsGoalUid: newGoalUid };
      }

      if (roundUpAmount === 0) {
        toast("No Round-up Needed.");
        return;
      }

      await addToSavingsGoal(accountUid, goal.savingsGoalUid, roundUpAmount);

      const updatedGoals: Savings[] = (await getSavingsGoals(accountUid))
        .savingsGoalList;
      const updatedGoal = updatedGoals.find(
        (g) => g.savingsGoalUid === goal!.savingsGoalUid
      );

      const savedAmount = updatedGoal?.totalSaved?.minorUnits ?? 0;
      setTotalSaved(savedAmount);
      setAllGoals(updatedGoals);
      setHasTransferred(true);
      setIsTransferComplete(true);
      toast.success("Transfer Successful!");
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
        toast.error("💰 Transfer Unsuccessful!");
      } else {
        console.error("Unexpected error:", axiosError.message);
        toast.error("💰 Transfer Unsuccessful!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Pass the success status and round-up amount to the RoundUpDisplay component */}
      <RoundUpDisplay
        roundUpAmount={roundUpAmount}
        isTransferComplete={isTransferComplete}
      />

      <div className="mt-4">
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={loading || hasTransferred || roundUpAmount === 0}
          className={`w-full py-2 px-4 rounded-md font-medium transition ${
            hasTransferred || roundUpAmount === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {loading
            ? "Transferring..."
            : hasTransferred
            ? "Round-Up Transferred"
            : "Transfer Round-Up"}
        </button>
      </div>

      {totalSaved !== null && (
        <p className="text-gray-700 mt-2">
          💰 Total saved in this savings goal:{" "}
          <span className="font-semibold text-indigo-600">
            £{(totalSaved / 100).toFixed(2)}
          </span>
        </p>
      )}

      {hasTransferred && (
        <button
          onClick={() => setShowSavings(!showSavings)}
          className="mt-4 text-indigo-600 text-sm"
        >
          {showSavings ? "Hide" : "View"} all Savings Goals
        </button>
      )}

      {showSavings && allGoals.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            💼 Your Savings Goals:
          </h3>
          <ul className="space-y-2">
            {allGoals.map((goal) => (
              <li
                key={goal.savingsGoalUid}
                className={`p-3 rounded-md border ${
                  goal.name === "Round-up Saver"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-indigo-700 font-semibold">
                    £{((goal.totalSaved?.minorUnits ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showConfirmDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center backdrop-blur z-50"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowConfirmDialog(false);
          }}
          tabIndex={-1} // ensures the div can receive keyboard events
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md transform transition-transform duration-200 scale-95 animate-fade-in"
            style={{ animation: "fadeIn 0.2s ease-out forwards" }}
            ref={(el) => {
              // Focus the confirm button after mount
              if (el) {
                const confirmBtn = el.querySelector(
                  "#confirm-btn"
                ) as HTMLButtonElement;
                confirmBtn?.focus();
              }
            }}
          >
            <h2 className="text-lg font-semibold mb-4">Confirm Transfer</h2>
            <p className="mb-6">
              Are you sure you want to transfer{" "}
              <strong>£{(roundUpAmount / 100).toFixed(2)}</strong> to your
              Round-up Saver?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                id="confirm-btn"
                onClick={async () => {
                  setShowConfirmDialog(false);
                  await handleTransfer();
                }}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsManager;
