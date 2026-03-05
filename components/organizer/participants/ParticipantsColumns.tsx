import { ColumnDef } from "@tanstack/react-table";

export type Participant = {
  registrationId: string;
  category: string;
  bibNumber?: number;
  amount: number;
  participant?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    tshirtSize?: string;
  };
  payment?: {
    method?: string;
  };
};

export const columns: ColumnDef<Participant>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center w-10">
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-10">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    size: 40,
  },

  {
    accessorKey: "registrationId",
    header: "Registration",
    size: 180,
  },

  {
    id: "runner",
    header: "Runner",
    size: 220,
    cell: ({ row }) => {
      const p = row.original.participant;
      return (
        <div className="font-medium">
          {p?.firstName} {p?.lastName}
        </div>
      );
    },
  },

  {
    id: "phone",
    header: "Phone",
    size: 160,
    cell: ({ row }) => row.original.participant?.phone ?? "-",
  },

  {
    accessorKey: "category",
    header: "Category",
    size: 200,
  },

  {
    accessorKey: "bibNumber",
    header: "Bib",
    size: 90,
    cell: ({ getValue }) => getValue() ?? "-",
  },

  {
    id: "payment",
    header: "Payment",
    size: 140,
    cell: ({ row }) => {
      const method = row.original.payment?.method;

      if (!method) return "-";

      return (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            method === "ONLINE"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {method}
        </span>
      );
    },
  },

  {
    id: "tshirt",
    header: "T-Shirt",
    size: 100,
    cell: ({ row }) => row.original.participant?.tshirtSize ?? "-",
  },
];
