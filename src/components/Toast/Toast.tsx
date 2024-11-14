import { Transition } from "@headlessui/react";
import { ToastTypeEnum } from "@/components/Toast/ToastType.enum.ts";
import {
  PiCheckCircleBold,
  PiInfoBold,
  PiWarningBold,
  PiXBold,
  PiXCircleBold,
} from "react-icons/pi";

export interface ToastComponentProps {
  readonly message?: string;
  readonly type?: ToastTypeEnum;
  readonly title?: string;
  readonly onClose?: () => void;
}

const TOAST_CONFIG = {
  [ToastTypeEnum.INFO]: {
    bgColor: "bg-info-500 dark:bg-dark-100",
    textColor: "text-neutral-50 dark:text-info-200",
    iconColor: "text-neutral-50 dark:text-info-300",
    icon: <PiInfoBold size={24} />,
  },
  [ToastTypeEnum.ERROR]: {
    bgColor: "bg-error-500 dark:bg-dark-100",
    textColor: "text-neutral-50 dark:text-error-200",
    iconColor: "text-neutral-50 dark:text-error-300",
    icon: <PiXCircleBold size={24} />,
  },
  [ToastTypeEnum.SUCCESS]: {
    bgColor: "bg-success-500 dark:bg-dark-100",
    textColor: "text-neutral-50 dark:text-success-200",
    iconColor: "text-neutral-50 dark:text-success-300",
    icon: <PiCheckCircleBold size={24} />,
  },
  [ToastTypeEnum.WARNING]: {
    bgColor: "bg-warning-500 dark:bg-dark-100",
    textColor: "text-neutral-50 dark:text-warning-200",
    iconColor: "text-neutral-50 dark:text-warning-300",
    icon: <PiWarningBold size={24} />,
  },
};

const Toast = ({
  message = "",
  type = ToastTypeEnum.SUCCESS,
  title = "",
  onClose,
}: ToastComponentProps) => {
  const { bgColor, textColor, iconColor, icon } = TOAST_CONFIG[type];

  return (
    <Transition
      appear
      show
      enter="transition transform ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 scale-95"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition transform ease-in duration-300"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 translate-y-4 scale-95"
    >
      <div
        className={`${bgColor} ${textColor} w-full sm:max-w-md mx-auto px-4 sm:px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4`}
      >
        <div
          className={`flex items-center justify-center p-2 rounded-full ${iconColor}`}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-base sm:text-lg mb-1 max-h-16 line-clamp-5">
              {title}
            </h4>
          )}
          <p className="text-sm max-h-24  line-clamp-5">{message}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 ml-4 rounded-full text-neutral-50 hover:text-neutral-700 dark:hover:text-dark-accent transition"
            aria-label="Close"
          >
            <PiXBold size={20} />
          </button>
        )}
      </div>
    </Transition>
  );
};

export default Toast;
