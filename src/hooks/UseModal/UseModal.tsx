import { ReactNode, useEffect, useId } from "react";
import { createRoot } from "react-dom/client";

const modalContainer = document.createElement("div");
modalContainer.id = "modal-root";
document.body.appendChild(modalContainer);
const modalRoot = createRoot(modalContainer);

const useModal = () => {
  const id = useId();

  useEffect(() => {
    return () => closeModal();
  }, []);

  const closeModal = () => {
    modalRoot.render(null);
  };

  const openModal = (modal: ReactNode) => {
    modalRoot.render(<div id={id}>{modal}</div>);
  };

  return { openModal, closeModal };
};

export default useModal;
