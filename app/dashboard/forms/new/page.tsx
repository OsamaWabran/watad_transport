"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2, MoveUp, MoveDown, Save, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getApiErrorMessage(response: any, fallback: string) {
  return response?.error?.message || response?.message || fallback;
}
interface LookupTypeItem {
  id: string;
  category_code: string;
}

interface FormFieldItem {
  field_label: string;
  field_type: "text" | "number" | "select" | "multiselect";
  is_required: boolean;
  lookup_type_id: string;
}

export default function NewFormPage() {
  const router = useRouter();
  const [lookupTypes, setLookupTypes] = useState<LookupTypeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<FormFieldItem[]>([
    {
      field_label: "الكلية / التخصص",
      field_type: "select",
      is_required: true,
      lookup_type_id: "",
    },
  ]);

  useEffect(() => {
    const fetchLookupTypes = async () => {
      try {
        const res = await fetch("/api/v1/lookups/types");
        const data = await res.json();
        if (data.success) {
          setLookupTypes(data.data);
          if (data.data.length > 0) {
            // default first lookup type
            setFields((prev) =>
              prev.map((f) => ({
                ...f,
                lookup_type_id: f.lookup_type_id || data.data[0].id,
              }))
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLookupTypes();
  }, []);

  const addField = () => {
    setFields([
      ...fields,
      {
        field_label: "",
        field_type: "text",
        is_required: false,
        lookup_type_id: lookupTypes[0]?.id || "",
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FormFieldItem, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("الرجاء إدخال عنوان النموذج");
      return;
    }
    if (fields.length === 0) {
      alert("الرجاء إضافة حقل واحد على الأقل للنموذج");
      return;
    }

    // Validate fields
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].field_label.trim()) {
        alert(`الحقل رقم ${i + 1} يتطلب اسماً (Label)`);
        return;
      }
      if (
        (fields[i].field_type === "select" || fields[i].field_type === "multiselect") &&
        !fields[i].lookup_type_id
      ) {
        alert(`الحقل رقم ${i + 1} يتطلب تحديد قائمة مرجعية (Lookup Category)`);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          is_active: isActive,
          fields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/forms");
      } else {
        alert(getApiErrorMessage(data, "حدث خطأ أثناء حفظ النموذج"));
      }
    } catch (err) {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-600">
            <ArrowRight className="w-4 h-4 ml-1" />
            عودة للنماذج
          </Button>
          <h1 className="text-2xl font-extrabold text-slate-900">باني النماذج الديناميكية</h1>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "جاري الحفظ..." : "حفظ ونشر النموذج"}</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-800">
            <FileText className="w-5 h-5 text-blue-600" />
            بيانات النموذج الأساسية
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-slate-800">
              عنوان النموذج / الاستمارة *
            </Label>
            <Input
              id="title"
              placeholder="مثال: استمارة حصر طلاب النقل الجامعي - الفصل الأول"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-slate-800">
              وصف الاستمارة والتعليمات (اختياري)
            </Label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="أدخل وصفاً توضيحياً أو إرشادات للطلاب والركاب أثناء تعبئة الاستمارة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="is_active" className="cursor-pointer text-sm font-semibold text-slate-700">
              تفعيل النموذج فوراً لتلقي الإجابات العامة
            </Label>
          </div>
        </div>

        {/* Dynamic Fields Builder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">الحقول الديناميكية الإضافية</h3>
              <p className="text-xs text-slate-500">
                (ملاحظة: حقول اسم الطالب، رقم التواصل، الجنس، والمحطات مدمجة تلقائياً في رابط التعبئة العامة)
              </p>
            </div>
            <Button
              type="button"
              onClick={addField}
              variant="outline"
              size="sm"
              className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              إضافة حقل جديد
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="grid grid-cols-1 gap-3 flex-1 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <Label className="text-xs text-slate-600 font-semibold mb-1 block">
                      اسم الحقل (Field Label)
                    </Label>
                    <Input
                      placeholder="مثال: رقم القيد / الكلية"
                      value={field.field_label}
                      onChange={(e) => updateField(idx, "field_label", e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Label className="text-xs text-slate-600 font-semibold mb-1 block">نوع الحقل</Label>
                    <select
                      className="w-full h-10 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                      value={field.field_type}
                      onChange={(e) => updateField(idx, "field_type", e.target.value as any)}
                    >
                      <option value="text">نص (Text)</option>
                      <option value="number">رقم (Number)</option>
                      <option value="select">قائمة منسدلة (Single Select)</option>
                      <option value="multiselect">خيارات متعددة (Multi Select)</option>
                    </select>
                  </div>

                  {(field.field_type === "select" || field.field_type === "multiselect") && (
                    <div className="sm:col-span-5">
                      <Label className="text-xs text-slate-600 font-semibold mb-1 block">
                        ربط بالقائمة المرجعية (Lookup Category)
                      </Label>
                      <select
                        className="w-full h-10 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
                        value={field.lookup_type_id}
                        onChange={(e) => updateField(idx, "lookup_type_id", e.target.value)}
                      >
                        <option value="">-- اختر الفئة المرجعية --</option>
                        {lookupTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.category_code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-12 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`req_${idx}`}
                      checked={field.is_required}
                      onChange={(e) => updateField(idx, "is_required", e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`req_${idx}`} className="cursor-pointer text-xs font-medium text-slate-600">
                      حقل إجباري التعبئة
                    </Label>
                  </div>
                </div>

                <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-r border-slate-200 pt-3 sm:pt-0 sm:pr-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(idx, "down")}
                    disabled={idx === fields.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(idx)}
                    className="p-1 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
