import { PiX } from "react-icons/pi";
import { ReactNode } from "react";
import { CloseModelSourceEnum } from "@/components/Modal/CloseModelSource.enum.ts";

export interface ModalHeaderProps {
  readonly title?: string;
  readonly onClose?: (source: CloseModelSourceEnum) => void;
  readonly children?: ReactNode;
}

const ModalHeader = ({ title, onClose, children }: ModalHeaderProps) => {
  return (
    <div className="flex justify-between items-center border-b border-neutral-300 dark:border-dark-100 pb-3">
      {children || (
        <>
          {title && (
            <h2
              id="modal-title"
              className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50"
            >
              {title}
            </h2>
          )}
          {onClose && (
            <button
              onClick={() => onClose(CloseModelSourceEnum.BUTTON)}
              className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full p-1 transition"
              aria-label="Close modal"
            >
              <PiX size={24} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ModalHeader;
