import { ReactNode, useEffect, useState } from "react";

interface InteractionBlockerProps {
  readonly children: ReactNode;
  readonly message?: string;
}
const mobileRegex =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

const InteractionBlocker = ({
  children,
  message = "This feature is blocked in mobile and tablets",
}: InteractionBlockerProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = mobileRegex.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkIsMobile();
  }, []);

  return (
    <div className="relative">
      {children}
      {isMobile && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-80 flex flex-col items-center justify-center text-center text-neutral-50 z-10 pointer-events-auto">
          <p className="text-lg font-medium px-4 leading-relaxed">{message}</p>
        </div>
      )}
    </div>
  );
};

export default InteractionBlocker;
