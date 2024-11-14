import JSZip from "jszip";
import { Jimp } from "jimp";
import { Buffer } from "buffer";
import { PDFDocument } from "pdf-lib";

const removeFileExtensionRegex = /\.[^/.]+$/;
const removeFileExtension = (fileName: string) =>
  fileName.replace(removeFileExtensionRegex, "");

export const downloadAll = async (
  files: Array<File>,
  config?: { fileName?: string },
) => {
  try {
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config?.fileName ?? "converted-files"}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    return false;
  }
};
export const download = (target: File) => {
  const fileNameParts = target.name.split(".");
  const extension =
    fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : "";
  const blob = new Blob([target], { type: target.type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const baseName = fileNameParts.slice(0, -1).join(".") || target.name;
  link.download = `${baseName}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export async function jimpConvert(file: File, targetFormat: string) {
  const arrayBuffer = await file.arrayBuffer();
  const image = await Jimp.read(Buffer.from(arrayBuffer));
  // @ts-ignore
  const convertedBuffer = await image.getBuffer(targetFormat);

  const extension = targetFormat.split("/")[1];
  const baseName = removeFileExtension(file.name);
  const newFileName = `${baseName}-converted.${extension}`;

  return new File([convertedBuffer], newFileName, { type: targetFormat });
}

export async function convertImageToPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const image = await Jimp.read(Buffer.from(arrayBuffer));
  const pdfDoc = await PDFDocument.create();

  const pngBuffer = await image.getBuffer("image/png");
  const pngImage = await pdfDoc.embedPng(pngBuffer);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const padding = 10;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const drawableWidth = pageWidth - 2 * padding;
  const drawableHeight = pageHeight - 2 * padding;

  const imageWidth = pngImage.width;
  const imageHeight = pngImage.height;

  const scaleFactor = Math.min(
    drawableWidth / imageWidth,
    drawableHeight / imageHeight,
  );

  const scaledWidth = imageWidth * scaleFactor;
  const scaledHeight = imageHeight * scaleFactor;

  const x = (pageWidth - scaledWidth) / 2;
  const y = (pageHeight - scaledHeight) / 2;

  const finalX = Math.max(padding, x);
  const finalY = Math.max(padding, y);

  page.drawImage(pngImage, {
    x: finalX,
    y: finalY,
    width: scaledWidth,
    height: scaledHeight,
  });

  const pdfBytes = await pdfDoc.save();
  const baseName = removeFileExtension(file.name);
  const newFileName = `${baseName}.pdf`;

  return new File([pdfBytes], newFileName, { type: "application/pdf" });
}
