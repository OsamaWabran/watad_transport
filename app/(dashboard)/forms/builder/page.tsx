"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FormBuilderPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("passenger_registration");
  const [isActive, setIsActive] = useState(true);
  
  const [fields, setFields] = useState<any[]>([]);
  const [lookupTypes, setLookupTypes] = useState<any[]>([]);

  import("react").then(({ useEffect }) => {
    useEffect(() => {
      fetch("/api/v1/lookups/types?tenant_id=c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6")
        .then(res => res.json())
        .then(json => {
          if (json.success) setLookupTypes(json.data);
        })
        .catch(console.error);
    }, []);
  });

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
          purpose,
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
    <div className="p-8 max-w-4xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">منشئ النماذج</h1>
        <p className="text-gray-500">قم بإنشاء وتخصيص نماذج التسجيل الخاصة بمؤسستك</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات النموذج</CardTitle>
          <CardDescription>المعلومات الأساسية للنموذج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان النموذج</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: استمارة تسجيل الركاب 2026" />
          </div>
          <div className="space-y-2">
            <Label>الوصف (اختياري)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف قصير للنموذج" />
          </div>
          <div className="space-y-2">
            <Label>الغرض من النموذج</Label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="passenger_registration">تسجيل الركاب (الطلاب/الموظفين)</option>
              <option value="driver_registration">تسجيل السائقين</option>
              <option value="employee_registration">تسجيل الموظفين (إداري)</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse pt-2">
            <input 
              type="checkbox" 
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="form-active"
            />
            <Label htmlFor="form-active">النموذج مفعل (يستقبل الاستجابات)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>حقول النموذج (الأسئلة)</CardTitle>
          <CardDescription>قم بإضافة الحقول الديناميكية للنموذج</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, idx) => (
            <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative space-y-4">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 left-2"
                onClick={() => removeField(field.id)}
              >
                حذف
              </Button>
              <h3 className="font-semibold text-gray-700">حقل #{idx + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نص السؤال</Label>
                  <Input value={field.field_label} onChange={e => updateField(field.id, "field_label", e.target.value)} placeholder="مثال: ما هو تخصصك؟" />
                </div>
                
                <div className="space-y-2">
                  <Label>نوع الحقل</Label>
                  <select 
                    value={field.field_type}
                    onChange={e => updateField(field.id, "field_type", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="text">نص قصير</option>
                    <option value="number">رقم</option>
                    <option value="select">قائمة منسدلة (اختيار من متعدد)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>المفتاح البرمجي (JSON Key)</Label>
                  <Input value={field.json_key_mapping} onChange={e => updateField(field.id, "json_key_mapping", e.target.value)} placeholder="مثال: major_id" />
                </div>

                {field.field_type === "select" && (
                  <div className="space-y-2">
                    <Label>مصدر القائمة (Lookup Type)</Label>
                    <select 
                      value={field.lookup_type_id}
                      onChange={e => updateField(field.id, "lookup_type_id", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">اختر مصدر البيانات...</option>
                      {lookupTypes.map((lt: any) => (
                        <option key={lt.id} value={lt.id}>{lt.category_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2 space-x-reverse pt-8">
                  <input 
                    type="checkbox" 
                    checked={field.is_required}
                    onChange={e => updateField(field.id, "is_required", e.target.checked)}
                    id={`req-${field.id}`}
                  />
                  <Label htmlFor={`req-${field.id}`}>حقل إلزامي</Label>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addField} className="w-full border-dashed">
            + إضافة حقل جديد
          </Button>
        </CardContent>
      </Card>

      <Button onClick={saveForm} className="w-full text-lg h-12">حفظ النموذج وإصدار الرابط</Button>
    </div>
  );
}
