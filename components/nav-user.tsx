"use client"

import {
  BellIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
  onSignOut,
  compact = false,
}: {
  user: {
    name: string
    role: string
    tenantLabel: string
    avatarFallback: string
  }
  onSignOut: () => void
  compact?: boolean
}) {
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                tooltip={{ children: user.name, side: "left" }}
                className="rounded-xl text-[#404943] data-open:bg-[#e7f8ef] data-open:text-[#005228] hover:bg-[#f3f3f6] group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:w-9! group-data-[collapsible=icon]:justify-center"
              />
            }
          >
            <Avatar className="h-8 w-8 shrink-0 rounded-lg border border-[#99d3b6] bg-[#b4efd1] text-[#005228] group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
              <AvatarFallback className="rounded-lg bg-[#b4efd1] text-xs font-bold text-[#005228]">
                {user.avatarFallback}
              </AvatarFallback>
            </Avatar>
            {!compact && !isCollapsed && (
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.role}</span>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "left"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-right text-sm">
                <Avatar className="h-8 w-8 rounded-lg border border-indigo-200 bg-indigo-100">
                  <AvatarFallback className="rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                    {user.avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.tenantLabel}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                الحساب
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShieldCheckIcon />
                الصلاحيات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                الإشعارات
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                الإعدادات
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onSignOut}>
              <LogOutIcon />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
