import { ToastComponentProps } from "@/components/Toast/Toast.tsx";

export interface ToastProps extends ToastComponentProps {
  duration?: number;
  persistent?: boolean;
  id?: number;
}
