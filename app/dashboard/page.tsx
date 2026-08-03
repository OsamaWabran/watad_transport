"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpLeft,
  Building2,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Route,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// بيانات الرسم البياني الشهرية للرحلات وحجم النقل (Overview)
const monthlyOverviewData = [
  { month: "يناير", count: 2400 },
  { month: "فبراير", count: 1398 },
  { month: "مارس", count: 9800 },
  { month: "أبريل", count: 3908 },
  { month: "مايو", count: 4800 },
  { month: "يونيو", count: 3800 },
  { month: "يوليو", count: 4300 },
  { month: "أغسطس", count: 5200 },
  { month: "سبتمبر", count: 7100 },
  { month: "أكتوبر", count: 8400 },
  { month: "نوفمبر", count: 6900 },
  { month: "ديسمبر", count: 7800 },
];

// الأنشطة والعمليات الأخيرة (Recent Sales / Activity)
const recentActivities = [
  {
    name: "سارة أحمد الزهراني",
    email: "sara.zahrani@ksu.edu.sa",
    type: "تسجيل طالبة جديدة",
    time: "منذ 5 دقائق",
    badge: "جديد",
    badgeVariant: "emerald" as const,
    avatar: "S",
    avatarBg: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "مؤسسة التميّز التعليمية",
    email: "admin@altamayyuz.sa",
    type: "تفعيل اشتراك مؤسسي",
    time: "منذ 25 دقيقة",
    badge: "مؤسسة",
    badgeVariant: "blue" as const,
    avatar: "T",
    avatarBg: "bg-blue-100 text-blue-800",
  },
  {
    name: "سالم عبد الله الحربي",
    email: "driver.salem@masarat.sa",
    type: "اكتمال وردية نقل - مسار 4",
    time: "منذ 42 دقيقة",
    badge: "مكتمل",
    badgeVariant: "secondary" as const,
    avatar: "H",
    avatarBg: "bg-amber-100 text-amber-800",
  },
  {
    name: "محمد بن فهد القحطاني",
    email: "m.qahtani@ksu.edu.sa",
    type: "تأكيد حجز حافلة المجمع الطبي",
    time: "منذ ساعة واحدة",
    badge: "نشط",
    badgeVariant: "emerald" as const,
    avatar: "M",
    avatarBg: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "د. خالد السليمان",
    email: "k.sulaiman@masarat.sa",
    type: "إضافة صلاحية مدير محلي",
    time: "منذ ساعتين",
    badge: "صلاحية",
    badgeVariant: "outline" as const,
    avatar: "K",
    avatarBg: "bg-slate-100 text-slate-800",
  },
];

// مسارات التشغيل المباشرة
const liveOperations = [
  {
    route: "مسار 101 - السكن الجامعي (البوابة 4)",
    status: "منتظم",
    driver: "سالم الحربي",
    vehicle: "أ ب ج 2147",
    load: "41 / 48 مقعد",
    time: "07:30 ص",
  },
  {
    route: "مسار 204 - كلية الهندسة ومحطة المترو",
    status: "قيد المتابعة",
    driver: "محمد القحطاني",
    vehicle: "د هـ و 9031",
    load: "28 / 32 مقعد",
    time: "08:15 ص",
  },
  {
    route: "مسار 305 - المجمع الطبي والعيادات",
    status: "جاهز للانطلاق",
    driver: "عبدالعزيز الغامدي",
    vehicle: "ر ح ط 5512",
    load: "14 / 24 مقعد",
    time: "09:00 ص",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    tenantsCount: 1,
    usersCount: 2,
    loading: true,
  });

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [tenantsRes, usersRes] = await Promise.allSettled([
          fetch("/api/v1/tenants", { cache: "no-store" }).then((res) => res.json()),
          fetch("/api/v1/users", { cache: "no-store" }).then((res) => res.json()),
        ]);

        setStats({
          tenantsCount:
            tenantsRes.status === "fulfilled" && tenantsRes.value?.success && Array.isArray(tenantsRes.value.data)
              ? tenantsRes.value.data.length
              : 1,
          usersCount:
            usersRes.status === "fulfilled" && usersRes.value?.success && Array.isArray(usersRes.value.data)
              ? usersRes.value.data.length
              : 2,
          loading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  const maxCount = Math.max(...monthlyOverviewData.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Header section with title & quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            نظرة عامة على لوحة التحكم
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            متابعة فورية للمؤسسات والمستخدمين والأسطول والعمليات اليومية بأسلوب Shadcn UI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="h-4 w-4 ml-1.5" />
            تصدير التقرير
          </Button>
          <Link
            href="/dashboard/passengers"
            className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-800")}
          >
            <Plus className="h-4 w-4 ml-1.5" />
            إضافة طالب
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards - Exact dashboard-01 structure */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: عدد المؤسسات */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">عدد المؤسسات</CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.loading ? "..." : stats.tenantsCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium font-mono">+2</span> مؤسسة جديدة هذا الشهر
            </p>
          </CardContent>
        </Card>

        {/* Card 2: إجمالي المستخدمين */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.loading ? "..." : stats.usersCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium font-mono">+18%</span> مقارنة بالشهر الماضي
            </p>
          </CardContent>
        </Card>

        {/* Card 3: أسطول المركبات والسعة */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">أسطول المركبات والسعة</CardTitle>
            <Bus className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">94 مقعد</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">92%</span> جاهزية تشغيلية بالحافلات
            </p>
          </CardContent>
        </Card>

        {/* Card 4: النشاط الحالي والرحلات */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">النشاط الحالي والرحلات</CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">18 رحلة</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium font-mono">+7</span> مسارات تعمل الآن
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Overview Chart (4 cols) & Recent Activity (3 cols) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Bar Chart Section - dashboard-01 Left Block */}
        <Card className="border-slate-200/80 bg-white shadow-xs lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  النظرة العامة على حركة النقل
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  إجمالي الطلاب المنقولين والرحلات المنجزة شهرياً خلال السنة
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-normal">
                سنوي 2026
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Custom Responsive SVG/CSS Bar Chart with dashboard-01 styling */}
            <div className="h-[300px] w-full flex flex-col justify-end">
              <div className="relative flex h-full items-end gap-2 sm:gap-3 border-b border-slate-100 pb-2">
                {monthlyOverviewData.map((item, index) => {
                  const heightPercent = Math.round((item.count / maxCount) * 100);
                  const isHovered = hoveredBar === index;
                  return (
                    <div
                      key={item.month}
                      className="group relative flex flex-1 flex-col items-center h-full justify-end"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 z-20 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-md transition-all">
                          {item.count.toLocaleString("ar-SA")} ركوب
                        </div>
                      )}
                      {/* Bar Container */}
                      <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md overflow-hidden h-full flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={cn(
                            "w-full rounded-t-md transition-all duration-300",
                            isHovered ? "bg-slate-900" : "bg-slate-800 hover:bg-slate-900"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X Axis Labels */}
              <div className="flex w-full justify-between gap-1 pt-3 text-[11px] text-slate-500 font-medium">
                {monthlyOverviewData.map((item) => (
                  <span key={item.month} className="flex-1 text-center truncate">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section - dashboard-01 Right Block */}
        <Card className="border-slate-200/80 bg-white shadow-xs lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              النشاط الأخير
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              تم تسجيل 24 عملية وتحديث خلال الـ 24 ساعة الماضية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar size="default" className={cn("h-9 w-9 border border-slate-200 font-bold", activity.avatarBg)}>
                      <AvatarFallback className={activity.avatarBg}>
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {activity.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <Badge variant={activity.badgeVariant} shape="pill" className="text-[10px] px-2 py-0.5 font-medium">
                      {activity.badge}
                    </Badge>
                    <p className="text-[11px] text-slate-400 mt-1 dir-ltr text-right">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Operations & Routes Overview */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              متابعة الرحلات التشغيلية الحالية
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              حالة الحافلات والسائقين المسجلين في الفترة الحالية
            </CardDescription>
          </div>
          <Link
            href="/dashboard/vehicles"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            عرض الكل
            <ArrowUpLeft className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 border-b border-slate-100">
                <TableHead className="font-semibold text-slate-700">المسار / الخط</TableHead>
                <TableHead className="font-semibold text-slate-700">الحالة</TableHead>
                <TableHead className="font-semibold text-slate-700">السائق المعين</TableHead>
                <TableHead className="font-semibold text-slate-700">رقم الحافلة</TableHead>
                <TableHead className="font-semibold text-slate-700">الحمل والسعة</TableHead>
                <TableHead className="font-semibold text-slate-700">وقت الانطلاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveOperations.map((op, idx) => (
                <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{op.route}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        op.status === "منتظم"
                          ? "emerald"
                          : op.status === "قيد المتابعة"
                            ? "amber"
                            : "secondary"
                      }
                      shape="pill"
                    >
                      {op.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{op.driver}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">{op.vehicle}</TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">{op.load}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">{op.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
