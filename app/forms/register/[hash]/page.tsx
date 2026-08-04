"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
      } catch (err) {
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
        setSuccess(json.message);
        setForm(null); // Hide form on success
      } else {
        setError(json.error?.message || "فشل إرسال النموذج");
      }
    } catch (err) {
      setError("تعذر إرسال النموذج");
    }
  };

  if (loading) return <div className="p-8 text-center" dir="rtl">جاري تحميل النموذج...</div>;
  if (error && !form) return <div className="p-8 text-center text-red-500" dir="rtl">{error}</div>;
  if (success) return <div className="p-8 text-center text-green-600 font-bold text-xl" dir="rtl">{success}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{form?.title}</h1>
        {form?.description && <p className="text-gray-600 mb-6">{form.description}</p>}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form?.purpose === 'passenger_registration' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">البيانات الأساسية</h2>
              
              <div className="space-y-2">
                <Label>الاسم الرباعي <span className="text-red-500">*</span></Label>
                <Input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>رقم الجوال <span className="text-red-500">*</span></Label>
                <Input required type="tel" value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>الجنس <span className="text-red-500">*</span></Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.gender} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
          )}

          {form?.form_fields?.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">تفاصيل إضافية</h2>
              
              {form.form_fields.map((field: any) => (
                <div key={field.id} className="space-y-2">
                  <Label>{field.field_label} {field.is_required && <span className="text-red-500">*</span>}</Label>
                  
                  {field.field_type === "text" && (
                    <Input 
                      required={field.is_required} 
                      onChange={e => setDynamicData({...dynamicData, [field.json_key_mapping]: e.target.value})}
                    />
                  )}
                  
                  {field.field_type === "number" && (
                    <Input 
                      type="number"
                      required={field.is_required} 
                      onChange={e => setDynamicData({...dynamicData, [field.json_key_mapping]: Number(e.target.value)})}
                    />
                  )}

                  {field.field_type === "select" && (
                    <select 
                      required={field.is_required}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      onChange={e => setDynamicData({...dynamicData, [field.json_key_mapping]: e.target.value})}
                    >
                      <option value="">اختر...</option>
                      {field.lookup_type?.lookup_values?.map((val: any) => (
                        <option key={val.id} value={val.id}>{val.value_name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-lg mt-8">إرسال الطلب</Button>
        </form>
      </div>
    </div>
  );
}
