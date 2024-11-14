export enum HistoryRecordType {
  BEGIN = "BEGIN",
  FINISH = "FINISH",
  INFO = "INFO",
  ERROR = "ERROR",
}
export enum ConversionErrorType {
  CONVERSION_FAILED = "CONVERSION_FAILED",
  TIMEOUT = "TIMEOUT",
}

export interface HistoryRecord {
  type: HistoryRecordType;
  timestamp: Date;
  message?: string;
  errorType?: ConversionErrorType;
}

export interface ConversionHistoryEntry {
  sourceFile: File;
  convertedFile?: File;
  history: HistoryRecord[];
}

export interface ConversionHistoryManager {
  longestConversion?: { sourceFileName: string; timeTaken: number };
  shortestConversion?: { sourceFileName: string; timeTaken: number };
  conversionDetails: {
    sourceFileName: string;
    sourceFileSize: number;
    convertedFileSize: number;
    sizeChangePercentage: number;
    timeTaken: number | null;
  }[];
}

export class ConversionHistoryManager {
  private history: Record<string, ConversionHistoryEntry> = {};
  private onSourceFileAdded: (sourceFile: File) => void = () => {};
  private onHistoryCleared: () => void = () => {};
  private onSourceFileRemoved: (sourceFile: File) => void = () => {};
  private onSourceFileUpdated: (sourceFile: File) => void = () => {};

  private static readonly getSourceFileKey = (sourceFile: File): string =>
    sourceFile.name;

  setOnSourceFileAddedCallback = (
    callback: (sourceFile: File) => void,
  ): void => {
    this.onSourceFileAdded = callback;
  };

  setOnSourceFileRemovedCallback = (
    callback: (sourceFile: File) => void,
  ): void => {
    this.onSourceFileRemoved = callback;
  };
  setOnSourceFileUpdatedCallback = (
    callback: (sourceFile: File) => void,
  ): void => {
    this.onSourceFileUpdated = callback;
  };
  setOnHistoryClearedCallback = (callback: () => void): void => {
    this.onHistoryCleared = callback;
  };

  replaceHistory = (history: ConversionHistoryEntry): void => {
    const isNewHistory = !(history.sourceFile.name in this.history);
    this.history[history.sourceFile.name] = history;

    if (isNewHistory) {
      this.onSourceFileAdded(history.sourceFile);
    } else {
      this.onSourceFileUpdated(history.sourceFile);
    }
  };

  replaceHistories = (history: Array<ConversionHistoryEntry>): void => {
    history.forEach(this.replaceHistory);
  };

  getHistoryForSourceFile = (
    sourceFile: File,
  ): ConversionHistoryEntry | null => {
    const sourceKey = ConversionHistoryManager.getSourceFileKey(sourceFile);
    return this.history[sourceKey] || null;
  };

  clearHistoryForSourceFiles = (sourceFiles: Array<File>): void => {
    sourceFiles.forEach((source) => {
      const sourceKey = ConversionHistoryManager.getSourceFileKey(source);
      delete this.history[sourceKey];
      this.onSourceFileRemoved(source);
    });
  };

  clearAllHistory = (): void => {
    this.history = {};
    this.onHistoryCleared();
  };
}
