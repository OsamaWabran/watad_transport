"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bus,
  Building2,
  CircleDot,
  FileText,
  LayoutDashboard,
  MapPin,
  Search,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const superAdminNavigation = [
  { name: "مركز التحكم", href: "/dashboard", icon: LayoutDashboard, group: "نظرة عامة" },
  { name: "المؤسسات", href: "/dashboard/tenants", icon: Building2, group: "إدارة المنصة" },
  { name: "المستخدمين والأدوار", href: "/dashboard/users", icon: Users, group: "إدارة المنصة" },
  { name: "المحطات الجغرافية", href: "/dashboard/stations", icon: MapPin, group: "إدارة المنصة" },
  { name: "النماذج والاستمارات", href: "/dashboard/forms", icon: FileText, group: "البيانات" },
  { name: "البيانات المرجعية", href: "/dashboard/lookups", icon: Settings, group: "البيانات" },
];

const tenantAdminNavigation = [
  { name: "مركز التحكم", href: "/dashboard", icon: LayoutDashboard, group: "نظرة عامة" },
  { name: "الركاب والطلاب", href: "/dashboard/passengers", icon: UserCheck, group: "تشغيل النقل" },
  { name: "أسطول المركبات", href: "/dashboard/vehicles", icon: Bus, group: "تشغيل النقل" },
  { name: "السائقين والورديات", href: "/dashboard/drivers", icon: Users, group: "تشغيل النقل" },
  { name: "المحطات الجغرافية", href: "/dashboard/stations", icon: MapPin, group: "تشغيل النقل" },
  { name: "النماذج والاستمارات", href: "/dashboard/forms", icon: FileText, group: "البيانات" },
  { name: "البيانات المرجعية", href: "/dashboard/lookups", icon: Settings, group: "البيانات" },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    role: string;
    tenantLabel: string;
    avatarFallback: string;
    isSuperAdmin: boolean;
  };
  onSignOut: () => void;
};

export function AppSidebar({ user, onSignOut, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = React.useState("");

  const currentNavigation = user.isSuperAdmin ? superAdminNavigation : tenantAdminNavigation;

  const activeItem =
    currentNavigation.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href))
    ) ?? currentNavigation[0];

  const filteredNavigation = React.useMemo(() => {
    if (!searchQuery.trim()) return currentNavigation;
    return currentNavigation.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, currentNavigation]);

  const groupedNavigation = React.useMemo(() => {
    return filteredNavigation.reduce<Record<string, typeof currentNavigation>>((groups, item) => {
      groups[item.group] = [...(groups[item.group] ?? []), item];
      return groups;
    }, {});
  }, [filteredNavigation]);

  return (
    <Sidebar side="right" collapsible="icon" variant="inset" className="bg-slate-900 text-slate-100" {...props}>
      <SidebarHeader className="gap-3.5 border-b border-white/10 p-4">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-base font-bold text-white">
              <Bus className="h-5 w-5 text-teal-400" />
              <span>مسارات SaaS</span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-400">
              {user.tenantLabel}
            </p>
          </div>
          <Badge variant="emerald" shape="pill" className="shrink-0 border-teal-300/30 bg-teal-400/10 text-teal-100">
            {user.role}
          </Badge>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <SidebarInput
            placeholder="بحث في القوائم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-slate-950/50 pr-8 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedNavigation).map(([group, items]) => (
          <SidebarGroup key={group} className="px-3 py-3">
            <div className="mb-2 px-2 text-xs font-bold text-slate-500">
              {group}
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {items.map((item) => {
                  const isActive = activeItem.href === item.href;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        className="h-10 rounded-lg text-right text-slate-300 hover:bg-white/10 hover:text-white data-active:bg-white data-active:text-slate-950"
                      >
                        <Icon />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-2">
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
