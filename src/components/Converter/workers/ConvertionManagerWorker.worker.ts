import ConverterWorker from "@/components/Converter/workers/ConverterWorker.worker.ts?worker";
import {
  ConversionErrorType,
  ConversionHistoryEntry,
  HistoryRecordType,
} from "@/components/Converter/utils/ConversionHistoryManager/ConversionHistoryManager.ts";
import {
  BatchCompletionMessage,
  BatchConversionMessage,
  ConversionResult,
  HaltNotificationMessage,
  Message,
  MessageType,
} from "@/components/Converter/workers/ConvertionWorkerTypes.ts";

const MAX_WORKERS = 3;
const MAX_ALLOWED_TIMEOUT = 86400000;

const workerPool: Worker[] = [];
let conversionHistory: ConversionHistoryEntry[] = [];
let isHalted = false;

const initializeWorkerPool = () => {
  for (let i = 0; i < MAX_WORKERS; i++) {
    workerPool.push(new ConverterWorker());
  }
};

const resetWorker = (workerIndex: number) => {
  workerPool[workerIndex].terminate();
  workerPool[workerIndex] = new ConverterWorker();
};

const clearConversionHistory = () => {
  conversionHistory = [];
};

const haltAllWorkers = () => {
  workerPool.forEach((worker, index) => {
    worker.terminate();
    workerPool[index] = new ConverterWorker();
  });
};

initializeWorkerPool();

let workerPromises: Array<{ promise: Promise<void>; reject: () => void }> = [];

const processBatchConversion = async (batchTask: BatchConversionMessage) => {
  clearConversionHistory();
  isHalted = false;
  const { tasks, timeout = MAX_ALLOWED_TIMEOUT } = batchTask;
  const batchResults: ConversionResult[] = [];
  workerPromises = [];
  for (let i = 0; i < tasks.length; i += MAX_WORKERS) {
    if (isHalted) break;

    const currentBatch = tasks.slice(i, i + MAX_WORKERS);

    workerPromises = currentBatch.map((task, index) => {
      const workerIndex = index % MAX_WORKERS;
      const worker = workerPool[workerIndex];

      return createRejectablePromise(
        handleWorkerTask(worker, workerIndex, task, batchResults, timeout),
      );
    });

    await Promise.all(workerPromises.map(({ promise }) => promise));
  }

  if (!isHalted) {
    self.postMessage({
      messageType: MessageType.BatchFinished,
      results: batchResults,
      history: conversionHistory,
    } as BatchCompletionMessage);
  }
};

const createRejectablePromise = (promise: Promise<void>) => {
  let rejectFunction: () => void;
  const wrappedPromise = new Promise<void>((resolve, reject) => {
    rejectFunction = reject;
    promise.then(resolve).catch(reject);
  });
  return { promise: wrappedPromise, reject: rejectFunction! };
};

const handleWorkerTask = (
  worker: Worker,
  workerIndex: number,
  task: { source: File; targetFormat: string },
  batchResults: ConversionResult[],
  timeout: number,
): Promise<void> => {
  const { source, targetFormat } = task;

  const historyEntry: ConversionHistoryEntry = {
    sourceFile: source,
    history: [],
  };
  historyEntry.history.push({
    type: HistoryRecordType.BEGIN,
    timestamp: new Date(),
  });
  conversionHistory.push(historyEntry);

  return new Promise<void>((resolve) => {
    const taskTimeout = setTimeout(() => {
      historyEntry.history.push({
        type: HistoryRecordType.ERROR,
        timestamp: new Date(),
        errorType: ConversionErrorType.TIMEOUT,
      });

      resetWorker(workerIndex);
      batchResults.push({ source });
      resolve();
    }, timeout);

    worker.onmessage = (
      event: MessageEvent<{ source: File; target?: File; error?: string }>,
    ) => {
      clearTimeout(taskTimeout);

      const { source, target, error } = event.data;

      if (error) {
        historyEntry.history.push({
          type: HistoryRecordType.ERROR,
          timestamp: new Date(),
          errorType: ConversionErrorType.CONVERSION_FAILED,
          message: error,
        });
        batchResults.push({ source });
      } else if (target) {
        historyEntry.convertedFile = target;
        historyEntry.history.push({
          type: HistoryRecordType.FINISH,
          timestamp: new Date(),
        });
        batchResults.push({ source, target });
      }

      resolve();
    };

    worker.onerror = () => {
      clearTimeout(taskTimeout);

      historyEntry.history.push({
        type: HistoryRecordType.ERROR,
        timestamp: new Date(),
        errorType: ConversionErrorType.CONVERSION_FAILED,
      });

      batchResults.push({ source });
      resolve();
    };

    worker.postMessage({ source, targetFormat });
  });
};

const halt = () => {
  isHalted = true;
  workerPromises.forEach((p) => p.reject());
  haltAllWorkers();
  clearConversionHistory();
  self.postMessage({
    messageType: MessageType.Halted,
  } as HaltNotificationMessage);
};

self.onmessage = (event: MessageEvent<Message>) => {
  const { messageType } = event.data;

  switch (messageType) {
    case MessageType.ConvertBatch:
      processBatchConversion(event.data as BatchConversionMessage);
      break;
    case MessageType.Halt:
      halt();
      break;
  }
};
