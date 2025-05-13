import "./styles.css";
import TransactionList from "./components/TransactionList";
import SavingsManager from "./components/SavingsManager";
import { useRoundUpStatus } from "./hooks/useRoundUpStatus";

function App() {
  const {
    accountUid,
    roundUpAmount,
    cooldownActive,
    lastRoundUpDate,
    loading,
    transactions,
    hasPendingRoundUp,
    fetchData,
  } = useRoundUpStatus();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <main className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-indigo-700 mb-2">
          💰 Starling Round-Up Saver
        </h1>

        {loading ? (
          <p className="text-gray-600">Loading transactions...</p>
        ) : (
          <>
            <SavingsManager
              accountUid={accountUid}
              roundUpAmount={roundUpAmount}
              cooldownActive={cooldownActive}
              lastRoundUpDate={lastRoundUpDate}
              hasPendingRoundUp={hasPendingRoundUp}
              refreshData={fetchData}
            />
            <TransactionList
              transactions={transactions}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
