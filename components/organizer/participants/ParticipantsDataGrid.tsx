"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  PhoneIcon,
  IdentificationIcon,
  TagIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { columns, Participant } from "./ParticipantsColumns";
import ParticipantsBulkActions from "./ParticipantsBulkActions";

export default function ParticipantsDataGrid({
  data,
}: {
  data: Participant[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm">
      <ParticipantsBulkActions selected={selectedRows} />

      {/* MOBILE VIEW */}
      {/* MOBILE VIEW */}
      <div className="block md:hidden">
        <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1">
          {table.getRowModel().rows.map((row) => {
            const p = row.original;

            return (
              <div
                key={p.registrationId}
                className="relative flex gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition"
              >
                {/* Red Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />

                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="accent-red-500"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  {/* Name + Category */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {p.participant?.firstName} {p.participant?.lastName}
                    </h3>

                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      {p.category}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="text-xs text-gray-500 mt-1">
                    📞 {p.participant?.phone ?? "-"}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                    <div>
                      Reg:{" "}
                      <span className="font-medium">{p.registrationId}</span>
                    </div>

                    <div className="text-right">
                      Bib:{" "}
                      <span className="font-medium">{p.bibNumber ?? "-"}</span>
                    </div>

                    <div>T-shirt: {p.participant?.tshirtSize ?? "-"}</div>

                    <div className="flex justify-end">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                          p.payment?.method === "ONLINE"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.payment?.method ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      {{
                        asc: "▲",
                        desc: "▼",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          No participants found
        </div>
      )}
    </div>
  );
}
