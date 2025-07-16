"use client";

import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Route, 
  FileText,
  ClipboardList
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Admin Dashboard Menu items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Learners",
    url: "/dashboard/learners",
    icon: Users,
  },
  {
    title: "Tracks",
    url: "/dashboard/tracks",
    icon: Route,
  },
  {
    title: "Courses",
    url: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: ClipboardList,
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-primary rounded-r-[8px]">
        <SidebarHeader>
          <div className="flex justify-center h-24 bg-white rounded-[8px] items-center">
            <Link href="/">
              <div className="inline-block">
                <Image
                  src="/images/azubi-logo.svg"
                  alt="Logo"
                  width={106}
                  height={30}
                />
              </div>
            </Link>
          </div>
        </SidebarHeader>
        
        <div className="flex-1 px-3 py-4">
          <SidebarMenu className="flex flex-col gap-4">
            {items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    isActive={isActive}
                    className="h-14 text-white hover:text-white hover:bg-white/10 data-[active=true]:text-primary data-[active=true]:bg-white [&>svg]:text-white hover:[&>svg]:text-white data-[active=true]:[&>svg]:text-primary"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="font-inter text-body-md">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
        <SidebarFooter>
            <div className="flex items-center justify-between">
                {/* profile image */}
                <div className="flex flex-col">
                    {/* Admin name */}
                    {/* Admin email */}
                </div>
                {/* logout icon */}
            </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
