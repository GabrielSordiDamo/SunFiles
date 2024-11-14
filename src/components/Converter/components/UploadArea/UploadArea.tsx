import { memo, useMemo, useRef } from "react";

import Paginator from "@/components/Pagination/Pagination.tsx";
import { useImmer } from "use-immer";
import ConversionItem from "@/components/Converter/components/ConvertionItem/ConversionItem.tsx";
import { useSources } from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";
import { useConversion } from "@/components/Converter/context/ConvertionContext/ConvertionContext.tsx";

const UploadArea = () => {
  const { addSources, sourcesState } = useSources();
  const { conversionState } = useConversion();

  const sources = useMemo(
    () =>
      Object.values(sourcesState.sources).map((file) => (
        <ConversionItem
          key={file.name}
          sourceName={file.name}
          className="w-full"
        ></ConversionItem>
      )),
    [sourcesState.sources],
  );

  const [pageItems, setPageItems] = useImmer<Array<any>>([]);
  const uploadArea = useRef<HTMLInputElement>(null);

  const isUploadAreaDisabled = conversionState.conversionInProgress;

  const handlePageChange = (items: any) => {
    setPageItems((draft) => {
      draft.splice(0, draft.length);
      draft.push(...items);
    });
  };
  const resetUploadArea = () => {
    if (uploadArea.current) {
      uploadArea.current.value = "";
      uploadArea.current.dispatchEvent(new Event("change"));
    }
  };
  const resetIsNeeded = sourcesState.totalSources === 0;
  if (resetIsNeeded) {
    resetUploadArea();
  }
  const handleFileChange = (event: any) => {
    if (event.target.files) addSources(event.target.files);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    if (event.dataTransfer.files) addSources(event.dataTransfer.files);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col gap-10">
      <div
        aria-label="ConvertionItem upload area"
        onDrop={isUploadAreaDisabled ? undefined : handleDrop}
        onDragOver={isUploadAreaDisabled ? undefined : handleDragOver}
        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg transition ${
          isUploadAreaDisabled
            ? "cursor-not-allowed bg-gray-300 border-gray-400"
            : "cursor-pointer bg-secondary-50 hover:bg-secondary-100 border-secondary-300"
        }`}
      >
        <input
          id="file-upload"
          type="file"
          ref={uploadArea}
          disabled={isUploadAreaDisabled}
          multiple
          onInput={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-full gap-y-2 p-4"
        >
          {Object.keys(sourcesState.sources).length > 0 ? (
            pageItems
          ) : (
            <>
              <svg
                className="w-10 h-10 text-primary-500 mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M16.5 8h-4V4.5a1.5 1.5 0 10-3 0V8h-4a1 1 0 000 2h4v4a1.5 1.5 0 103 0v-4h4a1 1 0 100-2z" />
              </svg>
              <span className="text-primary-500">
                Drag & drop a file, or click to select
              </span>
            </>
          )}
        </label>
      </div>
      <Paginator
        items={sources}
        onPageChange={handlePageChange}
        initialPageSize={5}
      />
    </div>
  );
};

export default memo(UploadArea);
