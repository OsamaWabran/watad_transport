"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Building2, Bell } from "lucide-react";

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
  const role = (session?.user as any)?.roles?.[0] || "مسؤول النظام";
  const name = session?.user?.name || "مدير النظام";
  const avatarFallback = name.charAt(0).toUpperCase();
  const pageTitle = pageTitles[pathname] || "لوحة التحكم";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <SidebarProvider
      className="min-h-screen bg-slate-50 font-arabic text-slate-900"
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <AppSidebar
        user={{
          name,
          role,
          tenantLabel,
          avatarFallback,
        }}
        onSignOut={handleSignOut}
      />
      <SidebarInset className="bg-slate-50">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="text-slate-600 hover:bg-slate-100" />
            <Separator
              orientation="vertical"
              className="data-vertical:h-5 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold text-slate-900">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              shape="pill"
              className="hidden gap-2 border border-slate-200 text-slate-700 sm:flex"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>سياق المؤسسة:</span>
              <span className="font-bold text-blue-700">{tenantLabel}</span>
            </Badge>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
