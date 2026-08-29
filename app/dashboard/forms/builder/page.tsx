"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CheckboxField, FormField } from "@/components/ui/form-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FormBuilderPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purposeType, setPurposeType] = useState("passenger_registration");
  const [customPurpose, setCustomPurpose] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [fields, setFields] = useState<any[]>([]);
  const [lookupTypes, setLookupTypes] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/lookups/types?tenant_id=c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLookupTypes(json.data);
      })
      .catch(console.error);
  }, []);

  const addField = () => {
    setFields([...fields, { 
      id: Date.now(),
      field_label: "", 
      field_type: "text", 
      json_key_mapping: "", 
      is_required: false,
      lookup_type_id: ""
    }]);
  };

  const updateField = (id: number, key: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const saveForm = async () => {
    try {
      const res = await fetch("/api/v1/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: "c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6", // Example hardcoded for MVP
          title,
          description,
          purpose: purposeType === "other" ? customPurpose : purposeType,
          is_active: isActive,
          fields: fields.map((f, i) => ({
            field_label: f.field_label,
            field_type: f.field_type,
            json_key_mapping: f.json_key_mapping,
            is_required: f.is_required,
            lookup_type_id: f.field_type === "select" ? (f.lookup_type_id || null) : null,
            sort_order: i
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        alert("تم إنشاء النموذج بنجاح. الرابط: /forms/register/" + json.data.public_link_hash);
      } else {
        alert("فشل إنشاء النموذج: " + json.error?.message);
      }
    } catch (e) {
      alert("تعذر الاتصال بالخادم");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
      <div className="rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
        <h1 className="text-3xl font-bold text-[#1a1c1e]">منشئ النماذج</h1>
        <p className="mt-1 text-sm text-[#707973]">قم بإنشاء وتخصيص نماذج التسجيل الخاصة بمؤسستك</p>
      </div>

      <Card className="rounded-2xl border-transparent bg-white shadow-enterprise">
        <CardHeader>
          <CardTitle>إعدادات النموذج</CardTitle>
          <CardDescription>المعلومات الأساسية للنموذج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="عنوان النموذج">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: استمارة تسجيل الركاب 2026" />
          </FormField>
          <FormField label="الوصف">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف قصير للنموذج" />
          </FormField>
          <FormField label="الغرض من النموذج">
            <Select
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
              />
            )}
          </FormField>
          <CheckboxField label="النموذج مفعل" hint="يستقبل الاستجابات العامة فور إصدار الرابط.">
            <input 
              type="checkbox" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="form-active"
              className="h-4 w-4 accent-[#003422]"
            />
          </CheckboxField>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-transparent bg-white shadow-enterprise">
        <CardHeader>
          <CardTitle>حقول النموذج (الأسئلة)</CardTitle>
          <CardDescription>قم بإضافة الحقول الديناميكية للنموذج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, idx) => (
            <div key={field.id} className="relative space-y-4 rounded-xl border border-[#e2e2e5] bg-[#f8faf9] p-4">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 left-2"
                onClick={() => removeField(field.id)}
              >
                حذف
              </Button>
              <h3 className="font-semibold text-[#404943]">حقل #{idx + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="نص السؤال">
                  <Input value={field.field_label} onChange={e => updateField(field.id, "field_label", e.target.value)} placeholder="مثال: ما هو تخصصك؟" />
                </FormField>
                
                <FormField label="نوع الحقل">
                  <Select 
                    value={field.field_type}
                    onChange={e => updateField(field.id, "field_type", e.target.value)}
                    className="bg-white"
                  >
                    <option value="text">نص قصير</option>
                    <option value="number">رقم</option>
                    <option value="select">قائمة منسدلة (اختيار من متعدد)</option>
                  </Select>
                </FormField>

                <FormField label="المفتاح البرمجي (JSON Key)">
                  <Input value={field.json_key_mapping} onChange={e => updateField(field.id, "json_key_mapping", e.target.value)} placeholder="مثال: major_id" />
                </FormField>

                {field.field_type === "select" && (
                  <FormField label="مصدر القائمة (Lookup Type)">
                    <Select 
                      value={field.lookup_type_id}
                      onChange={e => updateField(field.id, "lookup_type_id", e.target.value)}
                      className="bg-white"
                    >
                      <option value="">اختر مصدر البيانات...</option>
                      {lookupTypes.map((lt: any) => (
                        <option key={lt.id} value={lt.id}>{lt.category_name}</option>
                      ))}
                    </Select>
                  </FormField>
                )}

                <CheckboxField label="حقل إلزامي">
                  <input 
                    type="checkbox" 
                    checked={field.is_required}
                    onChange={e => updateField(field.id, "is_required", e.target.checked)}
                    id={`req-${field.id}`}
                    className="h-4 w-4 accent-[#003422]"
                  />
                </CheckboxField>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addField} className="w-full rounded-xl border-dashed border-[#99d3b6] text-[#003422] hover:bg-[#e7f8ef]">
            + إضافة حقل جديد
          </Button>
        </CardContent>
      </Card>

      <Button onClick={saveForm} className="h-12 w-full rounded-xl bg-[#003422] text-lg text-white hover:bg-[#0f4c36]">حفظ النموذج وإصدار الرابط</Button>
    </div>
  );
}
