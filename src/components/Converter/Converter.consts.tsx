import {
  convertImageToPdf,
  jimpConvert,
} from "@/components/Converter/Converter.utils.tsx";

export const conversionGuide = {
  supported: {
    "image/png": {
      name: "PNG",
      targets: {
        "image/jpeg": {
          target: "image/jpeg",
          name: "JPEG (Lossy)",
          extension: ".jpeg",
          convert: async (file: File) => jimpConvert(file, "image/jpeg"),
        },
        "application/pdf": {
          target: "application/pdf",
          name: "PDF (Single Page)",
          extension: ".pdf",
          convert: async (file: File) => convertImageToPdf(file),
        },
        "image/bmp": {
          target: "image/bmp",
          name: "BMP (Bitmap)",
          extension: ".bmp",
          convert: async (file: File) => jimpConvert(file, "image/bmp"),
        },
      },
    },
    "image/jpeg": {
      name: "JPEG",
      targets: {
        "image/png": {
          target: "image/png",
          name: "PNG (Lossless)",
          extension: ".png",
          convert: async (file: File) => jimpConvert(file, "image/png"),
        },
        "application/pdf": {
          target: "application/pdf",
          name: "PDF (Single Page)",
          extension: ".pdf",
          convert: async (file: File) => convertImageToPdf(file),
        },
        "image/bmp": {
          target: "image/bmp",
          name: "BMP (Bitmap)",
          extension: ".bmp",
          convert: async (file: File) => jimpConvert(file, "image/bmp"),
        },
      },
    },
    "image/bmp": {
      name: "BMP",
      targets: {
        "image/png": {
          target: "image/png",
          name: "PNG (Lossless)",
          extension: ".png",
          convert: async (file: File) => jimpConvert(file, "image/png"),
        },
        "image/jpeg": {
          target: "image/jpeg",
          name: "JPEG (Lossy)",
          extension: ".jpeg",
          convert: async (file: File) => jimpConvert(file, "image/jpeg"),
        },
        "application/pdf": {
          target: "application/pdf",
          name: "PDF (Single Page)",
          extension: ".pdf",
          convert: async (file: File) => convertImageToPdf(file),
        },
      },
    },
  },
  unsupported: {
    "application/pdf": { name: "PDF Document" },
    "application/msword": { name: "Word Document" },
    "text/plain": { name: "Plain Text ConvertionItem" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      name: "Word Document (.docx)",
    },
    "application/vnd.ms-excel": { name: "Excel Spreadsheet" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      name: "Excel Spreadsheet (.xlsx)",
    },
    "application/zip": { name: "ZIP Archive" },
    "application/x-rar-compressed": { name: "RAR Archive" },
    "application/x-7z-compressed": { name: "7-Zip Archive" },
    "audio/mpeg": { name: "MP3 Audio" },
    "audio/wav": { name: "WAV Audio" },
    "audio/aac": { name: "AAC Audio" },
    "video/mp4": { name: "MP4 Video" },
    "video/x-matroska": { name: "MKV Video" },
    "video/avi": { name: "AVI Video" },
    "application/json": { name: "JSON ConvertionItem" },
    "application/javascript": { name: "JavaScript ConvertionItem" },
    "application/x-python-code": { name: "Python ConvertionItem" },
    "application/x-executable": { name: "Executable ConvertionItem" },
    "image/heic": { name: "HEIC Image" },
    "image/tiff": { name: "TIFF Image" },
    "application/postscript": { name: "PostScript ConvertionItem" },
  },
};
export type SupportedSourceTypes = keyof typeof conversionGuide.supported;

export const isSupported = (
  sourceType: string,
): sourceType is SupportedSourceTypes => {
  return sourceType in conversionGuide.supported;
};

export const unsupportedName = (fileType: string) => {
  // @ts-ignore
  return conversionGuide.unsupported[fileType]?.name || fileType || "Unknown";
};
