import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { products as catalogProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Edit2, Plus, Trash2, Video } from "lucide-react";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

type AdminProductDraft = {
  id?: number;
  name: string;
  category: string;
  price: string;
  videoUrl: string;
  imageUrlsText: string; // newline/comma separated
  colorsText: string; // comma separated
};

async function readFilesAsDataUrls(files: FileList | null): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const arr = Array.from(files);
  return Promise.all(
    arr.map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = () => reject(new Error(`Failed to read ${f.name}`));
          r.readAsDataURL(f);
        }),
    ),
  );
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>(() => catalogProducts.map((p) => ({ ...p, image: p.image, imageArray: [...p.imageArray] })));

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((p) => p.category))).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<AdminProductDraft>({
    name: "",
    category: "Rayon",
    price: "0",
    videoUrl: "",
    imageUrlsText: "",
    colorsText: "",
  });
  const [draftImages, setDraftImages] = useState<string[]>([]);

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const openCreate = () => {
    setDraft({
      name: "",
      category: categories[0] ?? "Rayon",
      price: "0",
      videoUrl: "",
      imageUrlsText: "",
      colorsText: "",
    });
    setDraftImages([]);
    setCreateOpen(true);
  };

  const openEdit = (p: Product) => {
    setDraft({
      id: p.id,
      name: p.name,
      category: p.category,
      price: String(p.price),
      videoUrl: p.videoUrl ?? "",
      imageUrlsText: "",
      colorsText: p.availableColors.join(", "),
    });
    setDraftImages([...p.imageArray]);
    setEditOpen(true);
  };

  const parseImages = (text: string) => {
    return text
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseColors = (text: string) => {
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const saveDraft = async () => {
    const name = draft.name.trim();
    if (!name) return toast.error("Product name is required");

    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) return toast.error("Valid price is required");

    const imageUrlsFromText = parseImages(draft.imageUrlsText);
    const imageArray = draftImages.length > 0 ? draftImages : imageUrlsFromText;
    if (imageArray.length === 0) return toast.error("Add at least 1 product image (URLs or upload)");

    const colors = parseColors(draft.colorsText);
    if (colors.length === 0) return toast.error("Add at least 1 available color");

    const videoUrl = draft.videoUrl.trim() ? draft.videoUrl.trim() : undefined;
    const category = draft.category.trim() || name;

    setLoading(true);
    try {
      if (draft.id != null) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === draft.id
              ? {
                  ...p,
                  name,
                  category,
                  price,
                  imageArray,
                  image: imageArray[0],
                  videoUrl,
                  availableColors: colors,
                }
              : p,
          ),
        );
        toast.success("Product updated");
      } else {
        const nextId = Math.max(...items.map((p) => p.id)) + 1;
        const newProduct: Product = {
          id: nextId,
          name,
          category,
          price,
          imageArray,
          image: imageArray[0],
          videoUrl,
          availableColors: colors,
        };
        setItems((prev) => [newProduct, ...prev]);
        toast.success("Product created");
      }

      setCreateOpen(false);
      setEditOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  const columns = useMemo<ColumnDef<Product>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.name} ${r.category} ${r.price}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.imageArray?.[0] ?? row.original.image}
              alt={row.original.name}
              className="w-10 h-12 rounded-lg object-cover bg-secondary"
            />
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
        accessorKey: "imageArray",
        header: "Media",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-slate-200">
            <span className="text-sm">{row.original.imageArray.length} images</span>
            {row.original.videoUrl ? <Video className="w-4 h-4 text-slate-200" /> : null}
          </div>
        ),
      },
      {
        accessorKey: "availableColors",
        header: "Colors",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.availableColors.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] px-2 py-1 rounded-full font-bold bg-primary/10 text-primary">
                {c}
              </span>
            ))}
            {row.original.availableColors.length > 3 ? (
              <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-secondary text-slate-300">
                +{row.original.availableColors.length - 3}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl font-bold border-slate-700" onClick={() => openEdit(p)}>
                <Edit2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Edit
              </Button>
              <ConfirmDeleteDialog
                title="Delete product?"
                description="This removes the product from the admin catalog (mock)."
                confirmText="Delete"
                trigger={
                  <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete ${p.name}`}>
                    <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Delete
                  </Button>
                }
                onConfirm={() => deleteProduct(p.id)}
              />
            </div>
          );
        },
      },
    ];
  }, [items]); // items used for derived row props; ok for mock.

  const table = useReactTable({
    data: items,
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
          <h1 className="text-2xl font-black text-slate-50">Products CRUD</h1>
          <p className="text-sm text-slate-300">Manage products, media, and pricing (mock).</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
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

      {/* Create / Edit Dialog */}
      <Dialog open={createOpen || editOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditOpen(false); } }}>
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">{draft.id != null ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Name</p>
                <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Category</p>
                <Input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Price (INR)</p>
                <Input value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Video link (optional)</p>
                <Input value={draft.videoUrl} onChange={(e) => setDraft((d) => ({ ...d, videoUrl: e.target.value }))} placeholder="https://..." className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Upload multiple images (optional)</p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const dataUrls = await readFilesAsDataUrls(e.target.files);
                  setDraftImages(dataUrls);
                }}
                className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100"
              />
              <p className="text-xs text-slate-400">If no upload, paste image URLs below (comma/newline separated).</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Image URLs (comma/newline separated)</p>
              <Textarea
                value={draft.imageUrlsText}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrlsText: e.target.value }))}
                placeholder="https://... , https://... "
                rows={3}
                className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Available Colors (comma separated)</p>
              <Input value={draft.colorsText} onChange={(e) => setDraft((d) => ({ ...d, colorsText: e.target.value }))} placeholder="Red, Blue, Black" className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
            </div>

            {draftImages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draftImages.slice(0, 6).map((src, i) => (
                  <img key={`${src}:${i}`} src={src} alt="preview" className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                ))}
              </div>
            ) : null}

            <div className="flex gap-2 pt-1">
              <Button className="flex-1 rounded-xl font-bold" onClick={() => void saveDraft()} disabled={loading}>
                {loading ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold border-slate-800 text-slate-200"
                onClick={() => {
                  setCreateOpen(false);
                  setEditOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

