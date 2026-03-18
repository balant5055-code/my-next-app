interface Props {
  dataLength: number;
  pageSize: number;
  page: number;
  hasNext: boolean;
  loadingPage: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
  canGoPrev: boolean;
}
export default function ChipMappingPagination({
  dataLength,
  pageSize,
  page,
  hasNext,
  canGoPrev,
  loadingPage,
  onPrev,
  onNext,
  onPageSizeChange,
}: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl">
      <div className="text-sm text-slate-400">
        Showing <span className="text-white font-semibold">{dataLength}</span>{" "}
        records
      </div>

      <div className="flex items-center gap-4">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-slate-700 px-3 py-2 rounded-lg text-sm cursor-pointer"
        >
          {[15, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        {/* PREV */}
        <button
          disabled={!canGoPrev || loadingPage}
          onClick={onPrev}
          className={`
            p-2 rounded-lg transition-colors cursor-pointer
            ${
              !canGoPrev || loadingPage
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }
          `}
        >
          ‹
        </button>
<div className="text-sm text-slate-300 font-medium">
  Page {page}
</div>
        {/* NEXT */}
        <button
          disabled={!hasNext || loadingPage}
          onClick={onNext}
          className={`
            p-2 rounded-lg transition-colors cursor-pointer
            ${
              !hasNext || loadingPage
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }
          `}
        >
          ›
        </button>
      </div>
    </div>
  );
}
