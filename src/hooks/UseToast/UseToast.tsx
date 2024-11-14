import { createRoot } from "react-dom/client";
import { ToastProps } from "@/hooks/UseToast/ToastProps.ts";
import Toast from "@/components/Toast/Toast.tsx";

const toastContainer = document.createElement("div");
toastContainer.id = "toast-root";
document.body.appendChild(toastContainer);
const toastRoot = createRoot(toastContainer);

const createGlobalToastContext = () => {
  const toasts = new Map<number, ToastProps>();

  return () => {
    const renderToasts = () => {
      toastRoot.render(
        <div className="fixed top-4 space-y-4 z-50 w-screen px-2 flex flex-col md:right-4 md:px-0 md:max-w-md">
          {[...toasts.values()].map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              title={toast.title}
              onClose={() => removeToast(toast.id!)}
            />
          ))}
        </div>,
      );
    };

    const addToast = ({
      message,
      type,
      duration = 10000,
      title,
      persistent = false,
    }: ToastProps) => {
      const id = Math.random() * 10000;
      const toast: ToastProps = {
        id,
        message,
        type,
        title,
        persistent,
        duration,
      };
      toasts.set(id, toast);
      renderToasts();

      if (!persistent) {
        setTimeout(() => {
          toasts.delete(id);
          renderToasts();
        }, duration);
      }
    };

    const removeToast = (id: number) => {
      if (toasts.has(id)) {
        toasts.delete(id);
        renderToasts();
      }
    };

    return { addToast, removeToast };
  };
};

export default createGlobalToastContext();
