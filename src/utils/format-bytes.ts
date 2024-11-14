export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const unit = 1024;
  const precision = Math.max(0, decimals);
  const units = ["Bytes", "KB", "MB", "GB", "TB"];

  const absoluteBytes = Math.abs(bytes);
  const exponent = Math.floor(Math.log(absoluteBytes) / Math.log(unit)) || 0;
  const value =
    (absoluteBytes / Math.pow(unit, exponent)).toFixed(precision) || "N/A";

  const unitLabel = units[exponent] || "Unknown";

  const formattedValue = bytes < 0 ? `-${value}` : value;

  return `${formattedValue} ${unitLabel} (${bytes} Bytes)`;
};
