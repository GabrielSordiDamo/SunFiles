import React, { memo } from "react";
import { FiAlertCircle, FiDownload, FiX } from "react-icons/fi";

import { formatBytes } from "@/utils/format-bytes.ts";
import { FileMetrics } from "@/components/Converter/utils/ConversionMetricsManager/ConversionMetricsManager.ts";
import { useSources } from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";
import { useTargets } from "@/components/Converter/context/TargetsContext/TargetsContext.tsx";
import { useConversion } from "@/components/Converter/context/ConvertionContext/ConvertionContext.tsx";

interface HeaderProps {
  readonly source: File;
  readonly onRemove: (...args: any) => void;
  readonly lockRemove: boolean;
}
const Header = ({ source, onRemove, lockRemove }: HeaderProps) => (
  <div className="flex items-center justify-between">
    <h3
      id={`file-title-${source.name}`}
      className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold"
    >
      {source.name}
    </h3>
    <button
      onClick={onRemove}
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        lockRemove
          ? "bg-gray-400 text-neutral-50 cursor-not-allowed"
          : "bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
      }`}
      disabled={lockRemove}
      aria-label={`Remove ${source.name}`}
    >
      <FiX size={16} />
    </button>
  </div>
);

interface ProgressBartProps {
  readonly progress: number;
}
const ProgressBar = ({ progress }: ProgressBartProps) => (
  <div aria-labelledby="progress-title">
    <h4 id="progress-title" className="sr-only">
      Conversion Progress
    </h4>
    <div className="w-full">
      <progress
        value={progress}
        max={100}
        className="w-full h-2 appearance-none bg-gray-300 rounded-full overflow-hidden app-progress-bar"
        aria-label="Conversion Progress"
      >
        {progress}%
      </progress>
    </div>
    <p className="text-sm text-left text-neutral-600 dark:text-neutral-300 mt-2">
      {progress}%{" "}
      {progress === 100 ? "(Ready to download)" : "(Awaiting Processing...)"}
    </p>
  </div>
);

interface FileMetricsInfoProps {
  readonly metrics: FileMetrics;
  readonly errorMessages: string[];
}
const FileMetricsInfo = ({ metrics, errorMessages }: FileMetricsInfoProps) => (
  <div className="text-sm text-left text-neutral-600 dark:text-neutral-300 space-y-1">
    <p>
      <strong>Original Size:</strong> {formatBytes(metrics.sourceFileSize)}
    </p>
    <p>
      <strong>Converted Size:</strong> {formatBytes(metrics.convertedFileSize)}
    </p>
    <p>
      <strong>Size Reduction:</strong> {metrics.sizeChangePercentage}%
    </p>
    {metrics.timeTaken && (
      <p>
        <strong>Time Taken:</strong> {metrics.timeTaken} ms
      </p>
    )}
    {errorMessages.length > 0 && (
      <div className="text-red-600 dark:text-red-400 space-y-2">
        <div className="flex items-center space-x-2">
          <FiAlertCircle size={16} />
          <span className="font-semibold">Conversion Errors:</span>
        </div>
        <ul className="list-disc pl-8 space-y-1">
          {errorMessages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

interface BodyProps {
  readonly showConvert: boolean;
  readonly showDownload: boolean;
  readonly onConvert: (...args: any) => void;
  readonly onDownload: (...args: any) => void;
  readonly lockConvert: boolean;
}
const Body = ({
  showConvert,
  showDownload,
  onConvert,
  onDownload,
  lockConvert,
}: BodyProps) => (
  <div className="flex space-x-4">
    {showConvert && (
      <button
        onClick={onConvert}
        className={`py-2 px-4 rounded-lg ${
          lockConvert
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        }`}
        disabled={lockConvert}
      >
        Convert
      </button>
    )}
    {showDownload && (
      <button
        onClick={onDownload}
        className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        <div className="flex items-center space-x-2">
          <FiDownload />
          <span>Download</span>
        </div>
      </button>
    )}
  </div>
);
export interface ConversionItemProps {
  readonly className?: string;
  readonly sourceName: string;
}

const ConversionItem = React.memo(
  ({ sourceName, className }: ConversionItemProps) => {
    const { removeSource, sourcesState } = useSources();
    const { targetsState } = useTargets();
    const { conversionState, convertSource, downloadTarget } = useConversion();

    const source = sourcesState.sources[sourceName];
    const target = targetsState.targets[sourceName];

    if (!source) return null;

    const progress = target ? 100 : 0;
    const lockConvertButton =
      !targetsState.targetType || conversionState.conversionInProgress;
    const lockRemoveButton =
      conversionState.conversionInProgress ||
      source.name in conversionState.beingConverted;

    const fileMetrics = conversionState.conversionMetrics.getMetricsFor(
      source,
    ) as FileMetrics | null;

    const errorMessages = fileMetrics
      ? Object.entries(fileMetrics.errorCount)
          .filter(([_, count]) => count > 0)
          .map(
            ([errorType, count]) => `${count} error(s) of type: ${errorType}`,
          )
      : [];

    const containerBackground = errorMessages.length
      ? "bg-red-100 dark:bg-red-800"
      : "bg-gray-100 dark:bg-dark-50";

    return (
      <div
        className={`relative p-4 border rounded-lg shadow-md flex flex-col space-y-4 ${containerBackground} ${className}`}
        aria-labelledby={`file-title-${source.name}`}
      >
        <Header
          source={source}
          onRemove={() => removeSource(source)}
          lockRemove={lockRemoveButton}
        />
        <ProgressBar progress={progress} />
        {fileMetrics && (
          <FileMetricsInfo
            metrics={fileMetrics}
            errorMessages={errorMessages}
          />
        )}
        <Body
          showConvert={!target}
          showDownload={!!target}
          onConvert={() => convertSource(source)}
          onDownload={() => downloadTarget(target)}
          lockConvert={lockConvertButton}
        />
      </div>
    );
  },
);

export default memo(ConversionItem);
