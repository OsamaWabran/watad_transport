"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Edit3,
  Filter,
  Globe,
  Hospital,
  Plus,
  RefreshCw,
  School,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TenantType = "university" | "company" | "hospital" | "other";

interface Tenant {
  id: string;
  name: string;
  code: string;
  type: TenantType;
  logo?: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  name: "",
  code: "",
  type: "university" as TenantType,
  logo: "",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [formData, setFormData] = useState(emptyForm);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/tenants", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "تعذر جلب المؤسسات");
      }
      setTenants(json.data);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "تعذر جلب المؤسسات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch =
        tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        tenant.code.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || tenant.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, tenants, typeFilter]);

  const openCreateForm = () => {
    setEditingTenant(null);
    setFormData(emptyForm);
    setShowForm(true);
    setErrorMsg(null);
  };

  const openEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      code: tenant.code,
      type: tenant.type,
      logo: tenant.logo || "",
    });
    setShowForm(true);
    setErrorMsg(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTenant(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        type: formData.type,
        logo: formData.logo || undefined,
      };
      const res = await fetch(
        editingTenant ? `/api/v1/tenants/${editingTenant.id}` : "/api/v1/tenants",
        {
          method: editingTenant ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "تعذر حفظ المؤسسة");
      }

      setMessage(editingTenant ? "تم تحديث بيانات المؤسسة" : "تم تسجيل المؤسسة");
      closeForm();
      fetchTenants();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "تعذر حفظ المؤسسة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/tenants/${tenant.id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !tenant.is_active }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "تعذر تغيير حالة المؤسسة");
      }
      setMessage(tenant.is_active ? "تم تعطيل المؤسسة" : "تم تفعيل المؤسسة");
      fetchTenants();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "تعذر تغيير حالة المؤسسة");
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/tenants/${deletingTenant.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "تعذر حذف المؤسسة");
      }
      setMessage("تم حذف المؤسسة");
      setDeletingTenant(null);
      fetchTenants();
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "تعذر حذف المؤسسة");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type: TenantType) => {
    const typeMap = {
      university: { label: "جامعة / أكاديمية", icon: School, variant: "blue" as const },
      company: { label: "شركة / مؤسسة", icon: Briefcase, variant: "indigo" as const },
      hospital: { label: "قطاع صحي", icon: Hospital, variant: "rose" as const },
      other: { label: "أخرى", icon: Globe, variant: "secondary" as const },
    };
    const item = typeMap[type];
    const Icon = item.icon;
    return (
      <Badge variant={item.variant}>
        <Icon className="w-3.5 h-3.5" />
        <span>{item.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 rounded-2xl border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#003422]" />
            <h1 className="text-xl font-bold text-[#1a1c1e]">إدارة المؤسسات التابعة</h1>
          </div>
          <p className="text-xs text-[#707973]">عرض وإضافة وتعديل وتفعيل وحذف المؤسسات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-lg" onClick={fetchTenants} title="تحديث">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button type="button" onClick={openCreateForm} className="bg-[#003422] text-white hover:bg-[#0f4c36]">
            <Plus className="w-4 h-4" />
            <span>إضافة مؤسسة</span>
          </Button>
        </div>
      </Card>

      {(message || errorMsg) && (
        <div className={`flex items-center justify-between rounded-lg border p-4 text-sm ${errorMsg ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          <div className="flex items-center gap-2">
            {errorMsg ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{errorMsg || message}</span>
          </div>
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => { setMessage(null); setErrorMsg(null); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Card className="flex flex-col items-center justify-between gap-3 rounded-2xl border-transparent bg-white p-4 shadow-enterprise sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#707973]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="البحث باسم أو كود المؤسسة..." className="bg-[#f3f3f6] pr-9" />
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          <Filter className="w-4 h-4 text-[#707973]" />
          {["ALL", "university", "company", "hospital", "other"].map((typeKey) => (
            <Button key={typeKey} type="button" variant={typeFilter === typeKey ? "default" : "secondary"} size="sm" onClick={() => setTypeFilter(typeKey)} className={typeFilter === typeKey ? "bg-[#003422] text-white hover:bg-[#0f4c36]" : "bg-[#eeeef0] text-[#404943] hover:bg-[#e2e2e5]"}>
              {typeKey === "ALL" ? "الكل" : typeKey === "university" ? "جامعات" : typeKey === "company" ? "شركات" : typeKey === "hospital" ? "مستشفيات" : "أخرى"}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-transparent bg-white shadow-enterprise">
        {loading ? (
          <div className="p-12 text-center text-[#707973]">
            <RefreshCw className="mx-auto mb-3 w-8 h-8 animate-spin text-[#003422]" />
            <p className="text-sm">جاري تحميل المؤسسات...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-12 text-center text-[#707973]">
            <Building2 className="mx-auto mb-3 w-12 h-12 text-[#c0c9c2]" />
            <h3 className="text-base font-bold text-[#1a1c1e]">لا توجد مؤسسات</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f3f6]">
                  <TableHead>الكود</TableHead>
                  <TableHead>اسم المؤسسة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-mono font-bold text-[#005228]">{tenant.code}</TableCell>
                    <TableCell className="font-bold text-[#1a1c1e]">{tenant.name}</TableCell>
                    <TableCell>{getTypeBadge(tenant.type)}</TableCell>
                    <TableCell>
                      <Badge variant={tenant.is_active ? "emerald" : "destructive"} shape="pill">
                        <span className={`w-2 h-2 rounded-full ${tenant.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span>{tenant.is_active ? "مفعلة" : "معطلة"}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#707973]">{new Date(tenant.created_at).toLocaleDateString("ar-SA")}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleToggleStatus(tenant)}>
                          {tenant.is_active ? "تعطيل" : "تفعيل"}
                        </Button>
                        <Button type="button" variant="outline" size="icon-sm" onClick={() => openEditForm(tenant)} title="تعديل">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="destructive" size="icon-sm" onClick={() => setDeletingTenant(tenant)} title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={showForm}>
        <DialogContent>
          <DialogHeader className="flex-row items-center justify-between">
            <div>
              <DialogTitle>{editingTenant ? "تعديل مؤسسة" : "تسجيل مؤسسة جديدة"}</DialogTitle>
              <DialogDescription>أدخل بيانات المؤسسة وكود العزل الخاص بها</DialogDescription>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={closeForm}>
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <Label className="mb-1 block">اسم المؤسسة *</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">كود المؤسسة *</Label>
              <Input required disabled={Boolean(editingTenant)} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="font-mono" />
            </div>
            <div>
              <Label className="mb-1 block">نوع المؤسسة *</Label>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as TenantType })}>
                <option value="university">جامعة / أكاديمية</option>
                <option value="company">شركة / مؤسسة خاصة</option>
                <option value="hospital">مستشفى / قطاع صحي</option>
                <option value="other">أخرى</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">رابط الشعار</Label>
              <Input type="url" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm}>إلغاء</Button>
              <Button type="submit" disabled={submitting} className="bg-[#003422] text-white hover:bg-[#0f4c36]">
                {submitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingTenant)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المؤسسة</DialogTitle>
            <DialogDescription>سيتم حذف المؤسسة المحددة إذا لم تكن مرتبطة بسجلات تمنع الحذف.</DialogDescription>
          </DialogHeader>
          <div className="p-6 text-sm text-[#404943]">
            تأكيد حذف: <span className="font-bold">{deletingTenant?.name}</span>
          </div>
          <DialogFooter className="mx-6 mb-6">
            <Button type="button" variant="ghost" onClick={() => setDeletingTenant(null)}>إلغاء</Button>
            <Button type="button" variant="destructive" disabled={submitting} onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
