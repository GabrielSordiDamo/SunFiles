// @ts-nocheck
import { ConversionTask } from "@/components/Converter/workers/ConvertionWorkerTypes.ts";
import {
  conversionGuide,
  SupportedSourceTypes,
} from "@/components/Converter/Converter.consts.tsx";

self.onmessage = async (event: MessageEvent<ConversionTask>) => {
  const { source, targetFormat } = event.data;

  try {
    const target =
      await conversionGuide.supported[
        source.type as SupportedSourceTypes
      ].targets[targetFormat].convert(source);

    self.postMessage({ source, target });
  } catch (error) {
    self.postMessage({ source, error: "conversion failed" });
  }
};
