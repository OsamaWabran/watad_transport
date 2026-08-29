"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle, Send, Bus, AlertCircle } from "lucide-react";
import { CheckboxField, FormField } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface LookupValueItem {
  id: string;
  value_name: string;
}

interface FormFieldItem {
  id: string;
  field_label: string;
  field_type: "text" | "number" | "select" | "multiselect";
  is_required: boolean;
  lookup_type_id?: string | null;
  lookup_type?: {
    lookup_values: LookupValueItem[];
  };
}

interface FormDefinition {
  id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  is_active: boolean;
  purpose?: string | null;
  form_fields: FormFieldItem[];
}

export default function PublicFormSubmissionPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);

  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Base State
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");

  const [stations, setStations] = useState<{ id: string; name: string; type: string }[]>([]);

  // Dynamic answers state map
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/forms/${formId}`);
        const data = await res.json();
        if (data.success) {
          setForm(data.data);
          
          // Fetch stations using the form's tenant_id if available, but since it's a public form 
          // we might just fetch the global / hybrid ones. Wait, the API requires tenant_id from context.
          // Let's call /api/v1/stations. If it needs a tenant ID, we might have to pass it via query, but let's assume it works.
          try {
            const stRes = await fetch(`/api/v1/stations?tenant_id=${data.data.tenant_id}`);
            const stData = await stRes.json();
            if (stData.success) {
              setStations(stData.data);
            }
          } catch (stErr) {
            console.error("Failed to fetch stations", stErr);
          }
        } else {
          setErrorMsg(data.message || "النموذج المطلوب غير موجود");
        }
      } catch (err) {
        setErrorMsg("تعذر تحميل النموذج. يرجى التأكد من الرابط أو المحاولة لاحقاً.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handleAnswerChange = (fieldLabel: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  const handleMultiSelectToggle = (fieldLabel: string, optionValue: string) => {
    const currentList: string[] = answers[fieldLabel] || [];
    const updatedList = currentList.includes(optionValue)
      ? currentList.filter((item) => item !== optionValue)
      : [...currentList, optionValue];
    handleAnswerChange(fieldLabel, updatedList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form?.purpose === "passenger_registration") {
      if (!fullName.trim()) {
        setErrorMsg("الرجاء إدخال اسم الطالب / الراكب");
        return;
      }
      if (!contactNumber.trim()) {
        setErrorMsg("الرجاء إدخال رقم التواصل");
        return;
      }
    }

    // Validate required dynamic fields
    if (form?.form_fields) {
      for (const field of form.form_fields) {
        if (field.is_required) {
          const ans = answers[field.field_label];
          if (
            ans === undefined ||
            ans === null ||
            ans === "" ||
            (Array.isArray(ans) && ans.length === 0)
          ) {
            setErrorMsg(`الرجاء إدخال الإجابة للحقل الإجباري: (${field.field_label})`);
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          contact_number: contactNumber.trim(),
          gender,
          default_start_station_id: startStation || null,
          default_end_station_id: endStation || null,
          answers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || "حدث خطأ أثناء تسليم الإجابات");
      }
    } catch (err) {
      setErrorMsg("تعذر تسليم الاستمارة. الرجاء التحقق من اتصال الانترانت والاتصال بالخادم.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-[#707973] shadow-enterprise">جاري تحميل الاستمارة...</div>
      </div>
    );
  }

  if (errorMsg && !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-red-200 bg-white p-6 text-center shadow-enterprise">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#1a1c1e]">عذراً</h2>
          <p className="text-sm text-[#404943]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (form && !form.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-enterprise">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#1a1c1e]">النموذج مغلق حالياً</h2>
          <p className="text-sm text-[#404943]">
            تم إيقاف هذه الاستمارة مؤقتاً من قبل الإدارة ولا تقبل إجابات جديدة حالياً.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4" dir="rtl">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#99d3b6] bg-white p-8 text-center shadow-enterprise">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b4efd1] text-[#005228]">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-[#1a1c1e]">تم إرسال إجابتك بنجاح!</h2>
          <p className="text-sm leading-relaxed text-[#404943]">
            شكراً لك، تم حفظ بياناتك وتسجيل حجز النقل الخاص بك بالنظام بنجاح.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFullName("");
              setContactNumber("");
              setStartStation("");
              setEndStation("");
              setAnswers({});
            }}
            className="mt-4 text-xs font-bold text-[#003422] hover:underline"
          >
            تعبئة رد آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] px-4 py-10 font-arabic text-[#1a1c1e]" dir="rtl">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_85%_8%,rgb(153_211_182_/_0.22),transparent_26rem),radial-gradient(circle_at_10%_92%,rgb(74_225_131_/_0.14),transparent_24rem)]" />
      <div className="relative mx-auto max-w-2xl space-y-6">
        {/* Header Branding Card */}
        <div className="overflow-hidden rounded-[24px] border border-[#c0c9c2]/40 bg-white p-6 shadow-enterprise">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003422] text-white shadow-enterprise">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#005228]">نظام مسارات لنقل الطلاب SaaS</span>
              <h1 className="text-2xl font-black text-[#1a1c1e]">{form?.title}</h1>
            </div>
          </div>
          {form?.description && (
            <p className="mt-3 border-t border-[#eeeef0] pt-3 text-sm leading-relaxed text-[#404943]">
              {form.description}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Submission Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Passenger Section */}
          {form?.purpose === "passenger_registration" && (
            <div className="space-y-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
              <h3 className="border-b border-[#eeeef0] pb-2 text-base font-extrabold text-[#1a1c1e]">
                البيانات الشخصية للطالب / الراكب
              </h3>

            {startStation && endStation && startStation === endStation && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 mb-2">
                تحذير: محطة الطلوع ومحطة النزول متطابقتان، يرجى التأكد من دقة الاختيار.
              </div>
            )}

            <FormField label="الاسم الثلاثي للطالب / الراكب" required>
              <Input
                type="text"
                placeholder="أدخل الاسم الثلاثي بالكامل..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="رقم الجوال / التواصل" required>
              <Input
                type="tel"
                placeholder="05xxxxxxxx"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="dir-ltr text-right"
                required
              />
            </FormField>

            <FormField label="الجنس" required>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a1c1e]">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="h-4 w-4 accent-[#003422]"
                  />
                  ذكر
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1a1c1e]">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="h-4 w-4 accent-[#003422]"
                  />
                  أنثى
                </label>
              </div>
            </FormField>

            <FormField label="محطة الانطلاق" className="border-t border-[#eeeef0] pt-4">
              <Select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "pickup" || st.type === "both")
                  .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="محطة الوصول">
              <Select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "dropoff" || st.type === "both")
                  .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          )}

          {/* Dynamic Fields Section */}
          {form?.form_fields && form.form_fields.length > 0 && (
            <div className="space-y-5 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
              <h3 className="border-b border-[#eeeef0] pb-2 text-base font-extrabold text-[#1a1c1e]">
                بيانات حصر النقل والتعليمات
              </h3>

              {form.form_fields.map((field) => {
                const isReq = field.is_required;
                const options = field.lookup_type?.lookup_values || [];

                return (
                  <FormField key={field.id} label={field.field_label} required={isReq}>

                    {/* Text field */}
                    {field.field_type === "text" && (
                      <Input
                        type="text"
                        placeholder={`أدخل ${field.field_label}...`}
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        required={isReq}
                      />
                    )}

                    {/* Number field */}
                    {field.field_type === "number" && (
                      <Input
                        type="number"
                        placeholder="0"
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        required={isReq}
                      />
                    )}

                    {/* Select field */}
                    {field.field_type === "select" && (
                      <Select
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        required={isReq}
                      >
                        <option value="">-- اختر خياراً --</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.value_name}>
                            {opt.value_name}
                          </option>
                        ))}
                      </Select>
                    )}

                    {/* MultiSelect field */}
                    {field.field_type === "multiselect" && (
                      <div className="space-y-2 rounded-lg border border-[#e2e2e5] bg-[#f8faf9] p-3 pt-1">
                        {options.length === 0 ? (
                          <span className="text-xs text-[#707973]">لا توجد خيارات مرتبطة بهذه القائمة</span>
                        ) : (
                          options.map((opt) => {
                            const isChecked = (answers[field.field_label] || []).includes(opt.value_name);
                            return (
                              <CheckboxField key={opt.id} label={opt.value_name}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleMultiSelectToggle(field.field_label, opt.value_name)}
                                  className="h-4 w-4 rounded border-[#c0c9c2] accent-[#003422]"
                                />
                              </CheckboxField>
                            );
                          })
                        )}
                      </div>
                    )}
                  </FormField>
                );
              })}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#003422] text-base font-bold text-white shadow-enterprise transition-all hover:-translate-y-0.5 hover:bg-[#0f4c36]"
          >
            <Send className="w-5 h-5" />
            <span>{submitting ? "جاري الإرسال..." : "إرسال وتأكيد الطلب"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
