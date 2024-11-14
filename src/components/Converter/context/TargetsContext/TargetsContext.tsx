import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useImmer } from "use-immer";

import Modal from "@/components/Modal/Modal.tsx";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal.tsx";
import useModal from "@/hooks/UseModal/UseModal.tsx";
import { SupportedSourceTypes } from "@/components/Converter/Converter.consts.tsx";
import {
  SourceEventName,
  useSources,
} from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";

export interface TargetsState {
  totalTargets: number;
  targets: Record<string, File>;
  targetType: string | undefined;
}
interface TargetsContextType {
  readonly targetsState: TargetsState;
  readonly onTargetTypeSelected: (type: SupportedSourceTypes) => void;
  readonly addTarget: (source: File, target: File) => void;
  readonly addTargets: (
    items: { source: File; target: File }[] | { source: File; target: File },
  ) => void;
  readonly removeAllSourcesThatHaveTargets: () => void;
}

const TargetsContext = createContext<TargetsContextType | null>(null);

interface TargetsProviderProps {
  readonly children: ReactNode;
}
export const TargetsProvider = memo(({ children }: TargetsProviderProps) => {
  const { openModal, closeModal } = useModal();
  const { eventStream, removeSourcesByName } = useSources();

  const [targetsState, setTargetsState] = useImmer<TargetsState>({
    targets: {},
    totalTargets: 0,
    targetType: undefined,
  });

  useEffect(() => {
    const subscription = eventStream.subscribe((event) => {
      switch (event.name) {
        case SourceEventName.OnAllSourcesRemoved:
          removeAllTargets();
          break;
        case SourceEventName.OnSourceRemoved:
          removeTarget(event.data.source);
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [eventStream]);

  const removeTarget = useCallback(
    (sources: Array<File>) => {
      setTargetsState((draft) => {
        sources.forEach((source) => {
          if (source.name in draft.targets) {
            delete draft.targets[source.name];
            draft.totalTargets -= 1;
          }
        });
      });
    },
    [setTargetsState],
  );

  const removeAllTargets = useCallback(() => {
    setTargetsState((draft) => {
      draft.targets = {};
      draft.totalTargets = 0;
      draft.targetType = undefined;
    });
  }, [setTargetsState]);

  const removeAllSourcesThatHaveTargets = useCallback(() => {
    removeSourcesByName(Object.keys(targetsState.targets));
  }, [removeSourcesByName, targetsState.targets]);
  const getUserConfirmation = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal(
        <Modal
          onClose={() => {
            closeModal();
            resolve(false);
          }}
          body={
            <ConfirmModal
              title=" Confirm Your Selection"
              description="Changing the target type will reset any converted files. Are you sure you want to proceed?"
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
  }, [openModal, closeModal]);
  const onTargetTypeSelected = useCallback(
    async (type: SupportedSourceTypes) => {
      if (type === targetsState.targetType) return;
      const alreadyHasConvertedFiles = targetsState.totalTargets > 0;
      let confirm = !alreadyHasConvertedFiles
        ? true
        : await getUserConfirmation();

      if (confirm) {
        setTargetsState((draft) => {
          draft.targetType = type;
          draft.totalTargets = 0;
          draft.targets = {};
        });
      }
    },
    [
      targetsState.targetType,
      targetsState.totalTargets,
      getUserConfirmation,
      setTargetsState,
    ],
  );
  const addTarget = useCallback(
    (source: File, target: File) => {
      setTargetsState((draft) => {
        draft.targets[source.name] = target;
        draft.totalTargets += 1;
      });
    },
    [setTargetsState],
  );
  const addTargets = useCallback(
    (
      items: { source: File; target: File }[] | { source: File; target: File },
    ) => {
      const i = Array.isArray(items) ? items : [items];
      if (!i.length) return;
      setTargetsState((draft) => {
        i.forEach(({ source, target }) => {
          draft.targets[source.name] = target;
        });
        draft.totalTargets += i.length;
      });
    },
    [setTargetsState],
  );

  const contextValue = useMemo(
    () => ({
      onTargetTypeSelected,
      addTarget,
      addTargets,
      removeAllSourcesThatHaveTargets,
      targetsState,
    }),
    [
      onTargetTypeSelected,
      addTarget,
      addTargets,
      removeAllSourcesThatHaveTargets,
      targetsState,
    ],
  );
  return (
    <TargetsContext.Provider value={contextValue}>
      {children}
    </TargetsContext.Provider>
  );
});

export const useTargets = () => {
  return useContext(TargetsContext)!;
};
