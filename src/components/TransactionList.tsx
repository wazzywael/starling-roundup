import React from "react";
import type { Transaction } from "../types/types";

interface Props {
  transactions: Transaction[];
}

const TransactionList: React.FC<Props> = ({ transactions }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        Recent Transactions
      </h2>
      <div className="grid grid-cols-3 gap-x-4 px-2 py-2 font-medium text-gray-500 border-b border-gray-300 text-sm">
        <div className="text-left">Reference</div>
        <div className="text-center">Date</div>
        <div className="text-right">Amount</div>
      </div>
      <ul className="divide-y divide-gray-200">
        {transactions.map((item, index) => {
          const isRoundedUp =
            item.direction === "OUT" && item.amount.minorUnits % 100 !== 0;
          const roundUpValue = isRoundedUp
            ? 100 - (item.amount.minorUnits % 100)
            : 0;
          return (
            <li
              key={index}
              className={`grid grid-cols-3 gap-x-4 py-3 px-2 items-center text-gray-800 text-sm rounded-md ${
                isRoundedUp ? "bg-blue-50 border border-blue-200" : ""
              }`}
            >
              <div className="truncate text-left">
                {item.reference || item.source}
              </div>
              <div className="text-center">
                {new Date(item.transactionTime).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div
                className={`text-right font-semibold flex flex-col items-end ${
                  item.direction === "OUT" ? "text-red-600" : "text-green-600"
                }`}
              >
                <span>
                  {item.direction === "OUT" ? "-" : "+"}£
                  {(item.amount.minorUnits / 100).toFixed(2)}
                </span>

                {roundUpValue > 0 && (
                  <span className="text-blue-600 text-xs font-normal">
                    → +£{(roundUpValue / 100).toFixed(2)} saved
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TransactionList;
