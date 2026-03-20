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
import { notifyApp } from "@/services/notifications";
import { useNotificationCenter } from "@/context/NotificationCenterContext";

export default function AdminTopBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { notifications, unreadCount, addNotification, markAllAsRead, clearAll } = useNotificationCenter();

  const liveSalesCount = useMemo(() => 5, []);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-white/95 backdrop-blur">
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
              <p className="text-sm font-black text-foreground">Hasee Admin</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Pink & White
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block w-[420px]">
            <Search
              className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              strokeWidth={1.5}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search (mock)…"
              className="h-10 pl-9 bg-white border-border rounded-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10 rounded-full hover:bg-secondary/80"
            onClick={() =>
              notifyApp(
                {
                  title: "Live sales update",
                  message: "You have 5 active sales updates in queue (mock).",
                  priority: "info",
                  source: "admin-live-sales",
                },
                { center: { addNotification } },
              )
            }
            aria-label="Live sales notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold flex items-center justify-center border border-border">
              {Math.max(liveSalesCount, unreadCount)}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
              className="h-10 rounded-full border-border bg-white hover:bg-muted"
              >
              <UserCircle2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="ml-2 hidden sm:inline text-sm font-bold text-foreground">
                Admin
              </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl w-56">
              <div className="px-2 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                  <p className="text-sm font-black truncate text-foreground">Hasee Admin</p>
                  <p className="text-xs text-muted-foreground truncate">admin@hasee.com</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 space-y-1 max-h-72 overflow-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-2">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 6).map((notification) => (
                    <div key={notification.id} className="px-2 py-2 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-xs font-bold text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={markAllAsRead}>Mark all as read</DropdownMenuItem>
              <DropdownMenuItem onClick={clearAll}>Clear all notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  notifyApp(
                    {
                      title: "Profile",
                      message: "Profile panel is mocked in this build.",
                      priority: "info",
                      source: "admin-profile",
                    },
                    { center: { addNotification } },
                  )
                }
              >
                Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

