import { useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/data/products";
import { getProductLikeCounts, resetProductLikes } from "@/services/mockApi";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Edit2, Heart, Trash2 } from "lucide-react";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

type WishlistRow = Product & { likeCount: number; rank: number };

export default function AdminWishlist() {
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([{ id: "likeCount", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const fetchLikes = async () => {
    try {
      setLoading(true);
      const counts = await getProductLikeCounts();
      setLikeCounts(counts);
    } catch {
      toast.error("Failed to load like counts (mock)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLikes();
  }, []);

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const rows = useMemo(() => {
    const list: WishlistRow[] = products.map((p) => ({
      ...p,
      likeCount: likeCounts[p.id] ?? 0,
      rank: 0,
    }));
    list.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    return list.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [likeCounts]);

  const columns = useMemo<ColumnDef<WishlistRow>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.name} ${r.category}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "rank",
        header: "#",
        cell: ({ row }) => <span className="font-black text-slate-100">{row.original.rank}</span>,
      },
      {
        id: "product",
        header: "Product",
        enableSorting: true,
        accessorFn: (r) => r.name,
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-0">
            <img src={row.original.imageArray?.[0] ?? row.original.image} alt={row.original.name} className="w-12 h-16 rounded-lg object-cover bg-secondary" />
            <div className="min-w-0">
              <div className="font-bold text-slate-100 truncate">{row.original.name}</div>
              <div className="text-xs text-slate-300">{row.original.category}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => <span className="font-bold text-slate-100">₹{row.original.price}</span>,
      },
      {
        accessorKey: "likeCount",
        header: "Likes",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-black text-slate-100">
            <Heart className="w-4 h-4 fill-primary text-primary" strokeWidth={1.5} />
            {row.original.likeCount}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <ConfirmDeleteDialog
            title="Reset like count?"
            description="This will clear like count for this product (mock)."
            confirmText="Reset"
            trigger={
              <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Reset likes for ${row.original.name}`}>
                <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Reset
              </Button>
            }
            onConfirm={async () => {
              await resetProductLikes(row.original.id);
              toast.success("Likes reset");
              await fetchLikes();
            }}
          />
        ),
      },
    ];
  }, [likeCounts]);

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
        <h1 className="text-2xl font-black text-slate-50">Wishlist & Likes</h1>
        <p className="text-sm text-slate-300">Most liked products and like reset actions (mock).</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-slate-300">Loading…</div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-300 bg-slate-900/40 border-slate-800">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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

