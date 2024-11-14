import { FiDownload, FiFileMinus, FiPlay, FiTrash2, FiX } from "react-icons/fi";

import { memo, ReactNode, useMemo, useState } from "react";
import {
  conversionGuide,
  SupportedSourceTypes,
} from "@/components/Converter/Converter.consts.tsx";
import { useSources } from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";
import { useTargets } from "@/components/Converter/context/TargetsContext/TargetsContext.tsx";
import { useConversion } from "@/components/Converter/context/ConvertionContext/ConvertionContext.tsx";
import { getMaxMemoryLimitInBytes } from "@/utils/performance.ts";
import { formatBytes } from "@/utils/format-bytes.ts";
import { ConversionSettings } from "@/components/Converter/hooks/UseConverter/UseConverter.tsx";
import Modal from "@/components/Modal/Modal.tsx";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal.tsx";
import useModal from "@/hooks/UseModal/UseModal.tsx";

interface ConversionControlsProps {
  readonly conversionState: {
    readonly conversionInProgress: boolean;
    readonly conversionProgress: number;
  };
  readonly sourcesState: {
    readonly totalSources: number;
  };
  readonly targetsState: {
    readonly totalTargets: number;
    readonly targetType?: string;
  };
  readonly onConvert: () => void;
  readonly onRemoveAll: () => void;
  readonly onDownload: () => void;
  readonly onCancel: () => void;
  readonly onRemoveAllSourcesThatHaveTargets: () => void;
}

const ConversionControls = ({
  conversionState,
  sourcesState,
  targetsState,
  onConvert,
  onRemoveAll,
  onDownload,
  onCancel,
  onRemoveAllSourcesThatHaveTargets,
}: ConversionControlsProps) => {
  const { openModal, closeModal } = useModal();
  const lockDownloadButton =
    targetsState.totalTargets == 0 || conversionState.conversionInProgress;
  const lockRemoveAllButton =
    conversionState.conversionInProgress || sourcesState.totalSources === 0;
  const lockConvertAllButton =
    conversionState.conversionInProgress ||
    targetsState.totalTargets === sourcesState.totalSources ||
    sourcesState.totalSources === 0 ||
    targetsState.targetType === undefined;
  const lockCancelAllButton = !conversionState.conversionInProgress;
  const lockRemoveConvertedButton =
    conversionState.conversionInProgress || targetsState.totalTargets === 0;

  const getUserConfirmation = async (
    title: string,
    message: string,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal(
        <Modal
          onClose={() => {
            closeModal();
            resolve(false);
          }}
          body={
            <ConfirmModal
              title={title}
              description={message}
              onConfirm={() => {
                closeModal();
                resolve(true);
              }}
              onCancel={() => {
                closeModal();
                resolve(false);
              }}
            />
          }
        />,
      );
    });
  };

  return (
    <div className="flex items-center gap-4">
      <ActionButton
        onClick={onConvert}
        icon={<FiPlay size={18} />}
        disabled={lockConvertAllButton}
        tooltip="Start converting all files"
        activeClass="bg-primary-500 hover:bg-primary-600"
        disabledClass="bg-gray-400"
      />
      <ActionButton
        onClick={onRemoveAll}
        icon={<FiTrash2 size={18} />}
        disabled={lockRemoveAllButton}
        tooltip="Remove all files"
        activeClass="bg-red-500 hover:bg-red-600"
        disabledClass="bg-gray-400"
      />
      <ActionButton
        onClick={async () => {
          const confirm = await getUserConfirmation(
            "Confirm Converted Files Removal",
            "Removing the converted files will help free up memory. Ensure you have downloaded all necessary files before proceeding.",
          );
          confirm && onRemoveAllSourcesThatHaveTargets();
        }}
        icon={<FiFileMinus size={18} />}
        disabled={lockRemoveConvertedButton}
        tooltip="Remove all converted files"
        activeClass="bg-red-700 hover:bg-red-800"
        disabledClass="bg-gray-400"
      />
      <ActionButton
        onClick={onDownload}
        icon={<FiDownload size={18} />}
        disabled={lockDownloadButton}
        tooltip="Download converted files"
        activeClass="bg-green-500 hover:bg-green-600"
        disabledClass="bg-gray-400"
      />
      <ActionButton
        onClick={onCancel}
        icon={<FiX size={18} />}
        disabled={lockCancelAllButton}
        tooltip="Cancel all conversions"
        activeClass="bg-orange-500 hover:bg-orange-600"
        disabledClass="bg-gray-400"
      />
    </div>
  );
};

interface ActionButtonProps {
  readonly onClick: () => void;
  readonly icon: ReactNode;
  readonly disabled: boolean;
  readonly tooltip: string;
  readonly activeClass: string;
  readonly disabledClass: string;
}

const ActionButton = ({
  onClick,
  icon,
  disabled,
  tooltip,
  activeClass,
  disabledClass,
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center w-10 h-10 text-white rounded-full focus:outline-none focus:ring-2 ${
      disabled ? disabledClass : activeClass
    }`}
    title={tooltip}
  >
    {icon}
  </button>
);
interface ConversionTypeSelectorProps {
  readonly sourceType: SupportedSourceTypes;
  readonly targetType?: string;
  readonly onTargetTypeSelected: (type: SupportedSourceTypes) => void;
  readonly lockDropdown: boolean;
}

const ConversionTypeSelector = ({
  sourceType,
  targetType,
  onTargetTypeSelected,
  lockDropdown,
}: ConversionTypeSelectorProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label
        htmlFor="conversion-type"
        className="text-sm text-neutral-600 dark:text-neutral-300"
      >
        Conversion Type:
      </label>
      <select
        id="conversion-type"
        value={targetType ?? ""}
        onChange={(e) =>
          onTargetTypeSelected(e.target.value as SupportedSourceTypes)
        }
        className={`py-2 px-4 bg-white dark:bg-dark-50 border rounded-lg text-sm ${
          lockDropdown
            ? "cursor-not-allowed border-gray-400"
            : "border-gray-300 dark:border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
        }`}
        disabled={lockDropdown}
        title="Select the file conversion type"
      >
        <option value={""} disabled>
          Select Conversion Type
        </option>
        {Object.entries(conversionGuide.supported[sourceType].targets).map(
          ([targetType, info]) => (
            <option key={targetType} value={targetType}>
              {info.name}
            </option>
          ),
        )}
      </select>
    </div>
  );
};
interface TimeoutSettingsProps {
  readonly setConversionSettings: (settings: ConversionSettings) => void;
}

const TimeoutSettings = ({ setConversionSettings }: TimeoutSettingsProps) => {
  const [timeoutEnabled, setTimeoutEnabled] = useState(true);
  const [timeout, setTimeout] = useState(1);

  const handleTimeoutChange = (e: any) => {
    const newTimeout = parseInt(e.target.value, 10);
    if (!isNaN(newTimeout) && newTimeout > 0) {
      setTimeout(newTimeout);
      setConversionSettings({ timeout: newTimeout * 1000 });
    }
  };

  const handleToggleTimeout = () => {
    setTimeoutEnabled(!timeoutEnabled);
    setConversionSettings({
      timeout: !timeoutEnabled ? timeout * 1000 : undefined,
    });
  };

  return (
    <div className="mt-4 p-4 bg-transparent rounded-lg  border-gray-200 dark:border-dark-200">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={timeoutEnabled}
            onChange={handleToggleTimeout}
            id="enable-timeout"
            className="h-5 w-5 rounded border-gray-300 text-primary-500  focus:ring-primary-400"
          />
          <label htmlFor="enable-timeout" className="text-sm font-medium">
            Use a Timeout for Conversions
          </label>
        </div>

        {timeoutEnabled && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <label htmlFor="timeout" className="text-sm font-medium">
                Timeout (seconds):
              </label>
              <input
                id="timeout"
                type="number"
                value={timeout}
                onChange={handleTimeoutChange}
                className="w-24 py-2 px-3 border rounded-lg dark:text-dark-300"
                min="1"
                step="1"
              />
            </div>

            {timeout > 5 && (
              <p className="text-sm rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200 p-2">
                Warning: A timeout longer than 5 seconds may cause unnecessary
                delays. Consider using a lower value for better performance.
              </p>
            )}
          </div>
        )}

        <p
          className={`text-sm rounded-lg p-2 ${
            timeoutEnabled
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {timeoutEnabled
            ? `Each file will take at most ${timeout} second${
                timeout > 1 ? "s" : ""
              } to convert.`
            : "Warning: Disabling the timeout might lead to long running or stuck conversions."}
        </p>
      </div>
    </div>
  );
};

interface ConversionProgressProps {
  readonly progress: number;
}

const ConversionProgress = ({ progress }: ConversionProgressProps) => {
  return (
    <div className="mt-4">
      <div className="w-full bg-gray-300 h-2 rounded-full">
        <div
          className="bg-primary-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 text-right">
        {progress}% Complete
      </div>
    </div>
  );
};

interface MemoryLimitSettingsProps {
  readonly setConversionSettings: (settings: ConversionSettings) => void;
}

const MemoryLimitSettings = ({
  setConversionSettings,
}: MemoryLimitSettingsProps) => {
  const [memoryLimitInBytes, setMemoryLimitInBytes] = useState<number>(
    getMaxMemoryLimitInBytes() / 3,
  );
  const maxMemoryInBytes = useMemo(() => getMaxMemoryLimitInBytes() * 0.5, []);

  const handleMemoryLimitChange = (e: any) => {
    const newLimitInBytes = parseInt(e.target.value, 10);
    if (!isNaN(newLimitInBytes) && newLimitInBytes > 0) {
      setMemoryLimitInBytes(newLimitInBytes);
      setConversionSettings({ memoryLimit: newLimitInBytes });
    }
  };

  return (
    <div className="mt-4 p-4 bg-transparent rounded-lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="memory-limit"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Maximum Memory Usage:
          </label>
          <input
            id="memory-limit"
            type="range"
            min={1}
            max={maxMemoryInBytes}
            value={memoryLimitInBytes}
            onChange={handleMemoryLimitChange}
            className="range-slider"
          />
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            Selected Memory Limit: {formatBytes(memoryLimitInBytes)}
          </div>
        </div>

        <p className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg p-2">
          Memory limit set to {formatBytes(memoryLimitInBytes)}. The app will
          stop conversions if this limit is exceeded.
        </p>
      </div>
    </div>
  );
};

const ConversionHeader = () => {
  const { removeAllSources, sourcesState } = useSources();
  const {
    targetsState,
    onTargetTypeSelected,
    removeAllSourcesThatHaveTargets,
  } = useTargets();
  const {
    conversionState,
    convertAllSources,
    downloadAllTargets,
    cancelConversion,
    setConversionSettings,
  } = useConversion();

  return (
    <div className="p-4 border-b border-gray-200 dark:border-dark-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ConversionControls
          conversionState={conversionState}
          sourcesState={sourcesState}
          targetsState={targetsState}
          onConvert={convertAllSources}
          onRemoveAll={removeAllSources}
          onDownload={downloadAllTargets}
          onCancel={cancelConversion}
          onRemoveAllSourcesThatHaveTargets={removeAllSourcesThatHaveTargets}
        />
        {sourcesState.sourceType && (
          <ConversionTypeSelector
            sourceType={sourcesState.sourceType}
            targetType={targetsState.targetType}
            onTargetTypeSelected={onTargetTypeSelected}
            lockDropdown={
              conversionState.conversionInProgress ||
              sourcesState.totalSources === 0
            }
          />
        )}
      </div>
      <TimeoutSettings setConversionSettings={setConversionSettings} />
      <MemoryLimitSettings setConversionSettings={setConversionSettings} />

      <ConversionProgress progress={conversionState.conversionProgress} />
    </div>
  );
};

export default memo(ConversionHeader);
