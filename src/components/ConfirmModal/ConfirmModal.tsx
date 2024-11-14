import { PiX } from "react-icons/pi";
import { CloseModelSourceEnum } from "@/components/Modal/CloseModelSource.enum.ts";

export interface ConfirmModalProps {
  readonly title: string;
  readonly description: string;
  readonly onConfirm: () => void;
  readonly onCancel: (source: CloseModelSourceEnum) => void;
}

const ConfirmModal = ({
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>
        <button
          onClick={() => onCancel(CloseModelSourceEnum.BUTTON)}
          className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 focus:outline-none"
          aria-label="Close"
        >
          <PiX size={24} />
        </button>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => onCancel(CloseModelSourceEnum.BUTTON)}
          className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-gray-200 dark:bg-dark-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-300 focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none"
        >
          Confirm
        </button>
      </div>
    </>
  );
};

export default ConfirmModal;
