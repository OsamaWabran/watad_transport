"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpLeft,
  Building2,
  Bus,
  CheckCircle2,
  Download,
  Minus,
  Plus,
  Route,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const weeklyOverviewData = [
  { day: "السبت", value: 40, tone: "striped" },
  { day: "الأحد", value: 60, tone: "primary" },
  { day: "الإثنين", value: 74, tone: "accent" },
  { day: "الثلاثاء", value: 85, tone: "primary" },
  { day: "الأربعاء", value: 45, tone: "striped" },
  { day: "الخميس", value: 30, tone: "striped" },
  { day: "الجمعة", value: 20, tone: "soft" },
];

const recentActivities = [
  {
    name: "فاطمة محمد",
    detail: "قامت بتحديث جدول رحلات نهاية الأسبوع",
    time: "منذ 5 دقائق",
    badge: "مكتمل",
    variant: "emerald" as const,
    avatar: "ف",
  },
  {
    name: "أحمد عبدالله",
    detail: "يعمل على اعتماد تراخيص السائقين الجدد",
    time: "منذ 25 دقيقة",
    badge: "قيد التنفيذ",
    variant: "secondary" as const,
    avatar: "أ",
  },
  {
    name: "خالد سعيد",
    detail: "بانتظار الموافقة على ميزانية الصيانة الربع سنوية",
    time: "منذ ساعة",
    badge: "معلق",
    variant: "amber" as const,
    avatar: "خ",
  },
];

const liveOperations = [
  {
    route: "مسار 101 - السكن الجامعي",
    status: "منتظم",
    driver: "سالم الحربي",
    vehicle: "أ ب ج 2147",
    load: "41 / 48",
    time: "07:30 ص",
  },
  {
    route: "مسار 204 - كلية الهندسة والمترو",
    status: "قيد المتابعة",
    driver: "محمد القحطاني",
    vehicle: "د هـ و 9031",
    load: "28 / 32",
    time: "08:15 ص",
  },
  {
    route: "مسار 305 - المجمع الطبي",
    status: "جاهز للانطلاق",
    driver: "عبدالعزيز الغامدي",
    vehicle: "ر ح ط 5512",
    load: "14 / 24",
    time: "09:00 ص",
  },
];

function MetricCard({
  title,
  value,
  note,
  icon: Icon,
  primary = false,
  trend = "up",
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ElementType;
  primary?: boolean;
  trend?: "up" | "down" | "flat";
}) {
  const TrendIcon = trend === "down" ? TrendingDown : trend === "flat" ? Minus : TrendingUp;

  return (
    <Card
      className={cn(
        "rounded-2xl border-transparent p-1 shadow-enterprise transition-all hover:-translate-y-0.5 hover:border-[#003422]/20 hover:shadow-enterprise-hover",
        primary ? "bg-[#003422] text-white" : "bg-white"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={cn("text-sm", primary ? "text-white/85" : "text-[#404943]")}>{title}</p>
            <h3 className={cn("mt-2 text-3xl font-bold", primary ? "text-white" : "text-[#1a1c1e]")}>
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              primary ? "bg-white/15 text-white" : "bg-[#eeeef0] text-[#707973]"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div
          className={cn(
            "mt-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            primary ? "bg-white/10 text-[#6bfe9c]" : "bg-[#f3f3f6] text-[#707973]"
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {note}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    tenantsCount: 1,
    usersCount: 2,
    loading: true,
  });
  const [hoveredBar, setHoveredBar] = useState<number | null>(2);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-[#1a1c1e] sm:text-4xl">لوحة التحكم</h1>
          <p className="mt-2 text-sm text-[#707973]">
            خطط، حدد الأولويات، وتابع عمليات النقل اليومية من مركز واحد.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-[#003422] bg-white px-4 text-[#003422] shadow-enterprise hover:bg-[#f3f3f6]">
            <Download className="h-4 w-4" />
            تصدير البيانات
          </Button>
          <Link
            href="/dashboard/tenants"
            className={cn(buttonVariants(), "h-10 rounded-xl bg-[#003422] px-5 text-white shadow-enterprise hover:bg-[#0f4c36]")}
          >
            <Plus className="h-4 w-4" />
            إضافة مؤسسة
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          primary
          title="عدد المؤسسات"
          value={stats.loading ? "..." : stats.tenantsCount}
          note="5 مؤسسات جديدة"
          icon={Building2}
        />
        <MetricCard title="أسطول المركبات" value="1,430" note="إجمالي السعة" icon={Bus} />
        <MetricCard title="الرحلات النشطة" value="128" note="رحلة جارية حالياً" icon={Route} />
        <MetricCard
          title="المستخدمين"
          value={stats.loading ? "..." : stats.usersCount}
          note="مستخدم نشط اليوم"
          icon={Users}
          trend="down"
        />
        <MetricCard title="إجمالي الركاب" value="89k" note="خلال هذا الأسبوع" icon={Activity} trend="flat" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 rounded-2xl border-transparent bg-white p-1 shadow-enterprise lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 pt-5">
            <div>
              <CardTitle className="text-xl font-semibold text-[#1a1c1e]">النظرة العامة على حركة النقل</CardTitle>
              <CardDescription className="mt-1 text-sm text-[#707973]">مؤشر انتظام التشغيل خلال الأسبوع الحالي</CardDescription>
            </div>
            <Badge shape="pill" className="border-[#99d3b6] bg-[#e7f8ef] text-[#005228]">
              هذا الأسبوع
            </Badge>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-8">
            <div className="relative h-72 border-b border-[#e2e2e5]">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25].map((tick) => (
                  <div key={tick} className="border-b border-dashed border-[#eeeef0]" />
                ))}
              </div>
              <div className="relative z-10 flex h-full items-end justify-around gap-3 px-2">
                {weeklyOverviewData.map((item, index) => {
                  const isHovered = hoveredBar === index;
                  return (
                    <button
                      key={item.day}
                      type="button"
                      className="group flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-2"
                      onMouseEnter={() => setHoveredBar(index)}
                      onFocus={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(2)}
                      onBlur={() => setHoveredBar(2)}
                    >
                      {isHovered && (
                        <span className="rounded-md border border-[#eeeef0] bg-white px-2 py-1 text-xs font-bold text-[#1a1c1e] shadow-enterprise">
                          {item.value}%
                        </span>
                      )}
                      <span className="flex h-full w-9 items-end overflow-hidden rounded-full bg-[#e2e2e5] transition group-hover:bg-[#dadadc]">
                        <span
                          style={{ height: `${item.value}%` }}
                          className={cn(
                            "w-full rounded-full transition-all",
                            item.tone === "accent" && "bg-[#4ae183]",
                            item.tone === "primary" && "bg-[#003422]",
                            item.tone === "soft" && "bg-[#99d3b6]",
                            item.tone === "striped" && "bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgb(0_52_34_/_0.22)_5px,rgb(0_52_34_/_0.22)_10px)]"
                          )}
                        />
                      </span>
                      <span className={cn("text-xs", isHovered ? "font-bold text-[#1a1c1e]" : "text-[#707973]")}>
                        {item.day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          <Card className="rounded-2xl border-transparent bg-white p-1 shadow-enterprise">
            <CardHeader className="px-5 pt-5">
              <CardTitle className="text-xl font-semibold text-[#1a1c1e]">اجتماعات قادمة</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="rounded-xl border border-[#c0c9c2]/70 bg-white p-4">
                <h3 className="text-base font-semibold text-[#1a1c1e]">مراجعة أداء خطوط النقل</h3>
                <p className="mt-1 text-xs text-[#707973]">الوقت: 02:00 م - 04:00 م</p>
                <Button className="mt-4 h-10 w-full rounded-lg bg-[#003422] text-white hover:bg-[#0f4c36]">
                  انضمام للاجتماع
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-transparent bg-white p-1 shadow-enterprise">
            <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
              <CardTitle className="text-xl font-semibold text-[#1a1c1e]">المهام السريعة</CardTitle>
              <Button variant="outline" size="sm" className="rounded-lg border-[#c0c9c2] bg-white text-[#003422]">
                <Plus className="h-3.5 w-3.5" />
                جديد
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              {["تحديث مسارات المحطة الشمالية", "صيانة دورية للأسطول A", "مراجعة تقارير الحوادث"].map((task, index) => (
                <div key={task} className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-[#f3f3f6]">
                  <span className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", index === 0 ? "bg-[#6bfe9c] text-[#005228]" : index === 1 ? "bg-[#e1e3e2] text-[#444747]" : "bg-[#ffdad6] text-[#93000a]")}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1c1e]">{task}</p>
                    <p className="mt-0.5 text-xs text-[#707973]">الموعد النهائي: 30 نوفمبر 2026</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 rounded-2xl border-transparent bg-white p-1 shadow-enterprise lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
            <CardTitle className="text-xl font-semibold text-[#1a1c1e]">النشاط الأخير للمشرفين</CardTitle>
            <Button variant="outline" size="sm" className="rounded-lg border-[#c0c9c2] bg-white text-[#003422]">
              <Plus className="h-3.5 w-3.5" />
              إضافة عضو
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {recentActivities.map((activity) => (
              <div key={activity.name} className="flex items-center justify-between gap-3 rounded-xl p-3 transition hover:bg-[#f3f3f6]">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#c0c9c2] bg-[#e7f8ef] text-[#005228]">
                    <AvatarFallback className="bg-[#e7f8ef] font-bold text-[#005228]">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1a1c1e]">{activity.name}</p>
                    <p className="truncate text-xs text-[#707973]">{activity.detail}</p>
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  <Badge variant={activity.variant} shape="pill">{activity.badge}</Badge>
                  <p className="mt-1 text-xs text-[#707973]">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-12 rounded-2xl border-transparent bg-white p-1 shadow-enterprise lg:col-span-5">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-xl font-semibold text-[#1a1c1e]">التقدم الإجمالي للمشاريع</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-5 pb-6">
            <div className="relative mt-4 h-28 w-56 overflow-hidden">
              <div className="absolute left-0 top-0 h-56 w-56 rounded-full border-[22px] border-[#e2e2e5]" />
              <div
                className="absolute left-0 top-0 h-56 w-56 rounded-full border-[22px] border-[#003422]"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)", transform: "rotate(41deg)" }}
              />
            </div>
            <div className="-mt-8 rounded-full bg-white px-5 py-2 text-center">
              <p className="text-4xl font-bold text-[#1a1c1e]">41%</p>
              <p className="text-xs text-[#707973]">تم الإنجاز</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#404943]">
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-[#003422]" /> مكتمل</span>
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-[#99d3b6]" /> قيد التنفيذ</span>
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-[#e2e2e5]" /> معلق</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-transparent bg-white p-1 shadow-enterprise">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <div>
            <CardTitle className="text-xl font-semibold text-[#1a1c1e]">متابعة الرحلات التشغيلية الحالية</CardTitle>
            <CardDescription className="mt-1 text-sm text-[#707973]">حالة الحافلات والسائقين في الفترة الحالية</CardDescription>
          </div>
          <Link href="/dashboard/vehicles" className="flex items-center gap-1 text-xs font-semibold text-[#003422] hover:text-[#0f4c36]">
            عرض الكل
            <ArrowUpLeft className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e2e2e5] bg-[#f3f3f6]">
                <TableHead className="font-semibold text-[#404943]">المسار / الخط</TableHead>
                <TableHead className="font-semibold text-[#404943]">الحالة</TableHead>
                <TableHead className="font-semibold text-[#404943]">السائق المعين</TableHead>
                <TableHead className="font-semibold text-[#404943]">رقم الحافلة</TableHead>
                <TableHead className="font-semibold text-[#404943]">الحمل والسعة</TableHead>
                <TableHead className="font-semibold text-[#404943]">وقت الانطلاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveOperations.map((op) => (
                <TableRow key={op.route} className="border-b border-[#eeeef0] hover:bg-[#f8faf9]">
                  <TableCell className="font-medium text-[#1a1c1e]">{op.route}</TableCell>
                  <TableCell>
                    <Badge variant={op.status === "منتظم" ? "emerald" : op.status === "قيد المتابعة" ? "amber" : "secondary"} shape="pill">
                      {op.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#404943]">{op.driver}</TableCell>
                  <TableCell className="font-mono text-xs text-[#404943]">{op.vehicle}</TableCell>
                  <TableCell className="text-sm font-medium text-[#404943]">{op.load}</TableCell>
                  <TableCell className="font-mono text-xs text-[#707973]">{op.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
