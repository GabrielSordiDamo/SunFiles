import FileConverterWorker from "@/components/Converter/workers/ConvertionManagerWorker.worker.ts?worker";
import { ReactNode, useEffect, useMemo, useRef } from "react";

import useModal from "@/hooks/UseModal/UseModal.tsx";
import Modal from "@/components/Modal/Modal.tsx";
import ModalHeader from "@/components/Modal/ModalHeader.tsx";
import ModalBody from "@/components/Modal/ModalBody.tsx";
import { batchGenerator } from "@/utils/batch-generator.tsx";
import {
  BatchCompletionMessage,
  BatchConversionMessage,
  ConversionResult,
  ConversionTask,
  Message,
  MessageType,
} from "@/components/Converter/workers/ConvertionWorkerTypes.ts";
import {
  ConversionErrorType,
  ConversionHistoryManager,
} from "@/components/Converter/utils/ConversionHistoryManager/ConversionHistoryManager.ts";
import {
  ConversionMetricsManager,
  FileMetrics,
} from "@/components/Converter/utils/ConversionMetricsManager/ConversionMetricsManager.ts";
import {
  getMaxMemoryLimitInBytes,
  isMemoryExceeded,
} from "@/utils/performance.ts";

export interface ConversionSettings {
  timeout?: number;
  batchSize?: number;
  memoryLimit?: number;
}
interface UseConverterProps {
  onBatchConversionFinished?: (
    successful: Array<{ source: File; target: File }>,
    failed: Array<{ source: File }>,
  ) => void;
  onConversionCanceled: () => void;
}

const useConverter = ({
  onBatchConversionFinished,
  onConversionCanceled,
}: UseConverterProps) => {
  const { openModal, closeModal } = useModal();
  const worker = useMemo(() => new FileConverterWorker(), []);
  const accumulatedFailures = useRef<Array<ConversionResult>>([]);
  const converterOptions = useRef<ConversionSettings>({
    timeout: 0,
  });
  const batchConversionGenerator = useRef<
    Generator<Array<ConversionTask>> | undefined
  >(undefined);

  const conversionHistory = useMemo(() => new ConversionHistoryManager(), []);
  const conversionMetrics = useMemo(
    () => new ConversionMetricsManager(conversionHistory),
    [],
  );

  const cancelConversion = () => {
    sendMessageToWorker({ messageType: MessageType.Halt });
  };

  const sendMessageToWorker = (message: Message) => {
    worker.postMessage(message);
  };

  const convert = (
    tasks: Array<ConversionTask>,
    {
      timeout = 1000,
      memoryLimit = getMaxMemoryLimitInBytes() * 0.8,
    }: ConversionSettings,
  ) => {
    batchConversionGenerator.current = batchGenerator<ConversionTask>(
      tasks,
      tasks.length / 10,
    );
    converterOptions.current.timeout = timeout;
    converterOptions.current.memoryLimit = memoryLimit;

    processNextBatch();
  };

  const haltConversionDueToMemory = () => {
    cancelConversion();
    openModal(
      <Modal
        onClose={closeModal}
        header={
          <ModalHeader onClose={closeModal} title="Memory Limit Exceeded" />
        }
        body={
          <ModalBody>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The memory usage of the application exceeded the configured limit.
              Conversions have been halted to prevent instability.
            </p>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Please take the following steps:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <strong>Download the converted files:</strong> Save the already
                converted files to your local system to avoid losing progress.
              </li>
              <li>
                <strong>Remove converted files:</strong> Clear converted files
                from the app to free up memory.
              </li>
              <li>
                <strong>Adjust the memory limit:</strong> Increase the memory
                limit in the settings and try again with fewer files.
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              If the issue persists, consider restarting the app or splitting
              the conversion task into smaller batches.
            </p>
          </ModalBody>
        }
      />,
    );
  };

  const processNextBatch = () => {
    if (!batchConversionGenerator.current) return;
    const { value: batch, done } = batchConversionGenerator.current.next();
    if (done) {
      finishBatchProcessing();
      return;
    }

    if (
      isMemoryExceeded(
        converterOptions.current.memoryLimit || Number.POSITIVE_INFINITY,
      )
    ) {
      haltConversionDueToMemory();
      return;
    }

    const taskBatch: BatchConversionMessage = {
      messageType: MessageType.ConvertBatch,
      tasks: batch,
      timeout: converterOptions.current.timeout,
    };
    sendMessageToWorker(taskBatch);
  };

  const finishBatchProcessing = () => {
    informAboutFailures();
    resetConverterOptions();
  };

  const resetConverterOptions = () => {
    batchConversionGenerator.current = undefined;
    converterOptions.current.timeout = undefined;
    converterOptions.current.memoryLimit = undefined;
  };

  const informAboutFailures = () => {
    const failures = accumulatedFailures.current;
    if (!failures.length) return;

    const metrics = getMetricsForFailures(failures);
    const errors = groupErrorsByType(metrics);

    showFailureModal(errors);

    accumulatedFailures.current = [];
  };

  const showFailureModal = (
    errors: Record<ConversionErrorType, Array<string>>,
  ) => {
    openModal(
      <Modal
        onClose={closeModal}
        header={
          <ModalHeader onClose={closeModal} title="Finished With Errors" />
        }
        body={<ModalBody>{renderErrorDetails(errors)}</ModalBody>}
      />,
    );
  };

  const getMetricsForFailures = (
    failures: Array<ConversionResult>,
  ): Readonly<Array<FileMetrics>> =>
    conversionMetrics.getMetricsFor(failures.map((e) => e.source)) as Readonly<
      Array<FileMetrics>
    >;

  const groupErrorsByType = (
    metrics: Readonly<Array<FileMetrics>>,
  ): Record<ConversionErrorType, Array<string>> =>
    metrics.reduce<Record<ConversionErrorType, Array<string>>>(
      (errors, metric) => {
        Object.entries(metric.errorCount).forEach(([error, counter]) => {
          if (counter) {
            errors[error as ConversionErrorType].push(metric.sourceFileName);
          }
        });
        return errors;
      },
      {
        [ConversionErrorType.CONVERSION_FAILED]: [],
        [ConversionErrorType.TIMEOUT]: [],
      },
    );

  const renderErrorDetails = (
    errors: Record<ConversionErrorType, Array<string>>,
  ): ReactNode => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Object.entries(errors).map(
        ([errorType, files]) =>
          files.length > 0 && (
            <div key={errorType} className="py-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {errorType.replace(/_/g, " ")}
              </h3>
              <ul className="pl-4 space-y-1 text-gray-700 dark:text-gray-300">
                {files.map((fileName) => (
                  <li
                    key={fileName}
                    className="text-sm hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {fileName}
                  </li>
                ))}
              </ul>
              {errorType === ConversionErrorType.TIMEOUT && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    A few files took longer than expected to convert. You can
                    increase the timeout or disable it to allow these files more
                    time for conversion. However, doing so may lead to longer
                    processing times and reduced control over stuck conversions.
                  </p>
                </div>
              )}
            </div>
          ),
      )}
    </div>
  );

  const handleBatchProcessingFinished = (
    conversionResult: BatchCompletionMessage,
  ) => {
    const { results, history } = conversionResult;
    if (!Array.isArray(results) || !history) return;

    conversionHistory.replaceHistories(history);

    const [successful, failed] = partitionResults(results);
    accumulatedFailures.current = [...accumulatedFailures.current, ...failed];

    // @ts-ignore
    onBatchConversionFinished?.(successful, failed);
    processNextBatch();
  };

  const partitionResults = (
    results: Array<ConversionResult>,
  ): [Array<ConversionResult>, Array<ConversionResult>] =>
    results.reduce<[Array<ConversionResult>, Array<ConversionResult>]>(
      (partitioned, result) => {
        result.source && result.target
          ? partitioned[0].push(result)
          : partitioned[1].push(result);
        return partitioned;
      },
      [[], []],
    );

  const handleHalted = () => {
    resetConverterOptions();
    informAboutFailures();
    onConversionCanceled();
  };

  useEffect(() => {
    worker.onmessage = (e: MessageEvent<Message>) => {
      const messageType = e.data.messageType;
      if (messageType === MessageType.BatchFinished) {
        handleBatchProcessingFinished(e.data as BatchCompletionMessage);
      } else if (messageType === MessageType.Halted) {
        handleHalted();
      }
    };
  }, []);

  return {
    conversionHistory,
    conversionMetrics,
    cancelConversion,
    convert,
  };
};

export default useConverter;
