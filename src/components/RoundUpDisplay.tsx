import React from "react";

interface Props {
  roundUpAmount: number; // in minor units
}

const RoundUpDisplay: React.FC<Props> = ({ roundUpAmount }) => {
  const pounds = (roundUpAmount / 100).toFixed(2);

  return (
    <div>
      <h2>Potential Round-Up</h2>
      <p>You could save £{pounds} this week by rounding up your transactions.</p>
    </div>
  );
};

export default RoundUpDisplay;
