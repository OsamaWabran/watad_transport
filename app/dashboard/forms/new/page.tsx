"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2, MoveUp, MoveDown, Save, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxField, FormField, FormSection } from "@/components/ui/form-layout";

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
  const [purposeType, setPurposeType] = useState("passenger_registration");
  const [customPurpose, setCustomPurpose] = useState("");
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
          purpose: purposeType === "other" ? customPurpose : purposeType,
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
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#404943] hover:bg-[#f3f3f6]">
            <ArrowRight className="w-4 h-4 ml-1" />
            عودة للنماذج
          </Button>
          <h1 className="text-2xl font-extrabold text-[#1a1c1e]">باني النماذج الديناميكية</h1>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="gap-2 rounded-xl bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36]"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "جاري الحفظ..." : "حفظ ونشر النموذج"}</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details Card */}
        <FormSection
          title={
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003422]" />
              بيانات النموذج الأساسية
            </span>
          }
        >
          <FormField label="عنوان النموذج / الاستمارة" htmlFor="title" required>
            <Input
              id="title"
              placeholder="مثال: استمارة حصر طلاب النقل الجامعي - الفصل الأول"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="وصف الاستمارة والتعليمات" htmlFor="description">
            <Textarea
              id="description"
              rows={3}
              placeholder="أدخل وصفاً توضيحياً أو إرشادات للطلاب والركاب أثناء تعبئة الاستمارة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField label="الغرض من النموذج" htmlFor="purpose">
            <Select
              id="purpose"
              value={purposeType}
              onChange={(e) => setPurposeType(e.target.value)}
            >
              <option value="passenger_registration">نموذج تسجيل ركاب (مع بيانات أساسية)</option>
              <option value="other">نموذج مخصص (أغراض أخرى)</option>
            </Select>
            {purposeType === "other" && (
              <Input 
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                placeholder="أدخل الغرض من النموذج (مثال: تقييم خدمة، تسجيل سائق، إلخ...)"
                className="mt-2"
              />
            )}
          </FormField>

          <CheckboxField label="تفعيل النموذج فوراً لتلقي الإجابات العامة">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-[#c0c9c2] text-[#003422] focus:ring-[#003422]"
            />
          </CheckboxField>
        </FormSection>

        {/* Dynamic Fields Builder */}
        <FormSection className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#eeeef0]">
            <div>
              <h3 className="font-bold text-[#1a1c1e] text-lg">الحقول الديناميكية الإضافية</h3>
              <p className="text-xs text-[#707973]">
                (ملاحظة: حقول اسم الطالب، رقم التواصل، الجنس، والمحطات مدمجة تلقائياً في رابط التعبئة العامة)
              </p>
            </div>
            <Button
              type="button"
              onClick={addField}
              variant="outline"
              size="sm"
              className="gap-1.5 text-[#003422] border-[#99d3b6] hover:bg-[#e7f8ef]"
            >
              <Plus className="w-4 h-4" />
              إضافة حقل جديد
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 p-4 rounded-lg border border-[#e2e2e5] bg-[#f3f3f6]/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="grid grid-cols-1 gap-3 flex-1 sm:grid-cols-12">
                  <FormField label="اسم الحقل (Field Label)" className="sm:col-span-4">
                    <Input
                      placeholder="مثال: رقم القيد / الكلية"
                      value={field.field_label}
                      onChange={(e) => updateField(idx, "field_label", e.target.value)}
                    />
                  </FormField>

                  <FormField label="نوع الحقل" className="sm:col-span-3">
                    <Select
                      className="bg-white"
                      value={field.field_type}
                      onChange={(e) => updateField(idx, "field_type", e.target.value as any)}
                    >
                      <option value="text">نص (Text)</option>
                      <option value="number">رقم (Number)</option>
                      <option value="select">قائمة منسدلة (Single Select)</option>
                      <option value="multiselect">خيارات متعددة (Multi Select)</option>
                    </Select>
                  </FormField>

                  {(field.field_type === "select" || field.field_type === "multiselect") && (
                    <FormField label="ربط بالقائمة المرجعية (Lookup Category)" className="sm:col-span-5">
                      <Select
                        className="bg-white"
                        value={field.lookup_type_id}
                        onChange={(e) => updateField(idx, "lookup_type_id", e.target.value)}
                      >
                        <option value="">-- اختر الفئة المرجعية --</option>
                        {lookupTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.category_code}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  )}

                  <CheckboxField label="حقل إجباري التعبئة" className="sm:col-span-12">
                    <input
                      type="checkbox"
                      id={`req_${idx}`}
                      checked={field.is_required}
                      onChange={(e) => updateField(idx, "is_required", e.target.checked)}
                      className="w-4 h-4 rounded border-[#c0c9c2] text-[#003422] focus:ring-[#003422]"
                    />
                  </CheckboxField>
                </div>

                <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-r border-[#e2e2e5] pt-3 sm:pt-0 sm:pr-3 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-[#707973] hover:text-[#404943]"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(idx, "down")}
                    disabled={idx === fields.length - 1}
                    className="p-1 text-[#707973] hover:text-[#404943]"
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
        </FormSection>
      </form>
    </div>
  );
}
