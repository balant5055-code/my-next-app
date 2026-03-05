import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
};

export default function ParticipantsToolbar({
  search,
  setSearch,
  category,
  setCategory,
}: Props) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-white/90 border-b border-gray-200">
      <div className="px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Search Box */}
        <div className="relative w-full md:w-[420px]">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search runner, phone, or registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition shadow-sm"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <FunnelIcon className="w-4 h-4" />
            Filter
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          >
            <option value="">All Categories</option>
            <option value="3KM Kids Run">3KM Kids Run</option>
            <option value="5KM Fit Run">5KM Fit Run</option>
            <option value="10KM Pro Run">10KM Pro Run</option>
            <option value="21KM Half Marathon">21KM Half Marathon</option>
          </select>
        </div>
      </div>

      {/* Bottom Accent */}
    </div>
  );
}
