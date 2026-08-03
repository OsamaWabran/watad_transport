"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bus, Building2, User, Lock, ArrowLeft, ShieldAlert, Sparkles, ShieldCheck, Route } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
} from "@/components/ui/field";

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 md:p-10 dark:bg-slate-950 dir-rtl">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0 border-slate-200/80 shadow-2xl dark:border-slate-800">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
              <FieldGroup className="gap-5">
                {/* Header */}
                <div className="flex flex-col items-start gap-2 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
                      <Bus className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">مسارات SaaS</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    مرحباً بعودتك
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل كود المؤسسة وبيانات الحساب لتسجيل الدخول
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-red-700 dark:text-red-400 text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tenant Code */}
                <Field>
                  <FieldLabel htmlFor="tenantCode" className="text-slate-700 dark:text-slate-300">
                    كود المؤسسة (Tenant Code)
                  </FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <Input
                      id="tenantCode"
                      type="text"
                      required
                      placeholder="مثال: KSU"
                      value={tenantCode}
                      onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                      className="bg-slate-50 dark:bg-slate-800/50 pr-10 font-mono text-sm focus-visible:border-blue-600"
                    />
                  </div>
                </Field>

                {/* Username */}
                <Field>
                  <FieldLabel htmlFor="userName" className="text-slate-700 dark:text-slate-300">
                    اسم المستخدم
                  </FieldLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      id="userName"
                      type="text"
                      required
                      placeholder="اسم المستخدم"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 pr-10 text-sm focus-visible:border-blue-600"
                    />
                  </div>
                </Field>

                {/* Password */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-slate-700 dark:text-slate-300">
                      كلمة المرور
                    </FieldLabel>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/50 pr-10 text-sm focus-visible:border-blue-600"
                    />
                  </div>
                </Field>

                {/* Submit Button */}
                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 text-sm font-medium transition-all"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>تسجيل الدخول</span>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </>
                    )}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white dark:*:data-[slot=field-separator-content]:bg-slate-900 text-xs">
                  تجربة سريعة (Demo)
                </FieldSeparator>

                {/* Demo Accounts */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoFill("KSU", "ksu_admin", "admin123")}
                    className="text-xs h-9 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    مدير جامعة KSU
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoFill("SYSTEM", "superadmin", "admin123")}
                    className="text-xs h-9 border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
                  >
                    Super Admin
                  </Button>
                </div>
              </FieldGroup>
            </form>

            {/* Visual Side Banner (login-04 style hero panel) */}
            <div className="relative hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 md:flex flex-col justify-between text-white overflow-hidden">
              {/* Background decorative shapes */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-blue-100 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  النظام السحابي ذكي 100%
                </span>
              </div>

              {/* Main Banner Content */}
              <div className="relative z-10 my-auto space-y-6 py-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">
                    إدارة شمولية للنقل الجامعي والمؤسسي
                  </h2>
                  <p className="text-xs text-blue-100/80 leading-relaxed">
                    منصة مسارات تمكن المؤسسات والجامعات من تنظيم الرحلات، متابعة الحافلات والسائقين، وإدارة اشتراكات الطلاب بسهولة ودقة عالية.
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-xs">
                    <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-300">
                      <Route className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">تتبع وتنسيق المسارات</div>
                      <div className="text-[11px] text-blue-200/70">جدولة وتحديث مسارات الحافلات مباشرة</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-xs">
                    <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">عزل وبيانات آمنة (Multi-Tenant)</div>
                      <div className="text-[11px] text-blue-200/70">حماية كاملة لبيانات كل مؤسسة على حدة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="relative z-10 text-[11px] text-blue-200/60 border-t border-white/10 pt-4 flex justify-between items-center">
                <span>© {new Date().getFullYear()} مسارات SaaS</span>
                <span>جميع الحقوق محفوظة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

