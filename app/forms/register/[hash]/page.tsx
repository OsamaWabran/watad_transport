"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, Bus, CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicFormPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    gender: "male",
  });
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/v1/forms/public/${hash}`);
        const json = await res.json();
        if (json.success) {
          setForm(json.data);
        } else {
          setError(json.error?.message || "حدث خطأ");
        }
      } catch {
        setError("تعذر الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/v1/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_hash: hash,
          registration_source: "form",
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          gender: formData.gender,
          answers: dynamicData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(json.message || "تم إرسال الطلب بنجاح");
        setForm(null);
      } else {
        setError(json.error?.message || "فشل إرسال النموذج");
      }
    } catch {
      setError("تعذر إرسال النموذج");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-[#707973] shadow-enterprise">
          جاري تحميل النموذج...
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-enterprise">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-xl font-bold text-[#1a1c1e]">تعذر فتح النموذج</h1>
          <p className="text-sm text-[#404943]">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#99d3b6] bg-white p-8 text-center shadow-enterprise">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b4efd1] text-[#005228]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-[#1a1c1e]">{success}</h1>
          <p className="text-sm leading-relaxed text-[#404943]">تم حفظ بياناتك وإرسالها للإدارة بنجاح.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] px-4 py-10" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_8%,rgb(153_211_182_/_0.22),transparent_26rem),radial-gradient(circle_at_10%_92%,rgb(74_225_131_/_0.14),transparent_24rem)]" />
      <div className="relative mx-auto w-full max-w-2xl space-y-6">
        <div className="rounded-[24px] border border-[#c0c9c2]/40 bg-white p-6 shadow-enterprise">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003422] text-white shadow-enterprise">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#005228]">نظام مسارات للنقل</p>
              <h1 className="text-2xl font-black text-[#1a1c1e]">{form?.title}</h1>
            </div>
          </div>
          {form?.description && (
            <p className="mt-4 border-t border-[#eeeef0] pt-4 text-sm leading-relaxed text-[#404943]">
              {form.description}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form?.purpose === "passenger_registration" && (
            <section className="space-y-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
              <h2 className="border-b border-[#eeeef0] pb-2 text-base font-extrabold text-[#1a1c1e]">
                البيانات الأساسية
              </h2>
              <div className="space-y-2">
                <Label className="text-[#404943]">
                  الاسم الرباعي <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="border-0 bg-[#f3f3f6] focus-visible:ring-[#003422]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#404943]">
                  رقم الجوال <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="border-0 bg-[#f3f3f6] focus-visible:ring-[#003422]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#404943]">
                  الجنس <span className="text-red-500">*</span>
                </Label>
                <select
                  className="h-10 w-full rounded-lg border-0 bg-[#f3f3f6] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#003422]"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </section>
          )}

          {form?.form_fields?.length > 0 && (
            <section className="space-y-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
              <h2 className="border-b border-[#eeeef0] pb-2 text-base font-extrabold text-[#1a1c1e]">
                تفاصيل إضافية
              </h2>
              {form.form_fields.map((field: any) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-[#404943]">
                    {field.field_label} {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  {field.field_type === "text" && (
                    <Input
                      required={field.is_required}
                      className="border-0 bg-[#f3f3f6] focus-visible:ring-[#003422]"
                      onChange={(e) => setDynamicData({ ...dynamicData, [field.json_key_mapping]: e.target.value })}
                    />
                  )}
                  {field.field_type === "number" && (
                    <Input
                      type="number"
                      required={field.is_required}
                      className="border-0 bg-[#f3f3f6] focus-visible:ring-[#003422]"
                      onChange={(e) => setDynamicData({ ...dynamicData, [field.json_key_mapping]: Number(e.target.value) })}
                    />
                  )}
                  {field.field_type === "select" && (
                    <select
                      required={field.is_required}
                      className="h-10 w-full rounded-lg border-0 bg-[#f3f3f6] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#003422]"
                      onChange={(e) => setDynamicData({ ...dynamicData, [field.json_key_mapping]: e.target.value })}
                    >
                      <option value="">اختر...</option>
                      {field.lookup_type?.lookup_values?.map((val: any) => (
                        <option key={val.id} value={val.id}>
                          {val.value_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </section>
          )}

          <Button type="submit" className="h-12 w-full rounded-xl bg-[#003422] text-base font-bold text-white shadow-enterprise hover:bg-[#0f4c36]">
            <Send className="h-5 w-5" />
            إرسال الطلب
          </Button>
        </form>
      </div>
    </div>
  );
}
