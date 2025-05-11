import { useEffect, useState } from "react";
import "./styles.css";
import TransactionList from "./components/TransactionList";
import SavingsManager from "./components/SavingsManager";
import type { Transaction } from "./types/types";
import { calculateRoundUp } from "./utils/roundupCalculator";
import { getAccounts, getTransactions } from "./api/starlingApi";
import RoundUpDisplay from "./components/RoundUpDisplay";

function App() {
  const [roundUp, setRoundUp] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [accountUid, setAccountUid] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = await getAccounts();
        setAccountUid(account.accountUid);
        console.log("account", account.accountUid);

        const items = await getTransactions(
          account.accountUid,
          account.defaultCategory
        );
        setTransactions(items);

        const total = calculateRoundUp(items);
        setRoundUp(total);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">
          💰 Starling Round-Up Saver
        </h1>

        {loading ? (
          <p className="text-gray-600">Loading transactions...</p>
        ) : (
          <>
            <SavingsManager accountUid={accountUid} roundUpAmount={roundUp} />
            <TransactionList transactions={transactions} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
