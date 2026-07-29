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
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg border border-indigo-200 bg-indigo-100 text-indigo-700">
              <AvatarFallback className="rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                {user.avatarFallback}
              </AvatarFallback>
            </Avatar>
            {!compact && (
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
