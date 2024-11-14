import { ReactNode, useEffect, useRef } from "react";
import { PiArrowDown, PiArrowUp } from "react-icons/pi";
import Pagination from "@/components/Pagination/Pagination";
import { useImmer } from "use-immer";

export interface Column<T> {
  readonly key: string;
  readonly header: string;
  readonly render?: (value: T[keyof T], row: T) => ReactNode;
}

interface TableProps<T> {
  readonly data: ReadonlyArray<T>;
  readonly columns: Column<T>[];
  readonly initialPageSize?: number;
  readonly dataKeyExtractor: (d: any) => string;
}

interface SortConfig<T> {
  key: keyof T | null;
  direction: "ascending" | "descending" | null;
}

const Table = <T,>({
  data,
  columns,
  initialPageSize = 10,
  dataKeyExtractor,
}: TableProps<T>) => {
  const sortConfig = useRef<SortConfig<T>>({
    key: null,
    direction: null,
  });

  const [allItems, setAllItems] = useImmer<ReadonlyArray<T>>(data);
  const [pageItems, setPageItems] = useImmer<ReadonlyArray<T>>([]);

  useEffect(() => {
    sortConfig.current = { key: null, direction: null };
    setAllItems(() => data);
  }, [data]);
  const handlePageChange = (newItems: Array<T>) => {
    setPageItems(() => newItems);
  };

  const handleSort = (key: keyof T) => {
    const direction =
      sortConfig.current.key === key &&
      sortConfig.current.direction === "ascending"
        ? "descending"
        : "ascending";

    sortConfig.current = { key, direction };

    const sorted = [...data].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setAllItems(() => sorted);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="overflow-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm text-gray-700 dark:text-neutral-50">
          <thead className="bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-neutral-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(col.key as any)}
                  className="px-4 py-2 border border-gray-300 text-xs md:text-sm cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    {col.header}
                    {sortConfig.current.key === col.key &&
                      (sortConfig.current.direction === "ascending" ? (
                        <PiArrowUp className="w-4 h-4" />
                      ) : (
                        <PiArrowDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, rowIndex) => (
              <tr
                key={dataKeyExtractor(row)}
                className={
                  rowIndex % 2 === 0
                    ? "bg-gray-100 dark:bg-dark-200"
                    : "bg-white dark:bg-dark-300"
                }
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-4 py-2 border border-gray-300 text-xs md:text-sm"
                  >
                    {col.render
                      ? col.render((row as any)[col.key], row)
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        initialPageSize={initialPageSize}
        items={allItems}
        onPageChange={handlePageChange as any}
      />
    </div>
  );
};

export default Table;
