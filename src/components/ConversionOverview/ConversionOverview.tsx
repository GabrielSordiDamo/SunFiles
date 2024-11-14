import { PiSunFill } from "react-icons/pi";
import { conversionGuide } from "@/components/Converter/Converter.consts.tsx";

interface SunIconWithLetterProps {
  readonly letter: string;
}
const SunIconWithLetter = ({ letter }: SunIconWithLetterProps) => (
  <div className="relative flex items-center justify-center w-16 h-16">
    <PiSunFill size={64} className="text-primary-500" />
    <span className="absolute text-white text-lg font-bold">{letter}</span>
  </div>
);

interface ConversionTargetProps {
  readonly targetName: string;
  readonly targetExtension: string;
}
const ConversionTarget = ({
  targetName,
  targetExtension,
}: ConversionTargetProps) => (
  <div className=" flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded p-2">
    <div className="bg-accent-300 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
      {targetName.charAt(0)}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
        {targetName}
      </span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {targetExtension}
      </span>
    </div>
  </div>
);

interface FileFormatCardProps {
  readonly formatName: string;
  readonly formatLetter: string;
  readonly targets: { name: string; extension: string }[];
}
const FileFormatCard = ({
  formatName,
  formatLetter,
  targets,
}: FileFormatCardProps) => (
  <div className="bg-white dark:bg-dark-100  rounded-lg p-4  ">
    <div className="flex items-center gap-3">
      <SunIconWithLetter letter={formatLetter} />
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
        {formatName}
      </h3>
    </div>
    <p className="text-sm text-neutral-600 dark:text-neutral-200 mt-1">
      Supports {targets.length} conversions
    </p>
    <div className="mt-4 space-y-2">
      {targets.map((target) => (
        <ConversionTarget
          key={target.name}
          targetName={target.name}
          targetExtension={target.extension}
        />
      ))}
    </div>
  </div>
);

const ConversionOverview = () => {
  return (
    <div className="px-8 py-6 bg-neutral-100 dark:bg-dark-50">
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        Conversion Overview
      </h2>
      <p className="text-base text-neutral-700 dark:text-neutral-200 mt-2">
        Supported file formats and their possible conversions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Object.entries(conversionGuide.supported).map(([key, format]) => (
          <FileFormatCard
            key={key}
            formatName={format.name}
            formatLetter={format.name.charAt(0)}
            targets={Object.values(format.targets).map((target) => ({
              name: target.name,
              extension: target.extension,
            }))}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversionOverview;
