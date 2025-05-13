type Props = {
  roundUpAmount: number;
  cooldownActive: boolean;
  hasPendingRoundUp: boolean;
};

const RoundUpDisplay: React.FC<Props> = ({
  roundUpAmount,
  cooldownActive,
  hasPendingRoundUp,
}) => {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Benefit from Round-Up</h2>

      {!cooldownActive && roundUpAmount > 0 && (
        <p className="text-indigo-700 mt-2" data-testid="roundup-message">
          🎯 You could save <strong>£{(roundUpAmount / 100).toFixed(2)}</strong>{" "}
          now!
        </p>
      )}

      {cooldownActive && !hasPendingRoundUp && (
        <p className="text-green-700 mt-2">
          ✅ Congratulations, you’ve already transferred your last round-up amount!
        </p>
      )}

      {cooldownActive && hasPendingRoundUp && (
        <p className="text-indigo-700 mt-2" data-testid="next-roundup-message">
          🕒 You'll be able to save{" "}
          <strong>£{(roundUpAmount / 100).toFixed(2)}</strong> in your next
          weekly round-up.
        </p>
      )}

      {!cooldownActive && roundUpAmount === 0 && (
        <p className="text-gray-600 mt-2">
          No round-up eligible transactions yet.
        </p>
      )}
    </div>
  );
};

export default RoundUpDisplay;
