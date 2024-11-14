import InteractionBlocker from "@/components/InteractionBlocker/InteractionBlocker.tsx";
import ConversionHeader from "@/components/Converter/components/ConversionHeader/ConversionHeader.tsx";
import { SourcesProvider } from "@/components/Converter/context/SourcesContext/SourcesContext.tsx";
import { TargetsProvider } from "@/components/Converter/context/TargetsContext/TargetsContext.tsx";
import { ConversionProvider } from "@/components/Converter/context/ConvertionContext/ConvertionContext.tsx";
import ConversionMetricsOverview from "@/components/Converter/components/ConversionMetricsOverview/ConversionMetricsOverview.tsx";
import UploadArea from "@/components/Converter/components/UploadArea/UploadArea.tsx";

const Converter = () => {
  return (
    <SourcesProvider>
      <TargetsProvider>
        <ConversionProvider>
          <InteractionBlocker>
            <div className="w-full flex flex-col gap-10">
              <ConversionMetricsOverview />
              <ConversionHeader />
              <UploadArea />
            </div>
          </InteractionBlocker>
        </ConversionProvider>
      </TargetsProvider>
    </SourcesProvider>
  );
};

export default Converter;
