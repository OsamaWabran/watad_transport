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

  if (loading) return <div className="p-8 text-center text-slate-500 text-sm">جاري التحميل...</div>;

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">طلبات التسجيل المعلقة</h1>
        <p className="mt-1 text-sm text-slate-500">قم بمراجعة طلبات الانضمام الجديدة واعتمادها أو رفضها.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {passengers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-600 font-medium">لا توجد طلبات معلقة حالياً.</p>
          </div>
        ) : (
          passengers.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-slate-200/60 bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shadow-inner">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  {p.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> رقم الجوال</span>
                    <div className="font-semibold text-slate-900 dir-ltr text-right w-fit">{p.contact_number}</div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400"/> الجنس</span>
                    <div className="font-semibold text-slate-900">{p.gender === "male" ? "ذكر" : "أنثى"}</div>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5"><Link className="w-3.5 h-3.5 text-slate-400"/> مصدر التسجيل</span>
                    <div>
                      <Badge variant="outline" className="bg-slate-50 font-medium text-slate-700">
                        {p.registration_source === "form" ? "رابط عام (استمارة)" : p.registration_source === "mobile_app" ? "تطبيق الهاتف" : "إضافة يدوية"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {p.extra_details && Object.keys(p.extra_details).length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-100/50 p-3.5 rounded-xl text-sm relative overflow-hidden">
                    <div className="absolute -left-2 -top-2 w-12 h-12 bg-blue-100 rounded-full blur-xl opacity-60 pointer-events-none" />
                    <h5 className="font-bold text-slate-800 mb-3 text-xs border-b border-blue-100/60 pb-1.5 flex items-center gap-1.5">
                       البيانات الإضافية المسجلة
                    </h5>
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {Object.entries(p.extra_details).map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{key}</span>
                          <span className="text-slate-900 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                            {Array.isArray(val) ? val.join("، ") : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleApprove(p.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold">
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
