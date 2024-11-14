import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useImmer } from "use-immer";
import { ConversionMetricsManager } from "@/components/Converter/utils/ConversionMetricsManager/ConversionMetricsManager.ts";
import { ConversionHistoryManager } from "@/components/Converter/utils/ConversionHistoryManager/ConversionHistoryManager.ts";
import {
  SourceEvent,
  SourceEventName,
  useSources,
} from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";
import { useTargets } from "@/components/Converter/context/TargetsContext/TargetsContext.tsx";
import useConverter, {
  ConversionSettings,
} from "@/components/Converter/hooks/UseConverter/UseConverter.tsx";
import {
  download,
  downloadAll,
} from "@/components/Converter/Converter.utils.tsx";
import { ConversionTask } from "@/components/Converter/workers/ConvertionWorkerTypes.ts";

export interface ConversionState {
  beingConverted: Record<string, number>;
  conversionInProgress: boolean;
  conversionProgress: number;
  // @ts-ignore
  conversionHistory: ConversionHistoryManager;
  conversionMetrics: ConversionMetricsManager;
  conversionConfig: {
    timeout?: number;
    memoryLimit?: number;
  };
}

interface ConversionContextType {
  readonly convertSource: (file: File) => void;
  readonly cancelConversion: () => void;
  readonly convertAllSources: () => void;
  readonly downloadTarget: (target: File) => void;
  readonly downloadAllTargets: () => void;
  readonly conversionState: ConversionState;
  readonly setConversionSettings: (config: ConversionSettings) => void;
}

const ConversionContext = createContext<ConversionContextType | null>(null);

interface ConversionProviderProps {
  readonly children: ReactNode;
}
export const ConversionProvider = memo(
  ({ children }: ConversionProviderProps) => {
    const { sourcesState, eventStream } = useSources();
    const { targetsState, addTargets } = useTargets();
    const awaitingConversion = useRef<number>(0);

    const handleBatchConversionFinished = (
      successful: Array<{ source: File; target: File }>,
      failed: Array<{ source: File }>,
    ) => {
      awaitingConversion.current -= successful.length + failed.length;
      setConversionState((draft) => {
        successful.forEach(({ source }) => {
          delete draft.beingConverted[source.name];
        });
        failed.forEach(({ source }) => {
          delete draft.beingConverted[source.name];
        });
        draft.conversionInProgress = awaitingConversion.current !== 0;
      });
      addTargets(successful);
    };
    const handleConversionCanceled = () => {
      awaitingConversion.current = 0;

      setConversionState((draft) => {
        draft.beingConverted = {};
        draft.conversionInProgress = false;
      });
    };

    const { conversionHistory, conversionMetrics, cancelConversion, convert } =
      useConverter({
        onBatchConversionFinished: handleBatchConversionFinished,
        onConversionCanceled: handleConversionCanceled,
      });

    const [conversionState, setConversionState] = useImmer<ConversionState>({
      conversionProgress: 0,
      conversionInProgress: false,
      beingConverted: {},
      conversionHistory: conversionHistory,
      conversionMetrics: conversionMetrics,
      conversionConfig: {},
    });

    useEffect(() => {
      conversionState.conversionHistory.clearAllHistory();
    }, [targetsState.targetType]);

    useEffect(() => {
      const newProgress = calculateConversionProgress();
      if (newProgress !== conversionState.conversionProgress) {
        setConversionState((draft) => {
          draft.conversionProgress = newProgress;
        });
      }
    }, [sourcesState.totalSources, targetsState.totalTargets]);

    useEffect(() => {
      const sub = eventStream.subscribe((e: SourceEvent) => {
        switch (e.name) {
          case SourceEventName.OnSourceRemoved:
            conversionState.conversionHistory.clearHistoryForSourceFiles(
              e.data.source,
            );
            break;
          case SourceEventName.OnAllSourcesRemoved:
            conversionState.conversionHistory.clearAllHistory();
            break;
        }
      });
      return () => sub.unsubscribe();
    }, [eventStream]);
    const calculateConversionProgress = () => {
      let newProgress = sourcesState.totalSources
        ? (targetsState.totalTargets / sourcesState.totalSources || 0) * 100
        : 0;
      return parseFloat(newProgress.toFixed(2));
    };

    const downloadAllTargets = useCallback(() => {
      const targetsArray = Object.values(targetsState.targets);
      if (targetsArray.length === 0) return;
      downloadAll(targetsArray);
    }, [targetsState.targets]);

    const downloadTarget = useCallback((target: File) => {
      if (!target) return;
      download(target);
    }, []);
    const convertSources = useCallback(
      (files: File[]) => {
        if (!targetsState.targetType) return;
        const tasks: Array<ConversionTask> = files
          .filter((f) => !(f.name in targetsState.targets))
          .map((file) => ({
            source: file,
            targetFormat: targetsState.targetType!,
          }));
        if (!tasks.length) return;

        awaitingConversion.current += tasks.length;

        setConversionState((draft) => {
          tasks.forEach((t) => {
            draft.beingConverted[t.source.name] = 0;
          });
          draft.conversionInProgress = awaitingConversion.current > 0;
        });

        convert(tasks, conversionState.conversionConfig);
      },
      [
        targetsState.targetType,
        targetsState.targets,
        convert,
        conversionState.conversionConfig,
      ],
    );

    const setConversionSettings = useCallback(
      (settings: ConversionSettings) => {
        setConversionState((draft) => {
          draft.conversionConfig = Object.assign(
            draft.conversionConfig,
            settings,
          );
        });
      },
      [setConversionState],
    );

    const convertAllSources = useCallback(() => {
      convertSources(Object.values(sourcesState.sources));
    }, [convertSources, sourcesState.sources]);

    const convertSource = useCallback(
      (file: File) => {
        convertSources([file]);
      },
      [convertSources],
    );
    const contextValue = useMemo(
      () => ({
        convertAllSources,
        convertSource,
        downloadAllTargets,
        downloadTarget,
        cancelConversion,
        setConversionSettings,
        conversionState,
      }),
      [
        convertAllSources,
        convertSource,
        downloadAllTargets,
        downloadTarget,
        cancelConversion,
        setConversionSettings,
        conversionState,
      ],
    );
    return (
      <ConversionContext.Provider value={contextValue}>
        {children}
      </ConversionContext.Provider>
    );
  },
);

export const useConversion = () => {
  return useContext(ConversionContext)!;
};
