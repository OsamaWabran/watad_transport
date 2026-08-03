"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Share2, Eye, Trash2, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getApiErrorMessage(response: any, fallback: string) {
  return response?.error?.message || response?.message || fallback;
}
interface FormItem {
  id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  form_fields: any[];
  _count?: {
    form_responses: number;
  };
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/forms");
      const data = await res.json();
      if (data.success) {
        setForms(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleToggleActive = async (form: FormItem) => {
    try {
      const res = await fetch(`/api/v1/forms/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !form.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchForms();
      } else {
        alert(getApiErrorMessage(data, "فشل التحديث"));
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذا النموذج بكافة إجاباته؟")) return;
    try {
      const res = await fetch(`/api/v1/forms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchForms();
      } else {
        alert(getApiErrorMessage(data, "فشل الحذف"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">إدارة النماذج والاستمارات الديناميكية</h1>
          <p className="mt-1 text-sm text-slate-500">
            بناء استمارات حصر الطلاب والركاب ونشر الروابط العامة وتلقي البيانات تلقائياً
          </p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4" />
            <span>إنشاء استمارة جديدة</span>
          </Button>
        </Link>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">جاري تحميل الاستمارات...</div>
      ) : forms.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد استمارات مضافة بعد</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            قم بإنشاء نموذج جديد لحصر بيانات الركاب والطلاب وربط الإجابات بقاعدة البيانات مباشرة.
          </p>
          <Link href="/dashboard/forms/new" className="inline-block mt-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">إنشاء نموذج الآن</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((f) => {
            const publicUrl = `/forms/${f.id}`;
            return (
              <div
                key={f.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg text-slate-900 leading-snug">{f.title}</h3>
                    <Badge
                      variant={f.is_active ? "default" : "secondary"}
                      className={
                        f.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {f.is_active ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> مفعّل
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> غير مفعّل
                        </span>
                      )}
                    </Badge>
                  </div>

                  {f.description && (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {f.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div>
                      الحقول الديناميكية: <span className="font-bold text-slate-700">{f.form_fields?.length || 0}</span>
                    </div>
                    <div>
                      الإجابات المستلمة:{" "}
                      <span className="font-bold text-blue-600">{f._count?.form_responses || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPublicLink(f.id)}
                      className="flex-1 gap-1.5 text-xs text-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId === f.id ? "تم النسخ!" : "نسخ الرابط العام"}
                    </Button>

                    <Link href={publicUrl} target="_blank" className="inline-block">
                      <Button variant="outline" size="sm" className="px-2 text-slate-600 hover:text-blue-600">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/dashboard/forms/${f.id}/responses`} className="flex-1">
                      <Button size="sm" className="w-full gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs">
                        <Eye className="w-3.5 h-3.5" />
                        عرض الإجابات ({f._count?.form_responses || 0})
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(f)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      {f.is_active ? "إيقاف" : "تفعيل"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(f.id)}
                      className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
