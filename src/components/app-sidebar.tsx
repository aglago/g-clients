"use client";

import { 
  LayoutDashboard, 
  BookOpen, 
  Route, 
  FileText,
  ClipboardList,
  LogOut,
  User
} from "lucide-react";

import { HiOutlineUserGroup } from "react-icons/hi2";


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
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

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
    icon: HiOutlineUserGroup,
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
  const { user, logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
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
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg mx-3 mb-3">
            {/* Profile section */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Profile image */}
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              
              {/* Admin info - only show when expanded */}
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-white font-medium text-sm truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                </span>
                <span className="text-white/70 text-xs truncate">
                  {user?.email || 'admin@example.com'}
                </span>
              </div>
            </div>
            
            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="flex-shrink-0 w-8 h-8 text-white hover:bg-white/20 hover:text-white"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
