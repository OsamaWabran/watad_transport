"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bus,
  Building2,
  FileText,
  LayoutDashboard,
  MapPin,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/sidebar"

const navigation = [
  { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard, group: "نظرة عامة" },
  { name: "المؤسسات (Tenants)", href: "/dashboard/tenants", icon: Building2, group: "إدارة المنصة" },
  { name: "المستخدمين والأدوار", href: "/dashboard/users", icon: Users, group: "إدارة المنصة" },
  { name: "الركاب والطلاب", href: "/dashboard/passengers", icon: UserCheck, group: "تشغيل النقل" },
  { name: "أسطول المركبات", href: "/dashboard/vehicles", icon: Bus, group: "تشغيل النقل" },
  { name: "السائقين والورديات", href: "/dashboard/drivers", icon: Users, group: "تشغيل النقل" },
  { name: "المحطات الجغرافية", href: "/dashboard/stations", icon: MapPin, group: "تشغيل النقل" },
  { name: "النماذج والاستمارات", href: "/dashboard/forms", icon: FileText, group: "البيانات" },
  { name: "البيانات المرجعية", href: "/dashboard/lookups", icon: Settings, group: "البيانات" },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    role: string
    tenantLabel: string
    avatarFallback: string
  }
  onSignOut: () => void
}

export function AppSidebar({ user, onSignOut, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { setOpen } = useSidebar()
  const activeItem =
    navigation.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" && pathname.startsWith(item.href))
    ) ?? navigation[0]

  const groupedNavigation = React.useMemo(() => {
    return navigation.reduce<Record<string, typeof navigation>>((groups, item) => {
      groups[item.group] = [...(groups[item.group] ?? []), item]
      return groups
    }, {})
  }, [])

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        side="right"
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-l"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="md:h-8 md:p-0"
                render={<Link href="/dashboard" />}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <Bus className="size-4" />
                </div>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-bold">مسارات</span>
                  <span className="truncate text-xs">SaaS</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navigation.slice(0, 6).map((item) => {
                  const isActive = activeItem.href === item.href
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.name,
                          hidden: false,
                        }}
                        isActive={isActive}
                        className="px-2.5 md:px-2"
                        render={<Link href={item.href} onClick={() => setOpen(true)} />}
                      >
                        <Icon />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser compact user={user} onSignOut={onSignOut} />
        </SidebarFooter>
      </Sidebar>

      {/* <Sidebar side="right" collapsible="none" className="hidden flex-1 md:flex"> */}
        {/* <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-bold text-foreground">لوحة مسارات</div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {user.tenantLabel}
              </p>
            </div>
            <Badge variant="blue" shape="pill" className="shrink-0">
              {user.role}
            </Badge>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <SidebarInput placeholder="بحث في الوحدات..." className="pr-8" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {Object.entries(groupedNavigation).map(([group, items]) => (
            <SidebarGroup key={group} className="px-3 py-3">
              <div className="mb-2 px-2 text-xs font-bold text-muted-foreground">
                {group}
              </div>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const isActive = activeItem.href === item.href
                    const Icon = item.icon

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<Link href={item.href} />}
                          className="h-10 rounded-lg text-right"
                        >
                          <Icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}


        </SidebarContent>
      </Sidebar> */}
    </Sidebar>
  )
}
