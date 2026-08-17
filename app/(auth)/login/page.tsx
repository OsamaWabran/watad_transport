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
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#f8faf9] p-4 sm:p-6 md:p-10 dir-rtl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgb(153_211_182_/_0.24),transparent_26rem),radial-gradient(circle_at_10%_90%,rgb(74_225_131_/_0.18),transparent_24rem)]" />
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="relative overflow-hidden rounded-[24px] border-[#c0c9c2]/40 bg-white/95 p-0 shadow-enterprise backdrop-blur">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex flex-col justify-between bg-white p-6 md:p-10">
              <FieldGroup className="gap-5">
                {/* Header */}
                <div className="flex flex-col items-start gap-2 text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003422] text-white shadow-enterprise">
                      <Bus className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-[#003422]">مسارات SaaS</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#1a1c1e]">
                    مرحباً بعودتك
                  </h1>
                  <p className="text-xs text-[#707973]">
                    أدخل كود المؤسسة وبيانات الحساب لتسجيل الدخول
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#ffdad6] bg-[#ffdad6]/55 p-3.5 text-xs text-[#93000a]">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tenant Code */}
                <Field>
                  <FieldLabel htmlFor="tenantCode" className="text-[#1a1c1e]">
                    كود المؤسسة (Tenant Code)
                  </FieldLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#707973]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <Input
                      id="tenantCode"
                      type="text"
                      required
                      placeholder="مثال: KSU"
                      value={tenantCode}
                      onChange={(e) => setTenantCode(e.target.value.toUpperCase())}
                      className="rounded-lg border-0 bg-[#f3f3f6] pr-10 font-mono text-sm focus-visible:ring-[#003422]"
                    />
                  </div>
                </Field>

                {/* Username */}
                <Field>
                  <FieldLabel htmlFor="userName" className="text-[#1a1c1e]">
                    اسم المستخدم
                  </FieldLabel>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#707973]">
                      <User className="w-4 h-4" />
                    </div>
                    <Input
                      id="userName"
                      type="text"
                      required
                      placeholder="اسم المستخدم"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="rounded-lg border-0 bg-[#f3f3f6] pr-10 text-sm focus-visible:ring-[#003422]"
                    />
                  </div>
                </Field>

                {/* Password */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password" className="text-[#1a1c1e]">
                      كلمة المرور
                    </FieldLabel>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#707973]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-lg border-0 bg-[#f3f3f6] pr-10 text-sm focus-visible:ring-[#003422]"
                    />
                  </div>
                </Field>

                {/* Submit Button */}
                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-full bg-[#003422] text-sm font-bold text-white shadow-enterprise transition-all hover:-translate-y-0.5 hover:bg-[#0f4c36]"
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

                <FieldSeparator className="text-xs *:data-[slot=field-separator-content]:bg-white">
                  تجربة سريعة (Demo)
                </FieldSeparator>

                {/* Demo Accounts */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoFill("KSU", "ksu_admin", "admin123")}
                    className="h-9 rounded-lg border-[#99d3b6] bg-[#e7f8ef] text-xs text-[#005228] hover:bg-[#b4efd1]/70"
                  >
                    مدير جامعة KSU
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoFill("SYSTEM", "superadmin", "admin123")}
                    className="h-9 rounded-lg border-[#c0c9c2] bg-white text-xs text-[#003422] hover:bg-[#f3f3f6]"
                  >
                    Super Admin
                  </Button>
                </div>
              </FieldGroup>
            </form>

            {/* Visual Side Banner (login-04 style hero panel) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#003422] to-[#006d37] p-8 text-white md:flex">
              {/* Background decorative shapes */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#6bfe9c]" />
                  النظام السحابي ذكي 100%
                </span>
              </div>

              {/* Main Banner Content */}
              <div className="relative z-10 my-auto space-y-6 py-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">
                    إدارة شمولية للنقل الجامعي والمؤسسي
                  </h2>
                  <p className="text-xs leading-relaxed text-white/82">
                    منصة مسارات تمكن المؤسسات والجامعات من تنظيم الرحلات، متابعة الحافلات والسائقين، وإدارة اشتراكات الطلاب بسهولة ودقة عالية.
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs backdrop-blur-sm">
                    <div className="rounded-md bg-white/15 p-1.5 text-[#6bfe9c]">
                      <Route className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">تتبع وتنسيق المسارات</div>
                      <div className="text-[11px] text-white/70">جدولة وتحديث مسارات الحافلات مباشرة</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs backdrop-blur-sm">
                    <div className="rounded-md bg-white/15 p-1.5 text-[#6bfe9c]">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">عزل وبيانات آمنة (Multi-Tenant)</div>
                      <div className="text-[11px] text-white/70">حماية كاملة لبيانات كل مؤسسة على حدة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-white/65">
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

