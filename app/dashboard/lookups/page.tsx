"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Layers, Trash2, Edit, FolderPlus, CheckCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormBody, FormField } from "@/components/ui/form-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function getApiErrorMessage(response: any, fallback: string) {
  return response?.error?.message || response?.message || fallback;
}
interface LookupValueItem {
  id: string;
  category_id: string;
  tenant_id?: string | null;
  value_name: string;
  parent_value_id?: string | null;
  lookup_type?: {
    id: string;
    category_code: string;
    category_name: string;
  };
  parent?: {
    id: string;
    value_name: string;
    lookup_type?: {
      category_code: string;
      category_name: string;
    };
  } | null;
  children?: LookupValueItem[];
}

interface LookupTypeItem {
  id: string;
  category_code: string;
  category_name: string;
  is_system_defined: boolean;
  tenant_id?: string | null;
  lookup_values: LookupValueItem[];
}

export default function LookupsPage() {
  const [types, setTypes] = useState<LookupTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<LookupTypeItem | null>(null);

  // Type modal
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ category_code: "", category_name: "" });
  const [typeEditId, setTypeEditId] = useState<string | null>(null);

  // Value modal
  const [valueModalOpen, setValueModalOpen] = useState(false);
  const [valueForm, setValueForm] = useState({ value_name: "", parent_value_id: "" });
  const [valueEditId, setValueEditId] = useState<string | null>(null);

  const allLookupValues = types.flatMap((type) =>
    type.lookup_values.map((value) => ({
      ...value,
      lookup_type: value.lookup_type || {
        id: type.id,
        category_code: type.category_code,
        category_name: type.category_name,
      },
    }))
  );

  const getParentLabel = (parentId?: string | null) => {
    if (!parentId) return null;
    const parent = allLookupValues.find((value) => value.id === parentId);
    if (!parent) return "قيمة أب غير متاحة";
    return `${parent.value_name} - ${parent.lookup_type?.category_name || parent.lookup_type?.category_code}`;
  };

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/lookups/types");
      const data = await res.json();
      if (data.success) {
        setTypes(data.data);
        if (data.data.length > 0 && !selectedType) {
          setSelectedType(data.data[0]);
        } else if (selectedType) {
          const updated = data.data.find((t: LookupTypeItem) => t.id === selectedType.id);
          setSelectedType(updated || data.data[0] || null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Submit Type
  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = typeEditId
        ? `/api/v1/lookups/types/${typeEditId}`
        : "/api/v1/lookups/types";
      const method = typeEditId ? "PUT" : "POST";
      const existingType = typeEditId ? types.find((type) => type.id === typeEditId) : null;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...typeForm,
          ...(typeEditId ? { tenant_id: existingType?.tenant_id ?? null } : {}),
        }),
      });
      const result = await res.json();
      if (result.success) {
        setTypeModalOpen(false);
        setTypeForm({ category_code: "", category_name: "" });
        setTypeEditId(null);
        await fetchTypes();
      } else {
        alert(getApiErrorMessage(result, "حدث خطأ أثناء الحفظ"));
      }
    } catch (err) {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذه الفئة المرجعية؟")) return;
    try {
      const type = types.find((item) => item.id === id);
      const query = type?.tenant_id ? `?tenant_id=${encodeURIComponent(type.tenant_id)}` : "";
      const res = await fetch(`/api/v1/lookups/types/${id}${query}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        if (selectedType?.id === id) setSelectedType(null);
        await fetchTypes();
      } else {
        alert(getApiErrorMessage(result, "تعذر الحذف"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Submit Value
  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    try {
      const url = valueEditId
        ? `/api/v1/lookups/values/${valueEditId}`
        : "/api/v1/lookups/values";
      const method = valueEditId ? "PUT" : "POST";
      const existingValue = valueEditId
        ? allLookupValues.find((value) => value.id === valueEditId)
        : null;
      const body = valueEditId
        ? {
            tenant_id: existingValue?.tenant_id ?? null,
            value_name: valueForm.value_name,
            parent_value_id: valueForm.parent_value_id || null,
          }
        : {
            category_id: selectedType.id,
            tenant_id: selectedType.tenant_id ?? null,
            value_name: valueForm.value_name,
            parent_value_id: valueForm.parent_value_id || null,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        setValueModalOpen(false);
        setValueForm({ value_name: "", parent_value_id: "" });
        setValueEditId(null);
        await fetchTypes();
      } else {
        alert(getApiErrorMessage(result, "حدث خطأ أثناء حفظ القيمة"));
      }
    } catch (err) {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeleteValue = async (id: string) => {
    if (!confirm("هل أنت تأكد من حذف هذه القيمة المرجعية؟")) return;
    try {
      const value = allLookupValues.find((item) => item.id === id);
      const query = value?.tenant_id ? `?tenant_id=${encodeURIComponent(value.tenant_id)}` : "";
      const res = await fetch(`/api/v1/lookups/values/${id}${query}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        await fetchTypes();
      } else {
        alert(getApiErrorMessage(result, "تعذر حذف القيمة"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1c1e]">إدارة البيانات المرجعية (Lookups)</h1>
          <p className="mt-1 text-sm text-[#707973]">
            تخصيص الفئات والقوائم المرجعية الديناميكية للنظام والنماذج
          </p>
          <p className="mt-1 text-xs text-[#707973]">
            تعتمد على Lookup Types و Lookup Values فقط، مع Parent Value ID للقوائم المتسلسلة.
          </p>
        </div>
        <Button
          onClick={() => {
            setTypeEditId(null);
            setTypeForm({ category_code: "", category_name: "" });
            setTypeModalOpen(true);
          }}
          className="gap-2 bg-[#003422] text-white hover:bg-[#0f4c36]"
        >
          <FolderPlus className="w-4 h-4" />
          <span>إضافة فئة مرجعية جديدة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Categories Sidebar */}
        <div className="lg:col-span-4 rounded-2xl border border-transparent bg-white p-4 shadow-enterprise">
          <div className="flex items-center justify-between pb-3 border-b border-[#eeeef0]">
            <span className="font-bold text-[#1a1c1e] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#003422]" />
              فئات البيانات
            </span>
            <Badge variant="outline">{types.length} فئات</Badge>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-[#707973]">جاري تحميل الفئات...</div>
          ) : types.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#707973]">لا توجد فئات مرجعية بعد</div>
          ) : (
            <div className="mt-3 space-y-1">
              {types.map((t) => {
                const isSelected = selectedType?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t)}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#e7f8ef] text-[#005228] border border-[#99d3b6] font-semibold"
                        : "hover:bg-[#f3f3f6] text-[#404943]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className={`w-4 h-4 ${isSelected ? "text-[#003422]" : "text-[#707973]"}`} />
                      <span className="truncate">{t.category_name}</span>
                      <span className="shrink-0 rounded bg-[#eeeef0] px-1.5 py-0.5 text-[10px] text-[#707973]">
                        {t.category_code}
                      </span>
                      {t.is_system_defined && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#eeeef0] text-[#404943]">
                          نظام
                        </Badge>
                      )}
                    </div>
                    {!t.is_system_defined && (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTypeEditId(t.id);
                            setTypeForm({
                              category_code: t.category_code,
                              category_name: t.category_name,
                            });
                            setTypeModalOpen(true);
                          }}
                          className="p-1 text-[#707973] hover:text-[#003422]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteType(t.id);
                          }}
                          className="p-1 text-[#707973] hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Category Values View */}
        <div className="lg:col-span-8 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
          {selectedType ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e2e5]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1a1c1e]">{selectedType.category_name}</h2>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {selectedType.category_code}
                    </Badge>
                    {selectedType.is_system_defined ? (
                      <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                        <ShieldAlert className="w-3 h-3" />
                        مُعرفة بالنظام
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        مستأجر خاص
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#707973]">
                    Category ID: <span className="font-mono">{selectedType.id}</span> · عدد القيم:{" "}
                    {selectedType.lookup_values.length}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setValueEditId(null);
                    setValueForm({ value_name: "", parent_value_id: "" });
                    setValueModalOpen(true);
                  }}
                  className="gap-2 bg-[#003422] text-white hover:bg-[#0f4c36]"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قيمة مرجعية</span>
                </Button>
              </div>

              {/* Values List / Tree */}
              <div className="mt-6">
                {selectedType.lookup_values.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-[#e2e2e5] rounded-xl text-[#707973]">
                    لا توجد قيم مضافة لهذه الفئة المرجعية بعد. اضغط "إضافة قيمة مرجعية" للبدء.
                  </div>
                ) : (
                  <div className="divide-y divide-[#eeeef0] rounded-lg border border-[#e2e2e5] overflow-hidden">
                    {selectedType.lookup_values.map((val) => (
                      <div key={val.id} className="flex items-center justify-between p-4 bg-white hover:bg-[#f3f3f6]">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <div>
                            <span className="font-semibold text-[#1a1c1e]">{val.value_name}</span>
                            {val.parent_value_id && (
                              <span className="mr-2 text-xs text-[#707973]">
                                تابعة لـ: {getParentLabel(val.parent_value_id)}
                              </span>
                            )}
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[#707973]">
                              <span>Value ID: {val.id}</span>
                              {val.parent_value_id && <span>Parent: {val.parent_value_id}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setValueEditId(val.id);
                              setValueForm({
                                value_name: val.value_name,
                                parent_value_id: val.parent_value_id || "",
                              });
                              setValueModalOpen(true);
                            }}
                            className="text-[#404943] hover:text-[#003422]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteValue(val.id)}
                            className="text-[#404943] hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-[#707973]">
              اختر فئة من القائمة لعرض قيمها وتعديلها
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Type */}
      <Dialog open={typeModalOpen} onOpenChange={setTypeModalOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {typeEditId ? "تعديل الفئة المرجعية" : "إضافة فئة مرجعية جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveType}>
            <FormBody>
              <FormField
                label="رمز الفئة"
                htmlFor="category_code"
                hint="مثل: COLLEGE, MAJOR, ACADEMIC_LEVEL"
                required
              >
              <Input
                id="category_code"
                placeholder="مثال: COLLEGE, MAJOR, ACADEMIC_LEVEL"
                value={typeForm.category_code}
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    category_code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  })
                }
                required
              />
              </FormField>
              <FormField label="اسم الفئة الظاهر" htmlFor="category_name" required>
              <Input
                id="category_name"
                placeholder="مثال: الكليات، التخصصات، المستويات الدراسية"
                value={typeForm.category_name}
                onChange={(e) => setTypeForm({ ...typeForm, category_name: e.target.value })}
                required
              />
              </FormField>
            </FormBody>
            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="outline" onClick={() => setTypeModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#003422] text-white hover:bg-[#0f4c36]">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Create/Edit Value */}
      <Dialog open={valueModalOpen} onOpenChange={setValueModalOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {valueEditId ? "تعديل القيمة المرجعية" : `إضافة قيمة لـ (${selectedType?.category_code})`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveValue}>
            <FormBody>
              <FormField label="اسم القيمة المرجعية" htmlFor="value_name" required>
              <Input
                id="value_name"
                placeholder="مثال: كلية الهندسة / الظهران..."
                value={valueForm.value_name}
                onChange={(e) => setValueForm({ ...valueForm, value_name: e.target.value })}
                required
              />
              </FormField>

              <FormField
                label="القيمة الأب"
                htmlFor="parent_value_id"
                hint='مثال: اجعل تخصص "تقنية المعلومات" تابعاً لقيمة "كلية الحاسبات".'
              >
              <Select
                id="parent_value_id"
                value={valueForm.parent_value_id}
                onChange={(e) => setValueForm({ ...valueForm, parent_value_id: e.target.value })}
              >
                <option value="">-- بدون أب (مستوى رئيسي) --</option>
                {allLookupValues
                  .filter((v) => v.id !== valueEditId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value_name} - {v.lookup_type?.category_name || v.lookup_type?.category_code}
                    </option>
                  ))}
              </Select>
              </FormField>
            </FormBody>

            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="outline" onClick={() => setValueModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#003422] text-white hover:bg-[#0f4c36]">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
