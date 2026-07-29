"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bus, Building2, User, Lock, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [tenantCode, setTenantCode] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        tenant_code: tenantCode.trim(),
        user_name: userName.trim(),
        password: password,
      });

      if (res?.error) {
        setError(res.error || "بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (tCode: string, uName: string, pass: string) => {
    setTenantCode(tCode);
    setUserName(uName);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Background Subtle Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            منصة مسارات SaaS
          </h1>
          <p className="text-sm text-slate-600">
            النظام السحابي الشامل لإدارة وتنسيق النقل الجامعي والمؤسسي
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/80 shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100 p-6 pb-4 sm:px-8">
            <CardTitle className="text-xl text-slate-800">تسجيل الدخول للنظام</CardTitle>
            <CardDescription className="text-xs">أدخل كود المؤسسة وبيانات الحساب للمتابعة</CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant Code */}
            <div>
              <Label className="mb-1.5 block text-slate-700">
                كود المؤسسة (Tenant Code)
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  required
                  placeholder="مثال: KSU"
                  value={tenantCode}
                  onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                  className="bg-slate-50 pr-10 font-mono focus-visible:border-blue-600 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <Label className="mb-1.5 block text-slate-700">
                اسم المستخدم
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  required
                  placeholder="اسم المستخدم"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-50 pr-10 focus-visible:border-blue-600 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="mb-1.5 block text-slate-700">
                كلمة المرور
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 pr-10 focus-visible:border-blue-600 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 focus-visible:ring-blue-500/40 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-3">بيانات تجريبية للتجربة السريعة:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoFill("KSU", "ksu_admin", "admin123")}
                className="h-8 border-blue-200/60 bg-blue-50 text-xs text-blue-700 hover:bg-blue-100"
              >
                مدير جامعة KSU
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoFill("SYSTEM", "superadmin", "admin123")}
                className="h-8 border-indigo-200/60 bg-indigo-50 text-xs text-indigo-700 hover:bg-indigo-100"
              >
                Super Admin
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} مسارات SaaS. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
