import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useImmer } from "use-immer";
import { ToastTypeEnum } from "@/components/Toast/ToastType.enum.ts";

import useToast from "@/hooks/UseToast/UseToast.tsx";
import useModal from "@/hooks/UseModal/UseModal.tsx";
import { Subject } from "rxjs";
import {
  conversionGuide,
  isSupported,
  SupportedSourceTypes,
  unsupportedName,
} from "@/components/Converter/Converter.consts.tsx";
import SelectTypeModal from "@/components/Converter/components/SourceTypeSelectionModal/SourceTypeSelectionModal.tsx";

export interface SourcesState {
  totalSources: number;
  sources: Record<string, File>;
  sourceType: SupportedSourceTypes | undefined;
}
export enum SourceEventName {
  OnSourceRemoved = "OnSourceRemoved",
  OnAllSourcesRemoved = "OnAllSourcesRemoved",
  OnSourcesAdded = "OnSourcesAdded",
}

interface OnSourcesAdded {
  name: SourceEventName.OnSourcesAdded;
  data: { sources: Record<string, File> };
}

interface OnSourceRemoved {
  name: SourceEventName.OnSourceRemoved;
  data: { source: Array<File> };
}

interface OnAllSourcesRemoved {
  name: SourceEventName.OnAllSourcesRemoved;
  data: {};
}

export type SourceEvent =
  | OnSourceRemoved
  | OnAllSourcesRemoved
  | OnSourcesAdded;

interface SourcesContextType {
  sourcesState: SourcesState;
  addSources: (incomingFiles: FileList | Array<File>) => Promise<void>;
  removeSource: (file: File) => void;
  removeSourcesByName: (fileNames: Array<string>) => void;
  removeAllSources: () => void;
  eventStream: Subject<SourceEvent>;
}

const SourcesContext = createContext<SourcesContextType | null>(null);

interface SourcesProviderProps {
  readonly children: ReactNode;
}
export const SourcesProvider = memo(({ children }: SourcesProviderProps) => {
  const { addToast } = useToast();
  const { openModal, closeModal } = useModal();
  const [sourcesState, setSourcesState] = useImmer<SourcesState>({
    sources: {},
    totalSources: 0,
    sourceType: undefined,
  });

  const eventStream = useMemo(() => new Subject<SourceEvent>(), []);

  const promptUserToSelectFileType = useCallback(
    async (
      incomingFiles: ReadonlyArray<File>,
    ): Promise<SupportedSourceTypes> => {
      let reduced = incomingFiles.reduce(
        (reduced, file) => {
          if (isSupported(file.type)) {
            reduced.supportedTypes.add(file.type);
          } else {
            reduced.unsupportedTypes.add(file.type);
          }
          return reduced;
        },
        {
          supportedTypes: new Set<SupportedSourceTypes>(),
          unsupportedTypes: new Set<string>(),
        },
      );

      const [supportedTypes, unsupportedTypes] = [
        Array.from(reduced.supportedTypes),
        Array.from(reduced.unsupportedTypes),
      ];

      if (supportedTypes.length === 1) {
        return supportedTypes[0];
      }
      if (supportedTypes.length === 0) {
        addToast({
          title: "Unsupported Type Detected",
          message: `The following file types are not supported: ${unsupportedTypes
            .map(unsupportedName)
            .join(", ")}`,
          type: ToastTypeEnum.INFO,
        });
        throw new Error("");
      }

      return new Promise((resolve) => {
        openModal(
          <SelectTypeModal
            supportedTypes={supportedTypes}
            unsupportedTypes={unsupportedTypes}
            onSelect={(fileType) => {
              closeModal();
              resolve(fileType);
            }}
          />,
        );
      });
    },
    [addToast, openModal, closeModal],
  );
  const filterFilesByType = useCallback(
    async (incomingFiles: ReadonlyArray<File>): Promise<File[]> => {
      const isFirstAddition = sourcesState.totalSources == 0;
      const allowedType = isFirstAddition
        ? await promptUserToSelectFileType(incomingFiles)
        : sourcesState.sourceType;

      if (allowedType != sourcesState.sourceType) {
        setSourcesState((draft) => {
          draft.sourceType = allowedType;
        });
      }

      const droppedFileNames: string[] = [];
      const allowedFiles: File[] = [];

      incomingFiles.forEach((file) => {
        if (file.type === allowedType) {
          allowedFiles.push(file);
        } else {
          droppedFileNames.push(file.name);
        }
      });

      if (droppedFileNames.length > 0) {
        addToast({
          message: `Files that were not ${conversionGuide.supported[allowedType as SupportedSourceTypes].name} were not added`,
          type: ToastTypeEnum.INFO,
        });
      }

      return allowedFiles;
    },
    [
      sourcesState.totalSources,
      sourcesState.sourceType,
      setSourcesState,
      addToast,
      promptUserToSelectFileType,
    ],
  );
  const findDuplicateAndNewFiles = useCallback(
    (incomingFiles: ReadonlyArray<File>): [string[], Record<string, File>] => {
      const duplicateFiles: string[] = [];
      const uniqueFiles: Record<string, File> = {};

      incomingFiles.forEach((file) => {
        if (sourcesState.sources[file.name]) {
          duplicateFiles.push(file.name);
        } else {
          uniqueFiles[file.name] = file;
        }
      });

      return [duplicateFiles, uniqueFiles];
    },
    [sourcesState.sources],
  );
  const addSources = useCallback(
    async (incomingFiles: Readonly<FileList | Array<File>>) => {
      try {
        if (incomingFiles.length === 0) return;

        const filteredFiles = await filterFilesByType(
          Array.from(incomingFiles),
        );

        const [duplicateFiles, uniqueFiles] =
          findDuplicateAndNewFiles(filteredFiles);

        setSourcesState((draft) => {
          draft.sources = Object.assign(draft.sources, uniqueFiles);
          draft.totalSources += Object.values(uniqueFiles).length;
        });

        if (duplicateFiles.length > 0) {
          addToast({
            message: `Files already added: ${duplicateFiles.join(", ")}`,
            title: "Duplicate Files",
            type: ToastTypeEnum.INFO,
          });
        }
        eventStream.next({
          name: SourceEventName.OnSourcesAdded,
          data: { sources: uniqueFiles },
        });
      } catch (e) {}
    },
    [
      filterFilesByType,
      findDuplicateAndNewFiles,
      setSourcesState,
      addToast,
      eventStream,
    ],
  );

  const removeSourcesByName = useCallback(
    (fileNames: Array<string>) => {
      const removed: Array<File> = [];
      setSourcesState((draft) => {
        fileNames.forEach((name) => {
          if (name in sourcesState.sources) {
            removed.push(draft.sources[name]);
            delete draft.sources[name];
            draft.totalSources -= 1;
          }
        });

        draft.sourceType =
          draft.totalSources > 0 ? draft.sourceType : undefined;

        draft.totalSources == 0
          ? eventStream.next({
              name: SourceEventName.OnAllSourcesRemoved,
              data: {},
            })
          : eventStream.next({
              name: SourceEventName.OnSourceRemoved,
              data: { source: removed },
            });
      });
    },
    [sourcesState.sources, setSourcesState, eventStream],
  );

  const removeSource = useCallback(
    (file: File) => {
      setTimeout(() => {
        removeSourcesByName([file.name]);
      }, 50);
    },
    [removeSourcesByName],
  );

  const removeAllSources = useCallback(() => {
    setSourcesState((draft) => {
      draft.sources = {};
      draft.totalSources = 0;
      draft.sourceType = undefined;
    });

    eventStream.next({
      name: SourceEventName.OnAllSourcesRemoved,
      data: {},
    });
  }, [setSourcesState, eventStream]);

  const contextValue = useMemo(
    () => ({
      sourcesState,
      addSources,
      removeSource,
      removeSourcesByName,
      removeAllSources,
      eventStream,
    }),
    [
      sourcesState,
      addSources,
      removeSource,
      removeSourcesByName,
      removeAllSources,
      eventStream,
    ],
  );
  return (
    <SourcesContext.Provider value={contextValue}>
      {children}
    </SourcesContext.Provider>
  );
});

export const useSources = () => {
  return useContext(SourcesContext)!;
};
