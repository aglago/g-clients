import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
        <div className="px-8 w-full">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-col gap-4">{children}</div>
        </div>
    </SidebarProvider>
  );
}
