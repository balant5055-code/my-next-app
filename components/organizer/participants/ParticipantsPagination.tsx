export default function ParticipantsPagination({
  page,
  pages,
  setPage,
  total,
}: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
      <p className="text-xs text-gray-500">{total} participants</p>

      <div className="flex gap-1">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          Prev
        </button>

        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1;

          return (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                p === page
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
