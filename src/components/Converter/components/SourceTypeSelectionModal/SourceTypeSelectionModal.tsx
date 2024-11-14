import { useState } from "react";
import {
  conversionGuide,
  SupportedSourceTypes,
  unsupportedName,
} from "@/components/Converter/Converter.consts.tsx";

export interface SourceTypeSelectionModal {
  readonly supportedTypes: Array<SupportedSourceTypes>;
  readonly unsupportedTypes: Array<string>;
  readonly onSelect: (fileType: SupportedSourceTypes) => void;
}

const SelectTypeModal = ({
  supportedTypes,
  onSelect,
  unsupportedTypes,
}: SourceTypeSelectionModal) => {
  const [selectedType, setSelectedType] = useState<
    SupportedSourceTypes | undefined
  >(undefined);

  return (
    <div className="fixed inset-0 bg-overlay-dark flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-50 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 sm:mx-auto overflow-auto max-h-screen">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-4">
          Select a File Type
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
          Please select a file type to process. Unsupported file types will be
          ignored.
        </p>

        <div className="space-y-2 mb-4">
          {supportedTypes.map((type: SupportedSourceTypes) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`btn w-full text-left px-4 py-2 ${
                selectedType === type
                  ? "btn-primary"
                  : "border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-50 hover:bg-primary-100 dark:hover:bg-dark-100"
              }`}
            >
              {conversionGuide.supported[type].name}
            </button>
          ))}
        </div>

        {unsupportedTypes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              The following file types are not supported and will be ignored:
            </p>
            <ul className="text-sm text-red-500 dark:text-red-300 list-disc pl-5 mt-2">
              {unsupportedTypes.map((type) => (
                <li key={type}>{unsupportedName(type)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => selectedType && onSelect(selectedType)}
            disabled={!selectedType}
            className={`btn btn-primary px-6 ${
              !selectedType && "opacity-50 cursor-not-allowed"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTypeModal;
