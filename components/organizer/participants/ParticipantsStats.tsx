import {
  UsersIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

type CategoryStats = {
  name: string;
  count: number;
};

type StatsProps = {
  total: number;
  online: number;
  offline: number;
  categories?: CategoryStats[];
};

export default function ParticipantsStats({
  total,
  online,
  offline,
  categories = [],
}: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* TOTAL RUNNERS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Runners
            </p>

            <p className="text-2xl font-semibold text-gray-900">{total}</p>
          </div>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Category Counts */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.name}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {c.name}: {c.count}
            </span>
          ))}
        </div>
      </div>

      {/* ONLINE PAYMENTS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Online Payments
            </p>

            <p className="text-2xl font-semibold text-green-600">{online}</p>
          </div>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
            <CreditCardIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* OFFLINE PAYMENTS */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Offline Payments
            </p>

            <p className="text-2xl font-semibold text-orange-500">{offline}</p>
          </div>

          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500">
            <BanknotesIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
