import { useEffect, useMemo, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Gift, Truck } from "lucide-react";

type ClaimRow = {
  id: string;
  userName: string;
  referrerPhone: string;
  paidReferrals: number;
  status: "Ready" | "Dispatched";
  dispatchedAt?: string;
};

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

export default function AdminRewards() {
  const [claims, setClaims] = useState<ClaimRow[]>(() => [
    { id: "cl-1", userName: "Rahul K.", referrerPhone: "6000000001", paidReferrals: 10, status: "Ready" },
    { id: "cl-2", userName: "Meera S.", referrerPhone: "6000000002", paidReferrals: 11, status: "Ready" },
    { id: "cl-3", userName: "Sana M.", referrerPhone: "6000000003", paidReferrals: 12, status: "Ready" },
  ]);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const readyCount = useMemo(() => claims.filter((c) => c.status === "Ready").length, [claims]);
  const dispatchedCount = useMemo(() => claims.filter((c) => c.status === "Dispatched").length, [claims]);

  const columns = useMemo<ColumnDef<ClaimRow>[]>(
    () => [
      {
        id: "search",
        accessorFn: (r) => `${r.userName} ${r.referrerPhone} ${r.status}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => <span className="font-bold text-foreground">{row.original.userName}</span>,
      },
      {
        accessorKey: "referrerPhone",
        header: "Phone",
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.referrerPhone}</span>,
      },
      {
        accessorKey: "paidReferrals",
        header: "Paid Refs",
        cell: ({ row }) => <span className="font-black text-foreground">{row.original.paidReferrals}</span>,
      },
      {
        id: "status",
        header: "Reward",
        enableSorting: false,
        cell: ({ row }) => {
          const s = row.original.status;
          const className =
            s === "Ready"
              ? "bg-warning/10 text-warning border border-warning/20"
              : "bg-whatsapp/10 text-whatsapp border border-whatsapp/20";
          return (
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap border ${className}`}>
              {s}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          const disabled = c.status !== "Ready";
          return (
            <Button
              size="sm"
              className="rounded-xl font-bold"
              disabled={disabled}
              onClick={() => {
                setClaims((prev) =>
                  prev.map((x) =>
                    x.id === c.id
                      ? { ...x, status: "Dispatched", dispatchedAt: new Date().toISOString() }
                      : x,
                  ),
                );
                toast.success("Reward dispatched");
              }}
            >
              <Truck className="w-4 h-4 mr-1" strokeWidth={1.5} />
              Dispatch
            </Button>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: claims,
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
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Gift className="w-6 h-6" strokeWidth={1.5} />
          Rewards CRUD
        </h1>
        <p className="text-sm text-muted-foreground">Manage Free Maxi claims and dispatch workflow (mock).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-2xl bg-white border-border p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Pending Rewards</p>
          <p className="text-xl font-black text-foreground mt-1">{readyCount}</p>
        </Card>
        <Card className="rounded-2xl bg-white border-border p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Dispatched</p>
          <p className="text-xl font-black text-foreground mt-1">{dispatchedCount}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claims…"
            className="rounded-xl bg-white border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground bg-muted/40 border-border">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-border">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-foreground border-border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

