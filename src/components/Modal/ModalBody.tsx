import { ReactNode } from "react";

export interface ModalBodyProps {
  readonly children?: ReactNode;
}

const ModalBody = ({ children }: ModalBodyProps) => (
  <div className="mt-4 text-base text-neutral-700 dark:text-neutral-200 leading-6">
    {children}
  </div>
);

export default ModalBody;
