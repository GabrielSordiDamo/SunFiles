export function* batchGenerator<T>(
  items: T[],
  batchSize: number,
): Generator<T[]> {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize);
  }
}
