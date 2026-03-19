import { useEffect, useMemo, useState } from "react";
import {
  getCommunityModerationPosts,
  approveCommunityPost,
  deleteCommunityPost,
  setCommunityFeatured,
  revertCommunityPost,
} from "@/services/mockApi";
import type { CommunityPostView } from "@/services/mockApi";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Image as ImageIcon, Star, Trash2 } from "lucide-react";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

type CommunityRow = CommunityPostView;

export default function AdminCommunity() {
  const [posts, setPosts] = useState<CommunityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{ src: string; caption: string } | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      setPosts(await getCommunityModerationPosts());
    } catch {
      toast.error("Failed to load community posts (mock)");
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

  const columns = useMemo<ColumnDef<CommunityRow>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.userName} ${r.productName} ${r.caption} ${r.date}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "userName",
        header: "Customer",
        cell: ({ row }) => <span className="font-bold text-slate-100">{row.original.userName}</span>,
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => <span className="text-slate-200">{row.original.productName}</span>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <span className="text-slate-300">{row.original.date}</span>,
      },
      {
        accessorKey: "likes",
        header: "Likes",
        enableSorting: false,
        cell: ({ row }) => <span className="text-slate-200 font-bold">{row.original.likes}</span>,
      },
      {
        id: "approved",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const approved = row.original.approved !== false;
          const featured = !!row.original.featured;
          const className = approved
            ? featured
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-whatsapp/10 text-whatsapp border border-whatsapp/20"
            : "bg-warning/10 text-warning border border-warning/20";
          return (
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap border ${className}`}>
              {approved ? (featured ? "Featured" : "Approved") : "Pending"}
            </span>
          );
        },
      },
      {
        id: "media",
        header: "Photo",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            onClick={() => {
              setPreview({ src: row.original.image, caption: row.original.caption });
              setPreviewOpen(true);
            }}
            className="rounded-lg overflow-hidden bg-slate-800"
            aria-label="Preview customer photo"
          >
            <img src={row.original.image} alt={row.original.caption} className="w-16 h-16 object-cover" />
          </button>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const post = row.original;
          const approved = post.approved !== false;
          const featured = !!post.featured;

          return (
            <div className="flex items-center gap-2">
              <ConfirmDeleteDialog
                title="Approve photo?"
                description="This will approve the customer photo (mock)."
                confirmText="Approve"
                cancelText="Cancel"
                onConfirm={async () => {
                  try {
                    await approveCommunityPost(post.id, featured);
                    toast.success("Post approved");
                    await fetch();
                  } catch {
                    toast.error("Failed (mock)");
                  }
                }}
                trigger={
                  <Button
                    size="sm"
                    className="rounded-xl font-bold"
                    disabled={approved}
                    type="button"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Approve
                  </Button>
                }
              />

              <ConfirmDeleteDialog
                title={featured ? "Unfeature photo?" : "Feature photo?"}
                description={featured ? "This removes the post from homepage (mock)." : "This marks the post as featured on homepage (mock)."}
                confirmText={featured ? "Unfeature" : "Feature"}
                cancelText="Cancel"
                onConfirm={async () => {
                  try {
                    if (featured) {
                      await setCommunityFeatured(post.id, false);
                    } else {
                      await approveCommunityPost(post.id, true);
                    }
                    toast.success(featured ? "Unfeatured" : "Featured on homepage");
                    await fetch();
                  } catch {
                    toast.error("Failed (mock)");
                  }
                }}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl font-bold border-slate-700"
                    type="button"
                  >
                    <Star className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    {featured ? "Unfeature" : "Feature"}
                  </Button>
                }
              />

              {approved ? (
                <ConfirmDeleteDialog
                  title="Revert to pending?"
                  description="This will move the post back to pending (mock) and remove featured status."
                  confirmText="Revert"
                  cancelText="Cancel"
                  onConfirm={async () => {
                    try {
                      await revertCommunityPost(post.id);
                      toast.success("Reverted to pending");
                      await fetch();
                    } catch {
                      toast.error("Failed (mock)");
                    }
                  }}
                  trigger={
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl font-bold border-slate-700"
                      type="button"
                    >
                      Revert
                    </Button>
                  }
                />
              ) : null}

              <ConfirmDeleteDialog
                title="Delete photo?"
                description="This removes the customer style photo from both admin and public site (mock)."
                confirmText="Delete"
                trigger={
                  <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete post ${post.id}`}>
                    <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Delete
                  </Button>
                }
                onConfirm={async () => {
                  await deleteCommunityPost(post.id);
                  toast.error("Photo deleted");
                  await fetch();
                }}
              />
            </div>
          );
        },
      },
    ];
  }, [posts]);

  const table = useReactTable({
    data: posts,
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
        <h1 className="text-2xl font-black text-slate-50">Community Moderation</h1>
        <p className="text-sm text-slate-300">Approve or delete customer style photos before they appear on the public site.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-300">
          Pending: <span className="font-bold text-slate-100">{posts.filter((p) => p.approved === false).length}</span>
        </div>
        <div className="w-full md:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black flex items-center gap-2">
              <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              Photo Preview
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="space-y-3">
              <img src={preview.src} alt={preview.caption} className="w-full rounded-2xl bg-slate-900" />
              <p className="text-sm text-slate-300">{preview.caption}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

