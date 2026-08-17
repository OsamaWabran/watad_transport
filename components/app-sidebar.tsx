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
  { name: "الطلبات المعلقة", href: "/dashboard/passengers/requests", icon: Users, group: "تشغيل النقل" },
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
    currentNavigation.find((item) => pathname === item.href) ??
    currentNavigation.find(
      (item) => item.href !== "/dashboard" && pathname.startsWith(item.href)
    ) ??
    currentNavigation[0];

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
    <Sidebar side="right" collapsible="icon" variant="inset" className="border-l border-[#c0c9c2]/70 bg-white text-[#1a1c1e]" {...props}>
      <SidebarHeader className="gap-5 border-b border-[#e2e2e5] p-4">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-base font-bold text-[#003422]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003422] text-white shadow-enterprise">
                <Bus className="h-5 w-5" />
              </span>
              <span>مسارات SaaS</span>
            </div>
            <p className="mt-2 truncate text-xs text-[#707973]">
              {user.tenantLabel}
            </p>
          </div>
          <Badge variant="emerald" shape="pill" className="shrink-0 border-[#99d3b6]/70 bg-[#e7f8ef] text-[#005228]">
            {user.role}
          </Badge>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#707973]" />
          <SidebarInput
            placeholder="بحث في القوائم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-full border-0 bg-[#f1f3f2] pr-9 text-[#1a1c1e] placeholder:text-[#707973] focus-visible:ring-[#003422]"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedNavigation).map(([group, items]) => (
          <SidebarGroup key={group} className="px-3 py-3">
            <div className="mb-2 px-2 text-xs font-bold text-[#707973]">
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
                        className="h-11 rounded-xl border-r-4 border-transparent text-right text-[#404943] hover:bg-[#f3f3f6] hover:text-[#003422] data-active:border-[#003422] data-active:bg-[#b4efd1]/55 data-active:text-[#005228]"
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

      <div className="mx-4 mb-4 rounded-2xl bg-[#003422] p-4 text-white shadow-enterprise">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Bus className="h-4 w-4" />
        </div>
        <p className="text-sm font-bold">تطبيق الجوال</p>
        <p className="mt-1 text-xs text-white/75">إدارة أسرع للرحلات والموافقات</p>
      </div>

      <SidebarFooter className="border-t border-[#e2e2e5] p-2">
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
