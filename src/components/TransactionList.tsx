import React, { useState } from "react";
import type { Transaction } from "../types/types";

interface Props {
  transactions: Transaction[];
}

// Mapping raw references to friendly names
const referenceMapping: Record<string, string> = {
  INTERNAL_TRANSFER: "Transfer to Internal Account",
  "External Payment": "Outgoing Payment",
};

const getFriendlyReference = (reference: string) => {
  const trimmed = reference.trim();

  if (trimmed.startsWith("Ref:")) {
    const refNumber = trimmed.slice(4).trim();
    return `Incoming Payment: ${refNumber}`;
  }

  return referenceMapping[trimmed] || trimmed.replace(/_/g, " ");
};

const TransactionList: React.FC<Props> = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const paginated = transactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">
        💸 Recent Transactions
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="text-left px-4 py-2">Reference</th>
              <th className="text-center px-4 py-2">Date</th>
              <th className="text-right px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, index) => {
              const isRoundUpTransfer =
                item.direction === "OUT" &&
                item.source === "INTERNAL_TRANSFER" &&
                item.counterPartyName === "Round-up Saver";

              const isRoundedUp =
                item.direction === "OUT" &&
                item.amount.minorUnits % 100 !== 0 &&
                !isRoundUpTransfer;

              const roundUpValue = isRoundedUp
                ? 100 - (item.amount.minorUnits % 100)
                : 0;

              return (
                <tr
                  key={index}
                  className={`text-sm text-gray-800 ${
                    isRoundUpTransfer
                      ? "bg-yellow-50 border border-yellow-400"
                      : isRoundedUp
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 text-left truncate">
                    {isRoundUpTransfer
                      ? "💰 Rounded-Up Amount"
                      : item.reference
                      ? getFriendlyReference(item.reference)
                      : getFriendlyReference(item.source)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {new Date(item.transactionTime).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    <div
                      className={`flex flex-col items-end ${
                        isRoundUpTransfer
                          ? "text-indigo-700"
                          : item.direction === "OUT"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      <span>
                        {item.direction === "OUT" ? "-" : "+"}£
                        {(item.amount.minorUnits / 100).toFixed(2)}
                      </span>
                      {!isRoundUpTransfer && roundUpValue > 0 && (
                        <span className="text-blue-600 text-xs font-normal">
                          {`+£${(roundUpValue / 100).toFixed(2)} saved 💡`}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4 items-center">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Previous
            </button>
          )}

          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
