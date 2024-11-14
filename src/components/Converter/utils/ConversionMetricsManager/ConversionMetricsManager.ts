import cloneDeep from "lodash/cloneDeep";
import {
  ConversionErrorType,
  ConversionHistoryEntry,
  ConversionHistoryManager,
  HistoryRecord,
  HistoryRecordType,
} from "@/components/Converter/utils/ConversionHistoryManager/ConversionHistoryManager.ts";

export type FileMetrics = {
  sourceFileName: string;
  sourceFileSize: number;
  convertedFileSize: number;
  sizeChangePercentage: number;
  timeTaken: number | null;
  successCount: number;
  errorCount: Record<ConversionErrorType, number>;
};

export type OverallMetrics = {
  longestConversion?: { sourceFileName: string; timeTaken: number };
  shortestConversion?: { sourceFileName: string; timeTaken: number };
  averageConversionTime: number | null;
  totalConvertedSizeInBytes: number;
  totalSourceSizeInBytes: number;
  totalSizeReduction: { percentage: number; bytes: number };
  counters: { success: number; error: Record<ConversionErrorType, number> };
};

const DEFAULT_METRICS: OverallMetrics = {
  counters: {
    success: 0,
    error: Object.values(ConversionErrorType).reduce(
      (acc, type) => ({ ...acc, [type]: 0 }),
      {} as Record<ConversionErrorType, number>,
    ),
  },
  longestConversion: undefined,
  shortestConversion: undefined,
  averageConversionTime: null,
  totalConvertedSizeInBytes: 0,
  totalSourceSizeInBytes: 0,
  totalSizeReduction: { bytes: 0, percentage: 0 },
};

export class ConversionMetricsManager {
  private fileMetricsCache: Record<string, FileMetrics> = {};
  private overallMetricsCache: OverallMetrics = cloneDeep(DEFAULT_METRICS);
  private overallMetricsNeedUpdate = true;
  private readonly historyManager: ConversionHistoryManager;

  constructor(historyManager: ConversionHistoryManager) {
    this.historyManager = historyManager;
    this.historyManager.setOnSourceFileAddedCallback(this.createMetricFor);
    this.historyManager.setOnSourceFileRemovedCallback(this.deleteMetricFor);
    this.historyManager.setOnSourceFileUpdatedCallback(this.updateMetricsFor);
    this.historyManager.setOnHistoryClearedCallback(this.clearAllMetrics);
  }

  updateMetricsFor = (sourceFile: File) => {
    const sourceKey = ConversionMetricsManager.getSourceFileKey(sourceFile);
    const oldMetrics = this.fileMetricsCache[sourceKey];
    if (!oldMetrics) return;
    this.decrementMetrics(oldMetrics);
    delete this.fileMetricsCache[sourceKey];

    const conversionEntry = this.historyManager.getHistoryForSourceFile({
      name: sourceKey,
    } as File);
    if (!conversionEntry) return;

    const newMetrics = this.calculateFileMetrics(conversionEntry);
    this.fileMetricsCache[sourceKey] = newMetrics;
    this.incrementMetrics(newMetrics);
    this.overallMetricsNeedUpdate = true;
  };
  createMetricFor = (sourceFile: File) => {
    const sourceKey = ConversionMetricsManager.getSourceFileKey(sourceFile);
    const conversionEntry = this.historyManager.getHistoryForSourceFile({
      name: sourceKey,
    } as File);
    if (!conversionEntry) return;

    const metrics = this.calculateFileMetrics(conversionEntry);
    this.fileMetricsCache[sourceKey] = metrics;
    this.incrementMetrics(metrics);
    this.overallMetricsNeedUpdate = true;
  };

  deleteMetricFor = (sourceFile: File) => {
    const sourceKey = ConversionMetricsManager.getSourceFileKey(sourceFile);
    const metrics = this.fileMetricsCache[sourceKey];
    if (!metrics) return;
    this.decrementMetrics(metrics);
    delete this.fileMetricsCache[sourceKey];
    this.overallMetricsNeedUpdate = true;
  };
  private static readonly getSourceFileKey = (sourceFile: File): string =>
    sourceFile.name;

  private calculateFileMetrics(
    conversionEntry: ConversionHistoryEntry,
  ): FileMetrics {
    const { sourceFile, convertedFile, history } = conversionEntry;
    const sourceFileSize = sourceFile.size;
    const convertedFileSize = convertedFile?.size ?? sourceFileSize;

    const sizeChangePercentage = this.calculateSizeChangePercentage(
      sourceFileSize,
      convertedFileSize,
    );
    const timeTaken = this.calculateTimeTaken(history);
    const errorCount = this.calculateErrorCount(history);

    const successCount = Object.values(errorCount).every((count) => count === 0)
      ? 1
      : 0;

    return {
      sourceFileName: sourceFile.name,
      sourceFileSize,
      convertedFileSize,
      sizeChangePercentage,
      timeTaken,
      successCount,
      errorCount,
    };
  }

  private calculateSizeChangePercentage(
    sourceSize: number,
    convertedSize: number,
  ) {
    return sourceSize === 0
      ? 0
      : Number((((sourceSize - convertedSize) / sourceSize) * 100).toFixed(2));
  }
  private calculateTimeTaken(history: Array<HistoryRecord>) {
    const begin = history.find(
      (record) => record.type === HistoryRecordType.BEGIN,
    );
    const finish = history.find(
      (record) => record.type === HistoryRecordType.FINISH,
    );
    return begin && finish
      ? finish.timestamp.getTime() - begin.timestamp.getTime()
      : null;
  }

  private calculateErrorCount(history: Array<HistoryRecord>) {
    return Object.values(ConversionErrorType).reduce(
      (acc, type) => ({
        ...acc,
        [type]: history.filter(
          (record) =>
            record.type === HistoryRecordType.ERROR &&
            record.errorType === type,
        ).length,
      }),
      {} as Record<ConversionErrorType, number>,
    );
  }

  private recalculateExtremes(): void {
    let longestConversion: any = null;
    let shortestConversion: any = null;

    Object.values(this.fileMetricsCache).forEach((metrics) => {
      if (metrics.successCount && metrics.timeTaken !== null) {
        if (
          !longestConversion ||
          metrics.timeTaken > longestConversion.timeTaken
        ) {
          longestConversion = {
            sourceFileName: metrics.sourceFileName,
            timeTaken: metrics.timeTaken,
          };
        }

        if (
          !shortestConversion ||
          metrics.timeTaken < shortestConversion.timeTaken
        ) {
          shortestConversion = {
            sourceFileName: metrics.sourceFileName,
            timeTaken: metrics.timeTaken,
          };
        }
      }
    });

    this.overallMetricsCache.longestConversion = longestConversion || undefined;
    this.overallMetricsCache.shortestConversion =
      shortestConversion || undefined;
  }

  private updateSizeReduction(): void {
    const totalOriginalSize = this.overallMetricsCache.totalSourceSizeInBytes;
    const totalConvertedSize =
      this.overallMetricsCache.totalConvertedSizeInBytes;

    const totalSizeReductionBytes = totalOriginalSize - totalConvertedSize;
    const totalSizeReductionPercentage = Number(
      (totalOriginalSize
        ? (totalSizeReductionBytes / totalOriginalSize) * 100
        : 0
      ).toFixed(2),
    );

    this.overallMetricsCache.totalSizeReduction = {
      bytes: totalSizeReductionBytes,
      percentage: totalSizeReductionPercentage,
    };
  }

  private incrementMetrics(metrics: FileMetrics): void {
    this.overallMetricsCache.totalConvertedSizeInBytes +=
      metrics.convertedFileSize;
    this.overallMetricsCache.totalSourceSizeInBytes += metrics.sourceFileSize;

    this.overallMetricsCache.counters.success += metrics.successCount;

    for (const [errorType, count] of Object.entries(metrics.errorCount)) {
      this.overallMetricsCache.counters.error[
        errorType as ConversionErrorType
      ] += count;
    }

    if (metrics.successCount && metrics.timeTaken !== null) {
      this.overallMetricsCache.averageConversionTime = this.calculateNewAverage(
        this.overallMetricsCache.averageConversionTime,
        metrics.timeTaken,
        this.overallMetricsCache.counters.success,
      );
    }
  }

  private decrementMetrics(metrics: FileMetrics): void {
    const counters = this.overallMetricsCache.counters;
    this.overallMetricsCache.totalConvertedSizeInBytes -=
      metrics.convertedFileSize;
    this.overallMetricsCache.totalSourceSizeInBytes -= metrics.sourceFileSize;

    counters.success -= metrics.successCount;

    for (const [errorType, count] of Object.entries(metrics.errorCount)) {
      counters.error[errorType as ConversionErrorType] -= count;
    }
  }

  private calculateNewAverage(
    currentAverage: number | null,
    newValue: number,
    count: number,
  ): number {
    if (currentAverage === null) return newValue;
    return (currentAverage * (count - 1) + newValue) / count;
  }

  private calculateOverallMetrics(): void {
    this.recalculateExtremes();
    this.updateSizeReduction();
    this.overallMetricsNeedUpdate = false;
  }

  getMetricsFor(
    sourceFiles: File | Array<File>,
  ): Readonly<FileMetrics> | Readonly<Array<FileMetrics>> | null {
    if (Array.isArray(sourceFiles)) {
      return sourceFiles
        .map(
          (file) =>
            this.fileMetricsCache[
              ConversionMetricsManager.getSourceFileKey(file)
            ],
        )
        .filter(Boolean);
    }

    const sourceKey = ConversionMetricsManager.getSourceFileKey(sourceFiles);
    return this.fileMetricsCache[sourceKey] ?? null;
  }

  getOverallMetrics(): Readonly<OverallMetrics> {
    if (this.overallMetricsNeedUpdate) {
      this.calculateOverallMetrics();
    }
    return this.overallMetricsCache;
  }

  getAllFileMetrics(): Readonly<Array<FileMetrics>> {
    return Object.values(this.fileMetricsCache);
  }
  clearAllMetrics = (): void => {
    this.fileMetricsCache = {};
    this.overallMetricsCache = cloneDeep(DEFAULT_METRICS);
    this.overallMetricsNeedUpdate = false;
  };
}
