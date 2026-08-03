"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Building2, Bell, CalendarDays, CircleGauge } from "lucide-react";

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
  "/dashboard/users": "المستخدمين والأدوار",
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
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe_0,#f8fafc_32rem,#eef7f5_100%)] font-arabic text-slate-900"
      style={{ "--sidebar-width": "18.5rem" } as React.CSSProperties}
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
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100" />
            <Separator
              orientation="vertical"
              className="data-vertical:h-5 data-vertical:self-auto"
            />
            <div className="min-w-0">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-bold text-slate-900">
                      {pageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="mt-1 hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                <CircleGauge className="h-3.5 w-3.5 text-teal-600" />
                <span>مركز عمليات النقل والتعليم</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                <span>{new Date().toLocaleDateString("ar-SA")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="blue"
              shape="pill"
              className="hidden gap-2 border-blue-200 bg-blue-50 text-blue-800 sm:flex"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>سياق المؤسسة:</span>
              <span className="font-bold text-blue-700">{tenantLabel}</span>
            </Badge>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
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
