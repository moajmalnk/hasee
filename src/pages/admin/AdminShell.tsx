import type { ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "../../components/admin/AdminTopBar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full">
        <Sidebar collapsible="icon" className="hidden md:block">
          <SidebarContent className="p-0">
            <AdminSidebar />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-white text-foreground">
          <div className="h-full">
            <AdminTopBar />
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

