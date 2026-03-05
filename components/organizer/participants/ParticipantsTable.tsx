"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";

import { useState } from "react";

import { columns, Participant } from "./ParticipantsColumns";
import ParticipantsToolbar from "./ParticipantsToolbar";
import ParticipantsPagination from "./ParticipantsPagination";
import ParticipantsBulkActions from "./ParticipantsBulkActions";

type Props = {
  data: Participant[];
  total: number;
  page: number;
  pages: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
};

export default function ParticipantsTable({
  data,
  total,
  page,
  pages,
  setPage,
  search,
  setSearch,
  category,
  setCategory,
}: Props) {
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-[650px]">
      {/* Toolbar */}
      <ParticipantsToolbar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {/* Bulk Actions */}
      <ParticipantsBulkActions selected={selectedRows} />

      {/* Table Scroll Area */}
      <div className="flex-1 overflow-hidden">
        {/* Horizontal scroll for mobile */}
        <div className="w-full overflow-x-auto">
          {/* Vertical scroll */}
          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-[1100px] w-full text-sm whitespace-nowrap">
              {/* HEADER */}
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer min-w-[140px]"
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

              {/* BODY */}
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-gray-700 min-w-[140px]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky Pagination */}
      <div className="border-t border-gray-200 bg-white">
        <ParticipantsPagination
          page={page}
          pages={pages}
          setPage={setPage}
          total={total}
        />
      </div>
    </div>
  );
}
