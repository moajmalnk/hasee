import { Bell, Search, Sparkles, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminTopBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const liveSalesCount = useMemo(() => 5, []);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 h-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black">H</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black text-slate-100">Hasee Admin</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Pink & Slate</p>
            </div>
          </div>

          <div className="relative hidden lg:block w-[420px]">
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search (mock)…"
              className="h-10 pl-9 bg-slate-900/60 border-slate-800/70 rounded-full text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10 rounded-full hover:bg-slate-900/60"
            onClick={() => toast.info("Live Sales (mock)")}
            aria-label="Live sales notifications"
          >
            <Bell className="w-5 h-5 text-slate-200" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center border border-slate-900/40">
              {liveSalesCount}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-full border-slate-800/70 bg-slate-900/30 hover:bg-slate-900/50"
              >
                <UserCircle2 className="w-5 h-5 text-slate-200" strokeWidth={1.5} />
                <span className="ml-2 hidden sm:inline text-sm font-bold text-slate-100">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl w-56">
              <div className="px-2 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate">Hasee Admin</p>
                    <p className="text-xs text-muted-foreground truncate">admin@hasee.com</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Profile (mock)")}>Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

