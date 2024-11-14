import { CloseModelSourceEnum } from "@/components/Modal/CloseModelSource.enum.ts";
import { ReactNode } from "react";

export interface ModalProps {
  readonly header?: ReactNode;
  readonly body?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose?: (source: CloseModelSourceEnum) => void;
}
const Modal = ({ onClose, header, body, footer }: ModalProps) => {
  const handleOverlayClick = (e: any) => {
    if (e.target.classList.contains("custom-modal-overlay") && onClose) {
      onClose(CloseModelSourceEnum.OVERLAY);
    }
  };
  return (
    <div
      className="custom-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-overlay-dark backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={handleOverlayClick}
    >
      <div className="bg-background-light dark:bg-dark-100 rounded-lg shadow-lg max-w-lg w-full p-6">
        {header}

        {body}

        {footer}
      </div>
    </div>
  );
};

export default Modal;
