// src/components/TransactionList.tsx
import React from "react";
import type { Transaction } from "../types/types";

interface Props {
  transactions: Transaction[];
}

const TransactionList: React.FC<Props> = ({ transactions }) => {
  return (
    <div>
      <h2>Recent Transactions</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {transactions.map((tx, index) => (
          <li key={index} style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #ddd" }}>
            <div><strong>{tx.reference || tx.source}</strong></div>
            <div>{new Date(tx.transactionTime).toLocaleDateString()}</div>
            <div>
              {tx.direction === "OUT" ? "-" : "+"}
              £{(tx.amount.minorUnits / 100).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
