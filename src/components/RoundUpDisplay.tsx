import React from "react";

interface Props {
  roundUpAmount: number; // in minor units
}

const RoundUpDisplay: React.FC<Props> = ({ roundUpAmount }) => {
  const pounds = (roundUpAmount / 100).toFixed(2);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
      <h2 className="text-green-700 font-bold">Potential Round-Up</h2>
      <p>You could save <span className="text-blue-600 font-bold">£{pounds}</span> this week by rounding up your transactions.</p>
    </div>
  );
};

export default RoundUpDisplay;
