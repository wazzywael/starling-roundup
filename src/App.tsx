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
  const [defaultCategory, setDefaultCategory] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = await getAccounts();
        setAccountUid(account.accountUid);
        setDefaultCategory(account.defaultCategory)
        console.log("account", account.accountUid);

        const items = await getTransactions(account.accountUid, account.defaultCategory);
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
    <div className="App">
      <h1>Starling Round-Up Saver</h1>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <>
          <TransactionList transactions={transactions} />
          <RoundUpDisplay roundUpAmount={roundUp} />
          <SavingsManager accountUid={accountUid} roundUpAmount={roundUp}/>
        </>
      )}
    </div>
  );
}

export default App;
