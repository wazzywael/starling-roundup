import React, { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  amount,
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur z-50"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md transform transition-transform duration-200 scale-95 animate-fade-in">
        <h2 className="text-lg font-semibold mb-4">Confirm Transfer</h2>
        <p className="mb-6">
          Are you sure you want to transfer{" "}
          <strong>£{(amount / 100).toFixed(2)}</strong> to your Round-up Saver?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            id="confirm-btn"
            ref={confirmButtonRef}
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
