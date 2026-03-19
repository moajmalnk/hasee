import { useEffect, useMemo, useState } from "react";
import type { MockOrder } from "@/services/mockApi";
import { approveOrder, getOrders, rejectOrder } from "@/services/mockApi";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminOrder = MockOrder & {
  gpayScreenshotUrl?: string;
  gpayStatus?: "Pending" | "Paid" | "Rejected";
};

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        if (cancelled) return;
        setOrders(data as AdminOrder[]);
      } catch {
        toast.error("Failed to load admin orders (mock)");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Queue only: pending gpay verifications.
  const queue = useMemo(() => {
    return orders.filter((o) => {
      if (o.gpayStatus != null) return o.gpayStatus === "Pending";
      return o.status === "Pending";
    });
  }, [orders]);

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const columns = useMemo<ColumnDef<AdminOrder>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "Receipt",
        cell: ({ row }) => <span className="font-mono text-slate-100">{row.original.id}</span>,
      },
      {
        id: "search",
        accessorFn: (r) => `${r.id} ${r.customer} ${r.productName} ${r.amount}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorFn: (r) => r.customer,
        id: "customer",
        header: "Customer",
        cell: ({ row }) => <span className="font-bold text-slate-100">{row.original.customer}</span>,
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => <span className="font-bold text-slate-100">{row.original.productName}</span>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="font-bold text-slate-100">₹{row.original.amount}</span>,
      },
      {
        id: "paymentStatus",
        header: "GPay Status",
        enableSorting: false,
        cell: ({ row }) => {
          const status = (row.original.gpayStatus ?? (row.original.status === "Approved" ? "Paid" : "Pending")) as
            | "Pending"
            | "Paid"
            | "Rejected";
          const className =
            status === "Paid"
              ? "bg-whatsapp/10 text-whatsapp border border-whatsapp/20"
              : status === "Rejected"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-warning/10 text-warning border border-warning/20";
          return <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ${className}`}>{status}</span>;
        },
      },
      {
        id: "screenshot",
        header: "GPay Screenshot",
        enableSorting: false,
        cell: ({ row }) => {
          const url = row.original.gpayScreenshotUrl ?? "https://placehold.co/160x100/0ea5e9/ffffff?text=GPay";
          return (
            <img
              src={url}
              alt="GPay screenshot"
              className="h-14 w-20 rounded-lg object-cover bg-slate-800"
            />
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const order = row.original;
          const isPaid = order.gpayStatus === "Paid" || order.status === "Approved";
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="rounded-xl font-bold"
                onClick={async () => {
                  try {
                    await approveOrder(order.id);
                    toast.success(`GPay verified for ${order.id} (mock)`);
                    setOrders(await getOrders());
                  } catch {
                    toast.error("Failed to approve (mock)");
                  }
                }}
                disabled={isPaid}
              >
                Approve GPay
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl font-bold border-slate-700"
                onClick={async () => {
                  try {
                    await rejectOrder(order.id);
                    toast.error(`GPay rejected for ${order.id}`);
                    setOrders(await getOrders());
                  } catch {
                    toast.error("Failed to reject (mock)");
                  }
                }}
                disabled={order.status === "Rejected" || order.gpayStatus === "Rejected"}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: queue,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-50">GPay Verification Queue</h1>
          <p className="text-sm text-slate-300">Approve screenshots to mark orders as verified (mock flow).</p>
        </div>
        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt, customer, product…"
            className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-slate-300">Loading…</div>
      ) : queue.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-slate-300">
          No pending GPay screenshots.
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-slate-300 bg-slate-900/40 border-slate-800"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-slate-800">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-slate-200 border-slate-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

