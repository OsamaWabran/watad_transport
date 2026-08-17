"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Phone, Users, Link, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PendingRequestsPage() {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPassengers = async () => {
    try {
      const res = await fetch("/api/v1/passengers/pending?tenant_id=c0c7a523-a5c9-4a0b-93f5-7e26d9c66af6"); // Normally from context
      const json = await res.json();
      if (json.success) setPassengers(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/passengers/${id}/approve`, { method: "POST" });
      if (res.ok) fetchPassengers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("يرجى إدخال سبب الرفض:");
    if (!reason) return;
    try {
      const res = await fetch(`/api/v1/passengers/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: reason }),
      });
      if (res.ok) fetchPassengers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm text-[#707973]">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border border-transparent bg-white p-6 shadow-enterprise">
        <h1 className="text-2xl font-extrabold text-[#1a1c1e]">طلبات التسجيل المعلقة</h1>
        <p className="mt-1 text-sm text-[#707973]">قم بمراجعة طلبات الانضمام الجديدة واعتمادها أو رفضها.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {passengers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-[#c0c9c2] bg-white py-12 text-center shadow-enterprise">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-[#404943]">لا توجد طلبات معلقة حالياً.</p>
          </div>
        ) : (
          passengers.map((p) => (
            <Card key={p.id} className="overflow-hidden rounded-2xl border-transparent bg-white shadow-enterprise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-enterprise-hover">
              <CardHeader className="border-b border-[#eeeef0] bg-[#f8faf9] pb-4">
                <CardTitle className="flex items-center gap-3 text-lg text-[#1a1c1e]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b4efd1] text-[#005228]">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  {p.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-[#707973]"><Phone className="w-3.5 h-3.5 text-[#707973]"/> رقم الجوال</span>
                    <div className="dir-ltr w-fit text-right font-semibold text-[#1a1c1e]">{p.contact_number}</div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-[#707973]"><Users className="w-3.5 h-3.5 text-[#707973]"/> الجنس</span>
                    <div className="font-semibold text-[#1a1c1e]">{p.gender === "male" ? "ذكر" : "أنثى"}</div>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <span className="flex items-center gap-1.5 text-xs text-[#707973]"><Link className="w-3.5 h-3.5 text-[#707973]"/> مصدر التسجيل</span>
                    <div>
                      <Badge variant="outline" className="border-[#c0c9c2] bg-[#f3f3f6] font-medium text-[#404943]">
                        {p.registration_source === "form" ? "رابط عام (استمارة)" : p.registration_source === "mobile_app" ? "تطبيق الهاتف" : "إضافة يدوية"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {p.extra_details && Object.keys(p.extra_details).length > 0 && (
                  <div className="relative overflow-hidden rounded-xl border border-[#99d3b6]/50 bg-gradient-to-br from-[#e7f8ef] to-[#f8faf9] p-3.5 text-sm">
                    <h5 className="mb-3 flex items-center gap-1.5 border-b border-[#99d3b6]/60 pb-1.5 text-xs font-bold text-[#1a1c1e]">
                       البيانات الإضافية المسجلة
                    </h5>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {Object.entries(p.extra_details).map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#707973]">{key}</span>
                          <span className="rounded-lg border border-[#eeeef0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1a1c1e] shadow-enterprise">
                            {Array.isArray(val) ? val.join("، ") : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleApprove(p.id)} className="flex-1 bg-[#003422] font-bold text-white shadow-enterprise hover:bg-[#0f4c36]">
                    <CheckCircle className="w-4 h-4 ml-2" /> اعتماد
                  </Button>
                  <Button onClick={() => handleReject(p.id)} variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold">
                    <XCircle className="w-4 h-4 ml-2" /> رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
