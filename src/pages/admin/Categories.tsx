import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Edit2, Plus, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

type CategoryRow = { name: string };

export default function AdminCategories() {
  const seeded = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort((a, b) => a.localeCompare(b));
  }, []);

  const [categories, setCategories] = useState<CategoryRow[]>(() => seeded.map((name) => ({ name })));

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<{ oldName?: string; name: string }>({ name: "" });

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const openCreate = () => {
    setDraft({ name: "" });
    setCreateOpen(true);
  };

  const openEdit = (cat: CategoryRow) => {
    setDraft({ oldName: cat.name, name: cat.name });
    setEditOpen(true);
  };

  const save = () => {
    const nextName = draft.name.trim();
    if (!nextName) return toast.error("Category name is required");

    const oldName = draft.oldName;
    if (oldName) {
      setCategories((prev) => prev.map((c) => (c.name === oldName ? { name: nextName } : c)));
      toast.success("Category updated");
      setEditOpen(false);
    } else {
      setCategories((prev) => {
        if (prev.some((c) => c.name.toLowerCase() === nextName.toLowerCase())) return prev;
        return [{ name: nextName }, ...prev];
      });
      toast.success("Category added");
      setCreateOpen(false);
    }
  };

  const deleteCategory = async (name: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== name));
    toast.success("Category deleted");
  };

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: "search",
        accessorFn: (r) => r.name,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      { accessorKey: "name", header: "Category", cell: ({ row }) => <span className="font-bold text-slate-100">{row.original.name}</span> },
      {
        id: "count",
        header: "Products",
        enableSorting: false,
        cell: ({ row }) => {
          const count = products.filter((p) => p.category === row.original.name).length;
          return <span className="text-slate-300">{count}</span>;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl font-bold border-slate-700" onClick={() => openEdit(cat)}>
                <Edit2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Edit
              </Button>
              <ConfirmDeleteDialog
                title="Delete category?"
                description="This removes the category from admin list (mock)."
                trigger={
                  <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete ${cat.name}`}>
                    <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Delete
                  </Button>
                }
                confirmText="Delete"
                onConfirm={() => deleteCategory(cat.name)}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const table = useReactTable({
    data: categories,
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
          <h1 className="text-2xl font-black text-slate-50">Categories CRUD</h1>
          <p className="text-sm text-slate-300">Manage product categories (mock).</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <Button className="rounded-xl font-bold" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Add
          </Button>
        </div>
      </div>

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

      <Dialog
        open={createOpen || editOpen}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditOpen(false);
          }
        }}
      >
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black">{draft.oldName ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Category name</p>
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl font-bold" onClick={save}>
                Save
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl font-bold border-slate-800 text-slate-200" onClick={() => { setCreateOpen(false); setEditOpen(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

