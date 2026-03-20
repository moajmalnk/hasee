import { useEffect, useMemo, useState } from "react";
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
import { Edit2, Phone, Trash2, Users } from "lucide-react";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminCustomer = {
  id: string;
  name: string;
  whatsappNumber: string;
  phoneNumber?: string;
  location: string;
  favoriteColors: string[];
};

function includesTextFilterFn(row: any, columnId: string, filterValue: string) {
  const v = row.getValue(columnId);
  return String(v ?? "").toLowerCase().includes(filterValue.toLowerCase());
}

function whatsappUrl(whatsappNumber: string, text?: string) {
  const sanitized = whatsappNumber.replace(/\D/g, "");
  const msg = text ? `&text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${sanitized}?${msg.startsWith("&") ? msg.slice(1) : ""}`;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>(() => [
    {
      id: "c-1",
      name: "Aisha K.",
      whatsappNumber: "9947428821",
      phoneNumber: "9947428821",
      location: "Kochi, Kerala",
      favoriteColors: ["Red", "Blue"],
    },
    {
      id: "c-2",
      name: "Priya M.",
      whatsappNumber: "9876501234",
      phoneNumber: "9876501234",
      location: "Ernakulam, Kerala",
      favoriteColors: ["Purple", "Gold"],
    },
    {
      id: "c-3",
      name: "Fatima R.",
      whatsappNumber: "9123456789",
      phoneNumber: "9123456789",
      location: "Kozhikode, Kerala",
      favoriteColors: ["Pink"],
    },
    {
      id: "c-4",
      name: "Noor S.",
      whatsappNumber: "7744123450",
      phoneNumber: "7744123450",
      location: "Trivandrum, Kerala",
      favoriteColors: ["Green"],
    },
    {
      id: "c-5",
      name: "Meena T.",
      whatsappNumber: "9876543210",
      phoneNumber: "9876543210",
      location: "Kannur, Kerala",
      favoriteColors: ["Black", "White"],
    },
  ]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({ search: false });

  useEffect(() => {
    const next = search.trim();
    setColumnFilters(next ? [{ id: "search", value: next }] : []);
  }, [search]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<AdminCustomer>({
    id: "",
    name: "",
    whatsappNumber: "",
    phoneNumber: "",
    location: "",
    favoriteColors: [],
  });

  const openCreate = () => {
    setDraft({
      id: `c-${Date.now()}`,
      name: "",
      whatsappNumber: "",
      phoneNumber: "",
      location: "",
      favoriteColors: [],
    });
    setCreateOpen(true);
  };

  const openEdit = (c: AdminCustomer) => {
    setDraft({ ...c });
    setEditOpen(true);
  };

  const save = () => {
    if (!draft.name.trim()) return toast.error("Name is required");
    if (!draft.whatsappNumber.trim()) return toast.error("WhatsApp number is required");
    if (!draft.location.trim()) return toast.error("Location is required");
    if (draft.favoriteColors.length === 0) return toast.error("Pick at least one favorite color");

    setCustomers((prev) => {
      const exists = prev.some((p) => p.id === draft.id);
      if (exists) return prev.map((p) => (p.id === draft.id ? draft : p));
      return [draft, ...prev];
    });
    toast.success("Customer saved");
    setCreateOpen(false);
    setEditOpen(false);
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success("Customer deleted");
  };

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(() => {
    return [
      {
        id: "search",
        accessorFn: (r) => `${r.name} ${r.whatsappNumber} ${r.phoneNumber ?? ""} ${r.location} ${r.favoriteColors.join(" ")}`,
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: true,
        filterFn: includesTextFilterFn,
      },
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="font-bold text-foreground truncate">{row.original.name}</div>
            <div className="text-xs text-muted-foreground truncate">#{row.original.id}</div>
          </div>
        ),
      },
      {
        id: "phone",
        header: "WhatsApp",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-foreground text-sm">{row.original.whatsappNumber}</span>
            <a
              href={whatsappUrl(row.original.whatsappNumber, "Hi! I need help with Hasee Maxi.")}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp chat with ${row.original.name}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-whatsapp/10 text-whatsapp border border-whatsapp/20 hover:bg-whatsapp/15"
            >
              <Phone className="w-4 h-4" strokeWidth={1.5} />
            </a>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => <span className="text-foreground">{row.original.location}</span>,
      },
      {
        accessorKey: "favoriteColors",
        header: "Favorite Colors",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.favoriteColors.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] px-2 py-1 rounded-full font-bold bg-primary/10 text-primary">
                {c}
              </span>
            ))}
            {row.original.favoriteColors.length > 3 ? (
              <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-secondary text-muted-foreground">
                +{row.original.favoriteColors.length - 3}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-xl font-bold border-border" onClick={() => openEdit(row.original)}>
              <Edit2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
              Edit
            </Button>
            <ConfirmDeleteDialog
              title="Delete customer?"
              description="This removes the customer from admin list (mock)."
              confirmText="Delete"
              trigger={
                <Button size="sm" variant="destructive" className="rounded-xl font-bold" aria-label={`Delete ${row.original.name}`}>
                  <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                  Delete
                </Button>
              }
              onConfirm={() => deleteCustomer(row.original.id)}
            />
          </div>
        ),
      },
    ];
  }, [customers]);

  const table = useReactTable({
    data: customers,
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
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" strokeWidth={1.5} />
            Customers & Members
          </h1>
          <p className="text-sm text-muted-foreground">Manage contact details and favorite colors (mock).</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-full md:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="rounded-xl bg-white border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button className="rounded-xl font-bold" onClick={openCreate}>
            Add
          </Button>
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

      <Dialog
        open={createOpen || editOpen}
        onOpenChange={(o) => {
          if (!o) {
            setCreateOpen(false);
            setEditOpen(false);
          }
        }}
      >
        <DialogContent className="rounded-2xl bg-white border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">{draft.id ? "Edit customer" : "Add customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">Name</p>
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="rounded-xl bg-white border-border text-foreground" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground">WhatsApp number</p>
                <Input value={draft.whatsappNumber} onChange={(e) => setDraft((d) => ({ ...d, whatsappNumber: e.target.value }))} className="rounded-xl bg-white border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground">Location</p>
                <Input value={draft.location} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} className="rounded-xl bg-white border-border text-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground">Favorite colors (comma separated)</p>
              <Input
                value={draft.favoriteColors.join(", ")}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    favoriteColors: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="rounded-xl bg-white border-border text-foreground"
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl font-bold" onClick={save}>
                Save
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold border-border text-foreground"
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

