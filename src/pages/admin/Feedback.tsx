import { useEffect, useMemo, useState } from "react";
import { getAllReviews, approveReview, deleteReview, updateReview } from "@/services/mockApi";
import type { Review } from "@/data/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Star, Trash2 } from "lucide-react";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

export default function AdminFeedback() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const [preview, setPreview] = useState<Review | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<{ reviewId: number; rating: number; comment: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setReviews(await getAllReviews());
    } catch {
      toast.error("Failed to load feedback (mock)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const rows = useMemo(() => {
    if (tab === "pending") return reviews.filter((r) => !r.approved);
    return reviews.filter((r) => r.approved);
  }, [reviews, tab]);

  const columns = useMemo<ColumnDef<Review>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.userName} ${r.comment} ${r.rating} ${r.productId}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => <span className="font-bold text-slate-100">{row.original.userName}</span>,
      },
      {
        accessorKey: "productId",
        header: "Product",
        enableSorting: false,
        cell: ({ row }) => <span className="text-slate-300 font-mono">#{row.original.productId}</span>,
      },
      {
        accessorKey: "rating",
        header: "Rating",
        enableSorting: false,
        cell: ({ row }) => {
          const v = row.original.rating;
          return (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= v ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "comment",
        header: "Comment",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="text-left min-w-0"
            onClick={() => setPreview(row.original)}
            aria-label="Preview comment"
          >
            <div className="text-sm text-slate-200 line-clamp-2">{row.original.comment}</div>
          </button>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-2">
              {!r.approved ? (
                <ConfirmDeleteDialog
                  title="Approve review?"
                  description="This will mark the review as approved (mock)."
                  confirmText="Approve"
                  cancelText="Cancel"
                  onConfirm={async () => {
                    try {
                      await approveReview(r.id);
                      toast.success("Review approved");
                      await refresh();
                    } catch {
                      toast.error("Failed (mock)");
                    }
                  }}
                  trigger={
                    <Button size="sm" className="rounded-xl font-bold" type="button">
                      <CheckCircle2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                      Approve
                    </Button>
                  }
                />
              ) : null}

              <Button
                size="sm"
                variant="outline"
                className="rounded-xl font-bold border-slate-700"
                type="button"
                onClick={() => {
                  setEditDraft({ reviewId: r.id, rating: r.rating, comment: r.comment });
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>

              <ConfirmDeleteDialog
                title="Delete review?"
                description="This permanently removes the review (mock)."
                confirmText="Delete"
                trigger={
                  <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete review ${r.id}`}>
                    <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Delete
                  </Button>
                }
                onConfirm={async () => {
                  await deleteReview(r.id);
                  toast.error("Review deleted");
                  await refresh();
                }}
              />
            </div>
          );
        },
      },
    ];
  }, [refresh]);

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
        <h1 className="text-2xl font-black text-slate-50">Feedback & Comments Moderation</h1>
        <p className="text-sm text-slate-300">Approve or delete customer reviews before they appear publicly (mock).</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <Button
            variant={tab === "pending" ? "default" : "outline"}
            className={tab === "pending" ? "rounded-xl font-bold" : "rounded-xl font-bold border-slate-700 text-slate-200"}
            onClick={() => setTab("pending")}
          >
            Pending
          </Button>
          <Button
            variant={tab === "approved" ? "default" : "outline"}
            className={tab === "approved" ? "rounded-xl font-bold" : "rounded-xl font-bold border-slate-700 text-slate-200"}
            onClick={() => setTab("approved")}
          >
            Approved
          </Button>
        </div>

        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews…"
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

      <Dialog open={preview != null} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black">Review Preview</DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-300">
                <span className="font-bold text-slate-100">{preview.userName}</span> • Product #{preview.productId}
              </div>
              <div className="text-sm text-slate-200">{preview.comment}</div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          if (!o) setEditOpen(false);
        }}
      >
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black">Edit Review</DialogTitle>
          </DialogHeader>

          {editDraft ? (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Rating</p>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editDraft.rating}
                  onChange={(e) => setEditDraft((d) => (d ? { ...d, rating: Number(e.target.value) } : d))}
                  className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Comment</p>
                <Textarea
                  value={editDraft.comment}
                  onChange={(e) => setEditDraft((d) => (d ? { ...d, comment: e.target.value } : d))}
                  className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100 min-h-[120px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <ConfirmDeleteDialog
                  title="Save changes?"
                  description="This will update the review and set it back to pending (mock)."
                  confirmText="Save"
                  cancelText="Cancel"
                  onConfirm={async () => {
                    if (!editDraft) return;
                    try {
                      await updateReview({ reviewId: editDraft.reviewId, rating: editDraft.rating, comment: editDraft.comment });
                      toast.success("Review updated (mock)");
                      await refresh();
                      setEditOpen(false);
                    } catch {
                      toast.error("Failed to update (mock)");
                    }
                  }}
                  trigger={
                    <Button type="button" className="flex-1 rounded-xl font-bold">
                      Save
                    </Button>
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl font-bold border-slate-800 text-slate-200"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

