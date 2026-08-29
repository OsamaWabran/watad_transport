"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, CalendarDays, CircleGauge, Mail, Search } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "الرئيسية",
  "/dashboard/tenants": "المؤسسات",
  "/dashboard/users": "إدارة المستخدمين",
  "/dashboard/passengers": "الركاب والطلاب",
  "/dashboard/vehicles": "أسطول المركبات",
  "/dashboard/drivers": "السائقين والورديات",
  "/dashboard/stations": "المحطات الجغرافية",
  "/dashboard/forms": "النماذج والاستمارات",
  "/dashboard/lookups": "البيانات المرجعية",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const tenantLabel = (session?.user as any)?.tenant_id
    ? "مؤسسة مفعلة (KSU)"
    : "النظام العام (Super Admin)";
  
  const userRoles = ((session?.user as any)?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes("super_admin");
  const role = userRoles[0] || "مسؤول النظام";
  const name = session?.user?.name || "مدير النظام";
  const avatarFallback = name.charAt(0).toUpperCase();
  const pageTitle = pageTitles[pathname] || "لوحة التحكم";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <SidebarProvider
      className="min-h-screen bg-[#f8faf9] font-arabic text-[#1a1c1e]"
      style={{ "--sidebar-width": "16.25rem" } as React.CSSProperties}
    >
      <AppSidebar
        user={{
          name,
          role,
          tenantLabel,
          avatarFallback,
          isSuperAdmin,
        }}
        onSignOut={handleSignOut}
      />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-40 bg-[#f8faf9]/92 px-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="h-10 w-10 rounded-full border border-[#c0c9c2]/70 bg-white text-[#404943] shadow-enterprise hover:bg-[#f3f3f6]" />
              <Separator
                orientation="vertical"
                className="data-vertical:h-6 data-vertical:self-auto bg-[#c0c9c2]"
              />
              <div className="min-w-0">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-bold text-[#1a1c1e]">
                        {pageTitle}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="mt-1 hidden items-center gap-2 text-xs text-[#707973] sm:flex">
                  <CircleGauge className="h-3.5 w-3.5 text-[#006d37]" />
                  <span>مركز عمليات النقل والتعليم</span>
                  <span className="h-1 w-1 rounded-full bg-[#c0c9c2]" />
                  <CalendarDays className="h-3.5 w-3.5 text-[#0f4c36]" />
                  <span>{new Date().toLocaleDateString("ar-SA")}</span>
                </div>
              </div>
            </div>

            <div className="hidden w-full max-w-xs items-center md:flex">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#707973]" />
                <input
                  className="h-11 w-full rounded-full border-0 bg-[#f1f3f2] pr-10 pl-4 text-sm text-[#1a1c1e] shadow-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-[#003422]"
                  placeholder="ابحث هنا..."
                  type="search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                shape="pill"
                className="hidden border-[#99d3b6]/70 bg-[#e7f8ef] text-[#005228] sm:flex"
              >
                {tenantLabel}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-full border-[#c0c9c2]/70 bg-white text-[#404943] shadow-enterprise hover:bg-[#f3f3f6]"
                title="الرسائل"
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-full border-[#c0c9c2]/70 bg-white text-[#404943] shadow-enterprise hover:bg-[#f3f3f6]"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#006d37]" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
