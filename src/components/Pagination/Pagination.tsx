import { memo, useEffect, useMemo, useState } from "react";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";

interface PaginatorProps<T> {
  readonly items: ReadonlyArray<T>;
  readonly initialPageSize?: number;
  readonly onPageChange: (currentItems: T[]) => void;
}

const Pagination = <T,>({
  items,
  initialPageSize = 10,
  onPageChange,
}: PaginatorProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const pageSizeOptions = useMemo(() => {
    const defaults = new Set([5, 10, 15, 25]);
    defaults.add(initialPageSize);
    return Array.from(defaults).sort((a, b) => b - a);
  }, [initialPageSize]);

  const totalPages = Math.ceil(items.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const startIndex = (newPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    onPageChange(items.slice(startIndex, endIndex));
  };

  const handlePageSizeChange = (event: any) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    handlePageChange(1);
  };

  useEffect(() => {
    handlePageChange(1);
  }, [items, pageSize]);

  const visiblePages = useMemo(() => {
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, startPage + 2);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
      {items.length > pageSize && (
        <div className="flex flex-col items-center gap-y-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:pointer-events-none"
            >
              <PiArrowLeft aria-hidden="true" className="w-5 h-5" />
              <span className="sr-only">Previous</span>
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn ${
                  page === currentPage ? "btn-primary" : "btn-secondary"
                }`}
              >
                {page}
              </button>
            ))}

            {totalPages > visiblePages[visiblePages.length - 1] && (
              <span className="text-sm text-gray-500">...</span>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:pointer-events-none"
            >
              <PiArrowRight aria-hidden="true" className="w-5 h-5" />
              <span className="sr-only">Next</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-y-2 px-4">
            <p className="text-sm text-neutral-900 dark:text-neutral-50">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, items.length)}
              </span>{" "}
              of <span className="font-medium">{items.length}</span> results
            </p>

            <div className="flex items-center gap-x-2">
              <label
                htmlFor="page-size"
                className="text-sm text-neutral-900 dark:text-neutral-50"
              >
                Items per page:
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border dark:border-neutral-300 rounded-md px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-50 dark:bg-dark-50 focus:ring-2 focus:ring-primary-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Pagination);
