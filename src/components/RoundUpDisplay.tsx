import React from "react";

interface Props {
  roundUpAmount: number; // in minor units
  isTransferComplete: boolean;
}

const RoundUpDisplay: React.FC<Props> = ({ roundUpAmount, isTransferComplete }) => {
  const pounds = (roundUpAmount / 100).toFixed(2);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
      {isTransferComplete ? (
        <div>
          <h2 className="text-green-700 font-bold">Congratulations on Saving!</h2>
          <p>
            You saved <span className="text-blue-600 font-bold">£{pounds}</span>{" "}
            this Round-Up!
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-green-700 font-bold">Potential Round-Up</h2>
          <p>
            You could save{" "}
            <span className="text-blue-600 font-bold">£{pounds}</span> this week
            by rounding up your transactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoundUpDisplay;
