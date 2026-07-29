"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCw, Search, Trash2, UserCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Gender = "male" | "female";
type Tenant = { id: string; name: string; code: string };
type Passenger = { id: string; full_name: string; contact_number: string; gender: Gender; extra_details?: unknown; created_at: string };

const emptyForm = { full_name: "", contact_number: "", gender: "male" as Gender, extra_details: "" };

export default function PassengersPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Passenger | null>(null);
  const [deleting, setDeleting] = useState<Passenger | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedTenant = tenants.find((tenant) => tenant.id === tenantId);
  const filtered = useMemo(() => passengers.filter((passenger) => {
    const text = `${passenger.full_name} ${passenger.contact_number}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (gender === "ALL" || passenger.gender === gender);
  }), [gender, passengers, search]);

  const fetchTenants = async () => {
    const res = await fetch("/api/v1/tenants?is_active=true", { cache: "no-store" });
    const json = await res.json();
    if (json.success) {
      setTenants(json.data);
      if (!tenantId && json.data[0]) setTenantId(json.data[0].id);
    }
  };

  const fetchPassengers = async (currentTenantId = tenantId) => {
    if (!currentTenantId) return setPassengers([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/passengers?tenant_id=${currentTenantId}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "تعذر جلب الركاب");
      setPassengers(json.data);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر جلب الركاب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);
  useEffect(() => { fetchPassengers(tenantId); }, [tenantId]);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (passenger: Passenger) => {
    setEditing(passenger);
    setForm({
      full_name: passenger.full_name,
      contact_number: passenger.contact_number,
      gender: passenger.gender,
      extra_details: passenger.extra_details ? JSON.stringify(passenger.extra_details, null, 2) : "",
    });
    setOpen(true);
  };

  const payload = () => {
    let extra_details: unknown = undefined;
    if (form.extra_details.trim()) {
      try { extra_details = JSON.parse(form.extra_details); } catch { extra_details = { notes: form.extra_details.trim() }; }
    }
    return { tenant_id: tenantId, ...form, extra_details };
  };

  const savePassenger = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/v1/passengers/${editing.id}` : "/api/v1/passengers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "تعذر حفظ الراكب");
      setNotice(editing ? "تم تحديث بيانات الراكب" : "تم إضافة الراكب");
      setOpen(false);
      fetchPassengers();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر حفظ الراكب");
    } finally { setSaving(false); }
  };

  const deletePassenger = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/passengers/${deleting.id}?tenant_id=${tenantId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "تعذر حذف الراكب");
      setNotice("تم حذف الراكب");
      setDeleting(null);
      fetchPassengers();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر حذف الراكب");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 border-slate-200/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2"><UserCheck className="h-6 w-6 text-blue-600" /><h1 className="text-xl font-bold text-slate-900">إدارة الركاب والطلاب</h1></div>
          <p className="text-xs text-slate-500">عرض وإضافة وتعديل وحذف الركاب لكل مؤسسة</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="min-w-60">
            <option value="">اختر المؤسسة</option>
            {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.code})</option>)}
          </Select>
          <Button type="button" variant="outline" size="icon-lg" onClick={() => fetchPassengers()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button type="button" disabled={!tenantId} onClick={startCreate} className="bg-blue-600 text-white hover:bg-blue-700"><Plus className="h-4 w-4" /><span>إضافة راكب</span></Button>
        </div>
      </Card>

      {notice && <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700"><span>{notice}</span><Button type="button" variant="ghost" size="icon-xs" onClick={() => setNotice(null)}><X className="h-4 w-4" /></Button></div>}

      <Card className="flex flex-col gap-3 border-slate-200/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو رقم التواصل..." className="pr-9" /></div>
        <div className="flex gap-2">{[["ALL", "الكل"], ["male", "ذكور"], ["female", "إناث"]].map(([value, label]) => <Button key={value} type="button" variant={gender === value ? "default" : "secondary"} size="sm" onClick={() => setGender(value)} className={gender === value ? "bg-blue-600 text-white" : ""}>{label}</Button>)}</div>
      </Card>

      <Card className="overflow-hidden border-slate-200/80">
        {filtered.length === 0 ? <div className="p-12 text-center text-slate-500">{selectedTenant ? "لا يوجد ركاب لهذه المؤسسة" : "اختر مؤسسة لعرض الركاب"}</div> : (
          <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>اسم الراكب</TableHead><TableHead>رقم التواصل</TableHead><TableHead>الجنس</TableHead><TableHead>تاريخ الإنشاء</TableHead><TableHead className="text-left">الإجراءات</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((passenger) => <TableRow key={passenger.id}><TableCell className="font-bold">{passenger.full_name}</TableCell><TableCell className="font-mono text-blue-700">{passenger.contact_number}</TableCell><TableCell><Badge variant={passenger.gender === "male" ? "blue" : "rose"}>{passenger.gender === "male" ? "ذكر" : "أنثى"}</Badge></TableCell><TableCell className="text-xs text-slate-500">{new Date(passenger.created_at).toLocaleDateString("ar-SA")}</TableCell><TableCell><div className="flex justify-end gap-2"><Button type="button" variant="outline" size="icon-sm" onClick={() => startEdit(passenger)}><Edit3 className="h-4 w-4" /></Button><Button type="button" variant="destructive" size="icon-sm" onClick={() => setDeleting(passenger)}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}
          </TableBody></Table></div>
        )}
      </Card>

      <Dialog open={open}><DialogContent><DialogHeader><DialogTitle>{editing ? "تعديل راكب" : "إضافة راكب"}</DialogTitle></DialogHeader><form onSubmit={savePassenger} className="space-y-4 p-6"><div><Label className="mb-1 block">اسم الراكب *</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div><div><Label className="mb-1 block">رقم التواصل *</Label><Input required value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} /></div><div><Label className="mb-1 block">الجنس *</Label><Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}><option value="male">ذكر</option><option value="female">أنثى</option></Select></div><div><Label className="mb-1 block">تفاصيل إضافية</Label><Input value={form.extra_details} onChange={(e) => setForm({ ...form, extra_details: e.target.value })} placeholder="JSON أو ملاحظة نصية" /></div><DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button><Button type="submit" disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">حفظ</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={Boolean(deleting)}><DialogContent><DialogHeader><DialogTitle>حذف الراكب</DialogTitle></DialogHeader><div className="p-6 text-sm">تأكيد حذف <span className="font-bold">{deleting?.full_name}</span></div><DialogFooter className="mx-6 mb-6"><Button type="button" variant="ghost" onClick={() => setDeleting(null)}>إلغاء</Button><Button type="button" variant="destructive" disabled={saving} onClick={deletePassenger}>حذف</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
