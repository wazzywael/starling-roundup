import {
  createSavingsGoal,
  getSavingsGoals,
  addToSavingsGoal,
} from "../api/starlingApi";
import type { Savings } from "../types/types";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import RoundUpDisplay from "./RoundUpDisplay";
import ConfirmDialog from "./ConfirmDialog";
import { useCallback, useEffect, useReducer } from "react";

type Props = {
  roundUpAmount: number;
  accountUid: string;
  cooldownActive: boolean;
  lastRoundUpDate: Date | null;
  hasPendingRoundUp: boolean;
  refreshData: () => Promise<void>;
};

// Reducer state and actions
type State = {
  loading: boolean;
  totalSaved: number | null;
  error: string | null;
  showDialog: boolean;
  showSavings: boolean;
  allGoals: Savings[];
};

type Action =
  | { type: "START_TRANSFER" }
  | { type: "TRANSFER_SUCCESS"; payload: number; goals: Savings[] }
  | { type: "TRANSFER_ERROR"; payload: string }
  | { type: "SET_GOALS"; payload: { saved: number; goals: Savings[] } }
  | { type: "TOGGLE_DIALOG" }
  | { type: "TOGGLE_SAVINGS" };

const initialState: State = {
  loading: false,
  totalSaved: null,
  error: null,
  showDialog: false,
  showSavings: false,
  allGoals: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_TRANSFER":
      return { ...state, loading: true, error: null };
    case "TRANSFER_SUCCESS":
      return {
        ...state,
        loading: false,
        totalSaved: action.payload,
        allGoals: action.goals,
        error: null,
      };
    case "TRANSFER_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "SET_GOALS":
      return {
        ...state,
        totalSaved: action.payload.saved,
        allGoals: action.payload.goals,
        error: null,
      };
    case "TOGGLE_DIALOG":
      return { ...state, showDialog: !state.showDialog };
    case "TOGGLE_SAVINGS":
      return { ...state, showSavings: !state.showSavings };
    default:
      return state;
  }
}

const SavingsManager: React.FC<Props> = ({
  accountUid,
  roundUpAmount,
  cooldownActive,
  lastRoundUpDate,
  hasPendingRoundUp,
  refreshData,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { loading, totalSaved, showDialog, showSavings, allGoals } = state;

  const canTransfer = !loading && roundUpAmount > 0 && !cooldownActive;

  const loadAndDispatchGoals = useCallback(async () => {
    try {
      const goals = (await getSavingsGoals(accountUid)).savingsGoalList;
      const goal = goals.find((g) => g.name === "Round-up Saver");
      const saved = goal?.totalSaved?.minorUnits ?? 0;

      dispatch({ type: "SET_GOALS", payload: { saved, goals } });
      return goals;
    } catch (err) {
      console.error("Failed to load savings goals", err);
      return null;
    }
  }, [accountUid]);

  // Automatically fetch goals if in cooldown mode (post-transfer)
  useEffect(() => {
    if (cooldownActive && state.allGoals.length === 0) {
      loadAndDispatchGoals();
    }
  }, [cooldownActive, state.allGoals.length, loadAndDispatchGoals]);

  const handleTransfer = async () => {
    dispatch({ type: "START_TRANSFER" });

    try {
      const existingGoals = await loadAndDispatchGoals();
      if (!existingGoals) return;

      let goal = existingGoals.find((g) => g.name === "Round-up Saver");

      if (!goal) {
        const newGoalUid = await createSavingsGoal(accountUid);
        toast.success("New Savings Goal Created!");

        const updatedGoals = await loadAndDispatchGoals();
        if (!updatedGoals) return;

        goal = updatedGoals.find((g) => g.savingsGoalUid === newGoalUid);
        if (!goal) {
          toast.error("Unable to locate new goal after creation.");
          return;
        }
      }

      if (roundUpAmount === 0) {
        toast("No Round-up Needed.");
        return;
      }

      await addToSavingsGoal(accountUid, goal.savingsGoalUid, roundUpAmount);

      await loadAndDispatchGoals();
      await refreshData();

      toast.success("Transfer Successful!");
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as {
          error?: string;
          error_description?: string;
        };
        const message = errorData.error_description || axiosError.message;
        dispatch({ type: "TRANSFER_ERROR", payload: message });
        toast.error("💰 Transfer Unsuccessful!");
      }
    }
  };

  return (
    <div>
      <RoundUpDisplay
        roundUpAmount={roundUpAmount}
        cooldownActive={cooldownActive}
        hasPendingRoundUp={hasPendingRoundUp}
      />

      <div className="mt-4 space-y-2">
        <button
          onClick={() => dispatch({ type: "TOGGLE_DIALOG" })}
          disabled={!canTransfer}
          className={`w-64 py-2 px-4 rounded-md font-medium transition ${
            !canTransfer
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {cooldownActive
            ? "Weekly Transfer Limit Reached"
            : loading
            ? "Transferring..."
            : "Transfer Round-Up Amount"}
        </button>

        {cooldownActive && lastRoundUpDate && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏳</span>
              <p>
                <strong>Last round-up:</strong>{" "}
                {lastRoundUpDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">🗓</span>
              <p>
                <strong>Next round-up available in:</strong>{" "}
                <span className="font-semibold">
                  {Math.max(
                    0,
                    7 -
                      Math.floor(
                        (Date.now() - lastRoundUpDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                  )}{" "}
                  day(s)
                </span>
              </p>
            </div>

            {totalSaved !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <p>
                  <strong>Total saved so far:</strong>{" "}
                  <span className="text-indigo-700 font-semibold">
                    £{(totalSaved / 100).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {cooldownActive && (
        <button
          onClick={() => dispatch({ type: "TOGGLE_SAVINGS" })}
          className="mt-4 text-indigo-600 text-sm"
        >
          {showSavings ? "Hide" : "View"} all Savings Goals
        </button>
      )}

      {showSavings && allGoals.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
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

      <ConfirmDialog
        isOpen={showDialog}
        amount={roundUpAmount}
        onConfirm={async () => {
          dispatch({ type: "TOGGLE_DIALOG" });
          await handleTransfer();
        }}
        onCancel={() => dispatch({ type: "TOGGLE_DIALOG" })}
      />
    </div>
  );
};

export default SavingsManager;
