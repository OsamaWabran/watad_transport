"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Bus,
  FileText,
  Plus,
  ArrowUpLeft,
  CheckCircle,
  Clock,
  Shield,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    tenantsCount: 1,
    usersCount: 2,
    vehiclesCount: 12,
    formsCount: 4,
    loading: false,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [tenantsRes, usersRes] = await Promise.allSettled([
          fetch("/api/v1/tenants").then((res) => res.json()),
          fetch("/api/v1/users").then((res) => res.json()),
        ]);

        let tCount = 1;
        let uCount = 2;

        if (tenantsRes.status === "fulfilled" && tenantsRes.value?.success) {
          tCount = Array.isArray(tenantsRes.value.data) ? tenantsRes.value.data.length : 1;
        }

        if (usersRes.status === "fulfilled" && usersRes.value?.success) {
          uCount = Array.isArray(usersRes.value.data) ? usersRes.value.data.length : 2;
        }

        setStats({
          tenantsCount: tCount,
          usersCount: uCount,
          vehiclesCount: 12,
          formsCount: 4,
          loading: false,
        });
      } catch (e) {
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge shape="pill" className="border-white/15 bg-white/15 text-white backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-blue-200" />
            <span>لوحة التحكم الرئيسية للمنصة</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            مرحباً بك في منصة مسارات النقل الذكية
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            نظام سحابي متكامل لإدارة الخدمات اللوجستية والنقل الجامعي والمؤسسي مع عزل تام للبيانات ومصادقة مشددة.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/dashboard/tenants"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "bg-white font-bold text-blue-700 shadow-sm hover:bg-blue-50"
              )}
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مؤسسة جديدة</span>
            </Link>
            <Link
              href="/dashboard/users"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 bg-blue-500/40 text-white backdrop-blur-md hover:bg-blue-500/60 hover:text-white"
              )}
            >
              <Users className="w-4 h-4" />
              <span>إدارة المستخدمين والأدوار</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tenants */}
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">المؤسسات المسجلة</span>
            <span className="text-2xl font-black text-slate-900 block">
              {stats.loading ? "..." : stats.tenantsCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>حسابات مفعلة</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Users */}
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">المستخدمين والمدراء</span>
            <span className="text-2xl font-black text-slate-900 block">
              {stats.loading ? "..." : stats.usersCount}
            </span>
            <span className="text-[11px] text-blue-600 font-medium mt-1 inline-flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>تحقق بـ JWT</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: Vehicles */}
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">أسطول الحافلات</span>
            <span className="text-2xl font-black text-slate-900 block">12</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>جاهزة للخدمة</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Bus className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Forms */}
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">استمارات الحصر</span>
            <span className="text-2xl font-black text-slate-900 block">4</span>
            <span className="text-[11px] text-purple-600 font-medium mt-1 inline-flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>مفتوحة لتلقي الردود</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FileText className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Tenant Management Overview */}
        <Card className="space-y-4 border-slate-200/80 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">إدارة المؤسسات التابعة</h3>
                <p className="text-xs text-slate-500">تسجيل وتفعيل المؤسسات الأكاديمية والشركات</p>
              </div>
            </div>

            <Link
              href="/dashboard/tenants"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowUpLeft className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            تمكنك منصة مسارات من إضافة جامعات مثل (جامعة الملك سعود، جامعة الإمام) ومنح كل مؤسسة بيئة مستقلة تماماً وكود دخول مخصص.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard/tenants"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              )}
            >
              <span>فتح لوحة إدارة المؤسسات</span>
              <ArrowUpLeft className="w-4 h-4" />
            </Link>
          </div>
        </Card>

        {/* Module 2: IAM & Roles Overview */}
        <Card className="space-y-4 border-slate-200/80 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">إدارة المستخدمين والصلاحيات (IAM)</h3>
                <p className="text-xs text-slate-500">التحكم في أدوار الحسابات (Admin, Driver, User)</p>
              </div>
            </div>

            <Link
              href="/dashboard/users"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowUpLeft className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            إضافة مدراء النظام والموظفين والسائقين لكل مؤسسة، وتشفير كلمات المرور وحماية المسارات الأمنية بـ JWT Tokens.
          </p>

          <div className="pt-2">
            <Link
              href="/dashboard/users"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              )}
            >
              <span>فتح لوحة إدارة المستخدمين والأدوار</span>
              <ArrowUpLeft className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
