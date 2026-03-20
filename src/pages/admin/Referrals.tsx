import { useEffect, useMemo, useState } from "react";
import { getRewardsData, setLeadRefunded, type RewardsData, type RewardsLead } from "@/services/mockApi";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { RefreshCcw, ShieldCheck, Trash2 } from "lucide-react";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

function daysSince(tsIso?: string) {
  if (!tsIso) return null;
  const days = (Date.now() - new Date(tsIso).getTime()) / MS_PER_DAY;
  return days;
}

export default function AdminReferrals() {
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"all" | "refunded">("all");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const fetch = async () => {
    setLoading(true);
    try {
      setData(await getRewardsData());
    } catch {
      toast.error("Failed to load referrals (mock)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetch();
  }, []);

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const rows = useMemo(() => {
    const leads = data?.leads ?? [];
    if (tab === "refunded") return leads.filter((l) => !!l.refunded || l.status === "Refunded");
    return leads;
  }, [data, tab]);

  const columns = useMemo<ColumnDef<RewardsLead & { daysSince?: number }>[]>(
    () => [
      {
        id: "search",
        accessorFn: (r) => `${r.referrerName ?? ""} ${r.referrerPhone ?? ""} ${r.name} ${r.phone} ${r.productCategory ?? ""} ${r.status}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        id: "referrer",
        header: "Referrer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-bold text-foreground truncate">{row.original.referrerName ?? "—"}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">{row.original.referrerPhone ?? "—"}</div>
          </div>
        ),
      },
      {
        id: "referee",
        header: "Referee",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-bold text-foreground truncate">{row.original.name}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">{row.original.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: "productCategory",
        header: "Category",
        cell: ({ row }) => <span className="text-foreground">{row.original.productCategory ?? "—"}</span>,
      },
      {
        id: "days",
        header: "Days Since Delivery",
        enableSorting: false,
        cell: ({ row }) => {
          const d = daysSince(row.original.deliveryDate);
          return <span className="text-foreground">{d == null ? "—" : `${Math.floor(d)}d`}</span>;
        },
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const lead = row.original;
          const d = daysSince(lead.deliveryDate);
          const refunded = !!lead.refunded || lead.status === "Refunded";

          let label = lead.status;
          let className = "bg-muted text-foreground border border-border";
          if (refunded) {
            label = "Refunded";
            className = "bg-destructive/10 text-destructive border border-destructive/20";
          } else if (!lead.deliveryDate) {
            label = "Clicked";
            className = "bg-muted text-foreground border border-border";
          } else if (d != null && d > 15) {
            label = "Successful";
            className = "bg-whatsapp/10 text-whatsapp border border-whatsapp/20";
          } else if (d != null) {
            const daysLeft = Math.max(0, 15 - Math.floor(d) + 1);
            label = `[Pending - ${daysLeft} Days Left]`;
            className = "bg-warning/10 text-warning border border-warning/20";
          }

          return <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap border ${className}`}>{label}</span>;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const lead = row.original;
          const refunded = !!lead.refunded || lead.status === "Refunded";

          return (
            <div className="flex items-center gap-2">
              {refunded ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl font-bold border-border"
                  onClick={async () => {
                    try {
                      await setLeadRefunded(lead.phone, false);
                      toast.success("Refund removed");
                      await fetch();
                    } catch {
                      toast.error("Failed (mock)");
                    }
                  }}
                >
                  Remove Refund
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl font-bold border-border"
                  onClick={async () => {
                    try {
                      await setLeadRefunded(lead.phone, true);
                      toast.error("Marked as refunded");
                      await fetch();
                    } catch {
                      toast.error("Failed (mock)");
                    }
                  }}
                >
                  Mark Refunded
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [fetch],
  );

  const table = useReactTable({
    data: rows,
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
        <h1 className="text-2xl font-black text-foreground">Referrals CRUD</h1>
        <p className="text-sm text-muted-foreground">Track referrer vs referee with the 15-day safe zone.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant={tab === "all" ? "default" : "outline"}
            className={tab === "all" ? "rounded-xl font-bold bg-primary" : "rounded-xl font-bold border-border text-foreground"}
            onClick={() => setTab("all")}
          >
            All Leads
          </Button>
          <Button
            variant={tab === "refunded" ? "default" : "outline"}
            className={tab === "refunded" ? "rounded-xl font-bold bg-primary" : "rounded-xl font-bold border-border text-foreground"}
            onClick={() => setTab("refunded")}
          >
            Refunded Members
          </Button>
        </div>

        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="rounded-xl bg-white border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-border rounded-2xl p-5 text-muted-foreground">Loading…</div>
      ) : (
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
      )}
    </div>
  );
}

