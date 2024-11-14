import { ReactNode } from "react";
import { CloseModelSourceEnum } from "@/components/Modal/CloseModelSource.enum.ts";

export interface ModalFooterProps {
  readonly children?: ReactNode;
  readonly onClose?: (source: CloseModelSourceEnum) => void;
  readonly onConfirm?: (source: CloseModelSourceEnum) => void;
}

const ModalFooter = ({ children, onClose, onConfirm }: ModalFooterProps) => {
  return (
    <div className="mt-6 flex justify-end space-x-4">
      {children || (
        <>
          {onClose && (
            <button
              onClick={() => onClose(CloseModelSourceEnum.BUTTON)}
              className="px-4 py-2 bg-neutral-300 hover:bg-neutral-400 text-neutral-900 dark:bg-dark-100 dark:hover:bg-dark-200 dark:text-neutral-50 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400"
            >
              Close
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => onConfirm(CloseModelSourceEnum.BUTTON)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Confirm
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ModalFooter;
