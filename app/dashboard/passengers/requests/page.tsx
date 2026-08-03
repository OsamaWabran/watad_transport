"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">طلبات التسجيل المعلقة</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {passengers.length === 0 ? (
          <p>لا توجد طلبات معلقة حالياً.</p>
        ) : (
          passengers.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-gray-500">رقم الجوال: </span>
                  {p.contact_number}
                </div>
                <div>
                  <span className="text-gray-500">الجنس: </span>
                  {p.gender === "male" ? "ذكر" : "أنثى"}
                </div>
                <div>
                  <span className="text-gray-500">مصدر التسجيل: </span>
                  {p.registration_source === "form" ? "رابط عام" : p.registration_source === "mobile_app" ? "التطبيق" : "يدوي"}
                </div>
                {p.extra_details && (
                  <div className="bg-gray-100 p-2 rounded text-sm">
                    {Object.entries(p.extra_details).map(([key, val]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(val)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleApprove(p.id)} className="flex-1 bg-green-600 text-white hover:bg-green-700">اعتماد</Button>
                  <Button onClick={() => handleReject(p.id)} variant="destructive" className="flex-1">رفض</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
