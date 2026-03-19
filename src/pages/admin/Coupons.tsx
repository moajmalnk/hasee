import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import DatePicker from "@/components/ui/date-picker";

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

type CouponRow = {
  id: string;
  code: string;
  expiryDate: string; // ISO
  usageLimit: number;
  usageCount: number;
  // Discount definition shown in Admin (UI). In this mock setup, cart logic
  // currently only supports some fixed coupon codes.
  discountType: "percentage" | "amount";
  discountValue: number;
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponRow[]>(() => [
    { id: "cp-1", code: "RAMZAN20", expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), usageLimit: 200, usageCount: 42, discountType: "percentage", discountValue: 20 },
    { id: "cp-2", code: "SAVE10", expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), usageLimit: 500, usageCount: 120, discountType: "percentage", discountValue: 10 },
    { id: "cp-3", code: "WELCOME50", expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), usageLimit: 100, usageCount: 18, discountType: "amount", discountValue: 50 },
  ]);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{
    id?: string;
    code: string;
    expiryDate: string;
    usageLimit: string;
    usageCount: string;
    discountType: "percentage" | "amount";
    discountValue: string;
  }>({
    code: "",
    expiryDate: "",
    usageLimit: "0",
    usageCount: "0",
    discountType: "percentage",
    discountValue: "0",
  });

  const openCreate = () => {
    setDraft({
      code: "",
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().slice(0, 10),
      usageLimit: "100",
      usageCount: "0",
      discountType: "percentage",
      discountValue: "10",
    });
    setOpen(true);
  };

  const openEdit = (c: CouponRow) => {
    setDraft({
      id: c.id,
      code: c.code,
      expiryDate: new Date(c.expiryDate).toISOString().slice(0, 10),
      usageLimit: String(c.usageLimit),
      usageCount: String(c.usageCount),
      discountType: c.discountType,
      discountValue: String(c.discountValue),
    });
    setOpen(true);
  };

  const save = () => {
    const code = draft.code.trim().toUpperCase();
    if (!code) return toast.error("Code is required");

    const expiry = new Date(draft.expiryDate).toISOString();
    const usageLimit = Number(draft.usageLimit);
    const usageCount = Number(draft.usageCount);
    const discountValue = Number(draft.discountValue);
    if (!Number.isFinite(usageLimit) || usageLimit < 0) return toast.error("Usage limit invalid");
    if (!Number.isFinite(usageCount) || usageCount < 0) return toast.error("Usage count invalid");
    if (!Number.isFinite(discountValue) || discountValue < 0) return toast.error("Discount value invalid");

    const next: CouponRow = {
      id: draft.id ?? `cp-${Date.now()}`,
      code,
      expiryDate: expiry,
      usageLimit,
      usageCount,
      discountType: draft.discountType,
      discountValue,
    };

    setCoupons((prev) => {
      const exists = prev.some((p) => p.id === next.id);
      if (exists) return prev.map((p) => (p.id === next.id ? next : p));
      return [next, ...prev];
    });
    toast.success(draft.id ? "Coupon updated" : "Coupon created");
    setOpen(false);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Coupon deleted");
  };

  const columns = useMemo<ColumnDef<CouponRow>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.code} ${r.usageLimit} ${r.usageCount}`,
        header: "",
        cell: () => null,
        enableHiding: true,
        enableSorting: false,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-black text-slate-100">{row.original.code}</span>,
      },
      {
        accessorKey: "expiryDate",
        header: "Expiry",
        cell: ({ row }) => (
          <span className="text-slate-300">{new Date(row.original.expiryDate).toLocaleDateString()}</span>
        ),
      },
      {
        accessorKey: "usageCount",
        header: "Usage",
        cell: ({ row }) => (
          <span className="text-slate-200 font-bold">
            {row.original.usageCount}/{row.original.usageLimit}
          </span>
        ),
      },
      {
        accessorKey: "discountValue",
        header: "Discount",
        cell: ({ row }) => {
          const { discountType, discountValue } = row.original;
          return (
            <span className="text-slate-200 font-bold">
              {discountType === "percentage" ? `${discountValue}%` : `₹${discountValue}`}
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
          return (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="rounded-xl font-bold border-slate-700" onClick={() => openEdit(c)}>
                <Edit2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Edit
              </Button>
              <ConfirmDeleteDialog
                title="Delete coupon?"
                description="This removes the coupon code (mock)."
                confirmText="Delete"
                trigger={
                  <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete coupon ${c.code}`}>
                    <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Delete
                  </Button>
                }
                onConfirm={() => Promise.resolve(deleteCoupon(c.id))}
              />
            </div>
          );
        },
      },
    ];
  }, [coupons]);

  const table = useReactTable({
    data: coupons,
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
          <h1 className="text-2xl font-black text-slate-50">Coupons CRUD</h1>
          <p className="text-sm text-slate-300">Create and manage discount codes (mock).</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons…"
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
        open={open}
        onOpenChange={(o) => {
          if (!o) setOpen(false);
        }}
      >
        <DialogContent className="rounded-2xl bg-slate-950 border-slate-800 text-slate-100 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-black">{draft.id ? "Edit coupon" : "Add coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Code</p>
              <Input value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-300">Expiry date</p>
              <DatePicker
                value={draft.expiryDate}
                onChange={(v) => setDraft((d) => ({ ...d, expiryDate: v }))}
                className="h-10 rounded-xl px-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Usage limit</p>
                <Input value={draft.usageLimit} onChange={(e) => setDraft((d) => ({ ...d, usageLimit: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Used count</p>
                <Input value={draft.usageCount} onChange={(e) => setDraft((d) => ({ ...d, usageCount: e.target.value }))} className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100" />
              </div>
            </div>

            {/* Discount definition */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-300">Discount type</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={draft.discountType === "percentage" ? "default" : "outline"}
                  className="rounded-xl font-bold flex-1"
                  onClick={() => setDraft((d) => ({ ...d, discountType: "percentage" }))}
                >
                  Percentage %
                </Button>
                <Button
                  type="button"
                  variant={draft.discountType === "amount" ? "default" : "outline"}
                  className="rounded-xl font-bold flex-1"
                  onClick={() => setDraft((d) => ({ ...d, discountType: "amount" }))}
                >
                  Payment ₹
                </Button>
              </div>
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-300">Discount value</p>
                <Input
                  value={draft.discountValue}
                  onChange={(e) => setDraft((d) => ({ ...d, discountValue: e.target.value }))}
                  className="rounded-xl bg-slate-900/40 border-slate-800 text-slate-100"
                  placeholder={draft.discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 rounded-xl font-bold" onClick={save}>
                Save
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl font-bold border-slate-800 text-slate-200" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

