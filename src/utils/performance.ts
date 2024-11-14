export const getMaxMemoryLimitInBytes = (): number => {
  // @ts-ignore
  if (performance.memory) {
    // @ts-ignore
    return performance.memory.jsHeapSizeLimit;
  }
  return 0;
};

export const getUsedMemoryInBytes = (): number => {
  // @ts-ignore
  if (performance.memory) {
    // @ts-ignore
    return performance.memory.usedJSHeapSize;
  }
  return Number.POSITIVE_INFINITY;
};

export const getMemoryInMB = (bytes: number): number => {
  return Math.round(bytes / (1024 * 1024));
};

export const isMemoryExceeded = (memoryLimitInBytes: number): boolean => {
  const usedMemory = getUsedMemoryInBytes();
  return Boolean(usedMemory && usedMemory > memoryLimitInBytes);
};
