"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle, Send, Bus, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="text-slate-500 font-semibold text-sm">جاري تحميل الاستمارة...</div>
      </div>
    );
  }

  if (errorMsg && !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">عذراً</h2>
          <p className="text-sm text-slate-600">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (form && !form.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">النموذج مغلق حالياً</h2>
          <p className="text-sm text-slate-600">
            تم إيقاف هذه الاستمارة مؤقتاً من قبل الإدارة ولا تقبل إجابات جديدة حالياً.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">تم إرسال إجابتك بنجاح!</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
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
            className="mt-4 text-xs font-bold text-blue-600 hover:underline"
          >
            تعبئة رد آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-arabic text-slate-900" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm border-t-8 border-t-blue-600">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600">نظام مسارات لنقل الطلاب SaaS</span>
              <h1 className="text-2xl font-black text-slate-900">{form?.title}</h1>
            </div>
          </div>
          {form?.description && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {form.description}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Submission Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Base Passenger Section */}
          {form?.purpose === "passenger_registration" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                البيانات الشخصية للطالب / الراكب
              </h3>

            {startStation && endStation && startStation === endStation && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 mb-2">
                تحذير: محطة الطلوع ومحطة النزول متطابقتان، يرجى التأكد من دقة الاختيار.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                الاسم الثلاثي للطالب / الراكب *
              </label>
              <input
                type="text"
                placeholder="أدخل الاسم الثلاثي بالكامل..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                رقم الجوال / التواصل *
              </label>
              <input
                type="tel"
                placeholder="05xxxxxxxx"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none dir-ltr text-right"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">الجنس *</label>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="w-4 h-4 text-blue-600"
                  />
                  ذكر
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="w-4 h-4 text-blue-600"
                  />
                  أنثى
                </label>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                محطة الانطلاق (اختياري)
              </label>
              <select
                value={startStation}
                onChange={(e) => setStartStation(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none bg-white"
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "pickup" || st.type === "both")
                  .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                محطة الوصول (اختياري)
              </label>
              <select
                value={endStation}
                onChange={(e) => setEndStation(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none bg-white"
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "dropoff" || st.type === "both")
                  .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          {/* Dynamic Fields Section */}
          {form?.form_fields && form.form_fields.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                بيانات حصر النقل والتعليمات
              </h3>

              {form.form_fields.map((field) => {
                const isReq = field.is_required;
                const options = field.lookup_type?.lookup_values || [];

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      {field.field_label} {isReq && <span className="text-red-500">*</span>}
                    </label>

                    {/* Text field */}
                    {field.field_type === "text" && (
                      <input
                        type="text"
                        placeholder={`أدخل ${field.field_label}...`}
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none"
                        required={isReq}
                      />
                    )}

                    {/* Number field */}
                    {field.field_type === "number" && (
                      <input
                        type="number"
                        placeholder="0"
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none"
                        required={isReq}
                      />
                    )}

                    {/* Select field */}
                    {field.field_type === "select" && (
                      <select
                        value={answers[field.field_label] || ""}
                        onChange={(e) => handleAnswerChange(field.field_label, e.target.value)}
                        className="w-full h-11 rounded-lg border border-slate-300 px-3.5 text-sm focus:border-blue-600 focus:outline-none bg-white"
                        required={isReq}
                      >
                        <option value="">-- اختر خياراً --</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.value_name}>
                            {opt.value_name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* MultiSelect field */}
                    {field.field_type === "multiselect" && (
                      <div className="space-y-2 pt-1 border border-slate-200 rounded-lg p-3 bg-slate-50">
                        {options.length === 0 ? (
                          <span className="text-xs text-slate-400">لا توجد خيارات مرتبطة بهذه القائمة</span>
                        ) : (
                          options.map((opt) => {
                            const isChecked = (answers[field.field_label] || []).includes(opt.value_name);
                            return (
                              <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleMultiSelectToggle(field.field_label, opt.value_name)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>{opt.value_name}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>{submitting ? "جاري الإرسال..." : "إرسال وتأكيد الطلب"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
