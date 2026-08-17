"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Search, FileSpreadsheet, User, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ResponseItem {
  id: string;
  submitted_at: string;
  passenger?: {
    full_name: string;
    contact_number: string;
    gender: string;
  } | null;
  response_data: {
    passenger_info?: {
      full_name: string;
      contact_number: string;
      gender: string;
    };
    answers?: Record<string, any>;
  };
}

interface FormDetail {
  id: string;
  title: string;
  description?: string;
  purpose: string;
  form_fields: any[];
}

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<FormDetail | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [formRes, respRes] = await Promise.all([
          fetch(`/api/v1/forms/${id}`),
          fetch(`/api/v1/forms/${id}/responses`),
        ]);
        const formData = await formRes.json();
        const respData = await respRes.json();

        if (formData.success) setForm(formData.data);
        if (respData.success) setResponses(respData.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredResponses = responses.filter((r) => {
    const name = r.passenger?.full_name || r.response_data?.passenger_info?.full_name || "";
    const phone = r.passenger?.contact_number || r.response_data?.passenger_info?.contact_number || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)
    );
  });

  const exportToCSV = () => {
    if (responses.length === 0) return;

    const isPassengerForm = form?.purpose === "passenger_registration";
    const dynamicKeys = form?.form_fields?.map((f) => f.field_label) || [];
    
    const headers = isPassengerForm 
      ? ["اسم الراكب", "رقم التواصل", "الجنس", "تاريخ الإرسال", ...dynamicKeys]
      : ["تاريخ الإرسال", ...dynamicKeys];

    const rows = filteredResponses.map((r) => {
      const date = new Date(r.submitted_at).toLocaleString("ar-SA");
      const answers = r.response_data?.answers || {};

      const dynamicValues = (form?.form_fields || []).map((f) => {
        const val = answers[f.field_label] || answers[f.id] || "";
        return Array.isArray(val) ? val.join(";") : val;
      });

      if (isPassengerForm) {
        const name = r.passenger?.full_name || r.response_data?.passenger_info?.full_name || "";
        const phone = r.passenger?.contact_number || r.response_data?.passenger_info?.contact_number || "";
        const gender = r.passenger?.gender || r.response_data?.passenger_info?.gender || "";
        return [name, phone, gender, date, ...dynamicValues];
      } else {
        return [date, ...dynamicValues];
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.map((x) => `"${x}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `استجابات_${form?.title || "النموذج"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/forms"
            className="mb-1 inline-flex items-center text-xs font-semibold text-[#707973] hover:text-[#003422]"
          >
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
            العودة لقائمة النماذج
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1a1c1e]">
            إجابات الاستمارة: {form?.title || "جاري التحميل..."}
          </h1>
          <p className="mt-1 text-sm text-[#707973]">
            استعراض إجابات الركاب والطلاب وتصدير البيانات في ملف اكسل/CSV
          </p>
        </div>

        <Button
          onClick={exportToCSV}
          disabled={responses.length === 0}
          className="gap-2 rounded-xl bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>تصدير CSV / Excel</span>
        </Button>
      </div>

      {/* Stats and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-transparent bg-white p-4 shadow-enterprise">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-sm bg-[#e7f8ef] text-[#005228] border-[#99d3b6] font-bold">
            إجمالي الإجابات: {responses.length}
          </Badge>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#707973]" />
          <Input
            placeholder="بحث بالاسم أو رقم التواصل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-transparent bg-white shadow-enterprise">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#707973]">جاري تحميل الاستجابات...</div>
        ) : filteredResponses.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#707973]">لا توجد إجابات مطابقة حتى الآن</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#f3f3f6] text-xs font-bold text-[#404943] border-b border-[#e2e2e5]">
                <tr>
                  {form?.purpose === "passenger_registration" && (
                    <>
                      <th className="p-4">اسم الطالب / الراكب</th>
                      <th className="p-4">رقم التواصل</th>
                      <th className="p-4">الجنس</th>
                    </>
                  )}
                  <th className="p-4">تاريخ التعبئة</th>
                  {form?.form_fields?.map((f) => (
                    <th key={f.id} className="p-4 bg-[#e7f8ef]/50 text-[#003422]">
                      {f.field_label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeef0]">
                {filteredResponses.map((r) => {
                  const name = r.passenger?.full_name || r.response_data?.passenger_info?.full_name || "غير محدد";
                  const phone = r.passenger?.contact_number || r.response_data?.passenger_info?.contact_number || "غير محدد";
                  const gender = r.passenger?.gender || r.response_data?.passenger_info?.gender || "male";
                  const answers = r.response_data?.answers || {};

                  return (
                    <tr key={r.id} className="hover:bg-[#f3f3f6]">
                      {form?.purpose === "passenger_registration" && (
                        <>
                          <td className="p-4 font-bold text-[#1a1c1e] flex items-center gap-2">
                            <User className="w-4 h-4 text-[#707973]" />
                            {name}
                          </td>
                          <td className="p-4 text-[#404943] dir-ltr text-right">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#707973]" />
                              {phone}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={gender === "male" ? "text-[#003422]" : "text-pink-600"}>
                              {gender === "male" ? "ذكر" : "أنثى"}
                            </Badge>
                          </td>
                        </>
                      )}
                      <td className="p-4 text-xs text-[#707973]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#707973]" />
                          {new Date(r.submitted_at).toLocaleString("ar-SA")}
                        </span>
                      </td>
                      {form?.form_fields?.map((f) => {
                        const val = answers[f.field_label] || answers[f.id] || "-";
                        return (
                          <td key={f.id} className="p-4 text-[#1a1c1e] bg-[#f3f3f6]/20 font-medium">
                            {Array.isArray(val) ? val.join("، ") : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
