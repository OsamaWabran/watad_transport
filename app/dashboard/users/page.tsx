"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Pencil,
  Trash2,
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
import { Select } from "@/components/ui/select";
import { FormBody, FormField, FormGrid } from "@/components/ui/form-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserItem {
  id: string;
  tenant_id: string;
  user_name: string;
  full_name: string;
  phone_number: string;
  roles: string[];
  created_at: string;
}

interface TenantItem {
  id: string;
  name: string;
  code: string;
}


type ModalMode = "create" | "edit" | "delete" | null;

export default function UsersPage() {
  const { data: session } = useSession();
  const sessionTenantId = session?.user?.tenant_id;
  const userRoles = ((session?.user as any)?.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes("super_admin");

  const [users, setUsers] = useState<UserItem[]>([]);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tenant_id: "",
    user_name: "",
    full_name: "",
    phone_number: "",
    password: "",
    role: "user",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ─── Load Data ──────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const usersRequest = fetch("/api/v1/users").then((r) => r.json());
      const tenantsRequest = isSuperAdmin
        ? fetch("/api/v1/tenants").then((r) => r.json())
        : Promise.resolve({ success: true, data: [] });

      const [tenantsRes, usersRes] = await Promise.allSettled([tenantsRequest, usersRequest]);

      if (isSuperAdmin) {
        if (
          tenantsRes.status === "fulfilled" &&
          tenantsRes.value?.success &&
          Array.isArray(tenantsRes.value.data)
        ) {
          setTenants(tenantsRes.value.data);
        } else {
          setTenants([]);
        }
      } else {
        setTenants([]);
      }

      if (
        usersRes.status === "fulfilled" &&
        usersRes.value?.success &&
        Array.isArray(usersRes.value.data)
      ) {
        setUsers(usersRes.value.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users or tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSuperAdmin]);

  // ─── Open Modals ─────────────────────────────────────────────
  const openCreate = () => {
    setErrorMsg(null);
    const initialTenantId = tenants[0]?.id || sessionTenantId || "";
    setFormData({
      tenant_id: initialTenantId,
      user_name: "",
      full_name: "",
      phone_number: "",
      password: "",
      role: "user",
    });
    setModalMode("create");
  };

  const openEdit = (user: UserItem) => {
    setErrorMsg(null);
    setSelectedUser(user);
    setFormData({
      tenant_id: user.tenant_id,
      user_name: user.user_name,
      full_name: user.full_name,
      phone_number: user.phone_number,
      password: "",
      role: user.roles[0] || "user",
    });
    setModalMode("edit");
  };

  const openDelete = (user: UserItem) => {
    setSelectedUser(user);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setErrorMsg(null);
  };

  // ─── Create ──────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const payloadTenantId = formData.tenant_id || sessionTenantId;

    if (!payloadTenantId) {
      setErrorMsg("يرجى اختيار المؤسسة التابع لها المستخدم");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tenant_id: payloadTenantId,
          roles: [formData.role],
        }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        await loadData();
        setSuccessMsg("تم إضافة المستخدم بنجاح!");
        closeModal();
      } else {
        const errorDetail = json.error?.message || json.message || "حدث خطأ أثناء إضافة المستخدم";
        setErrorMsg(errorDetail);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل الاتصال بالخادم عند إضافة المستخدم");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Update ──────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg(null);
    setSubmitting(true);

    const payload: Record<string, string> = {
      tenant_id: selectedUser.tenant_id,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
    };
    if (formData.password && formData.password.length >= 6) {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        await loadData();
        setSuccessMsg("تم تعديل بيانات المستخدم بنجاح!");
        closeModal();
      } else {
        setErrorMsg(json.error?.message || json.message || "حدث خطأ أثناء التعديل");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل الاتصال بالخادم أثناء التعديل");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: selectedUser.tenant_id }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        await loadData();
        setSuccessMsg("تم حذف المستخدم بنجاح!");
        closeModal();
      } else {
        setErrorMsg(json.error?.message || json.message || "حدث خطأ أثناء الحذف");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "فشل الاتصال بالخادم أثناء الحذف");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Filter ──────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.user_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone_number.includes(search);
    const matchesRole = roleFilter === "ALL" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roles: string[]) => {
    const mainRole = roles[0] || "user";
    switch (mainRole) {
      case "super_admin":
        return (
          <Badge variant="purple">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="blue">
            <Shield className="w-3.5 h-3.5" />
            <span>مدير مؤسسة</span>
          </Badge>
        );
      case "driver":
        return (
          <Badge variant="amber">
            <User className="w-3.5 h-3.5" />
            <span>سائق حافلة</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="w-3.5 h-3.5" />
            <span>مستخدم</span>
          </Badge>
        );
    }
  };

  // ─── Shared Form Fields ───────────────────────────────────────
  const renderFormFields = (isEdit = false) => (
    <FormBody>
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <FormGrid>
        {/* Tenant – only for create */}
        {!isEdit && isSuperAdmin && (
          <FormField label="المؤسسة التابع لها" required className="sm:col-span-2">
            <Select
              required
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            >
              <option value="">-- اختر المؤسسة --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </Select>
          </FormField>
        )}

        {/* Username – only for create */}
        {!isEdit && (
          <FormField label="اسم المستخدم (Username)" required>
          <Input
            type="text"
            required
            placeholder="مثال: ksu_admin"
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
          />
          </FormField>
        )}

        {/* Full Name */}
        <FormField label="الاسم الكامل" required>
        <Input
          type="text"
          required
          placeholder="مثال: محمد عبدالله السلمان"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        </FormField>

        {/* Phone */}
        <FormField label="رقم الهاتف" required>
        <Input
          type="tel"
          required
          placeholder="0501234567"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          className="font-mono"
        />
        </FormField>

        {/* Password */}
        <FormField
          label={isEdit ? "كلمة المرور الجديدة" : "كلمة المرور"}
          required={!isEdit}
          hint={isEdit ? "اتركها فارغة للإبقاء على كلمة المرور الحالية." : undefined}
          className={isEdit ? "sm:col-span-2" : undefined}
        >
        <Input
          type="password"
          required={!isEdit}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        </FormField>

        {/* Role – only for create */}
        {!isEdit && (
          <FormField label="الصلاحية / الدور" required>
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="admin">مدير مؤسسة (Admin)</option>
            <option value="driver">سائق حافلة (Driver)</option>
            <option value="user">مستخدم عادي (User)</option>
          </Select>
          </FormField>
        )}
      </FormGrid>
    </FormBody>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="flex flex-col gap-4 rounded-2xl border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#003422]" />
            <h1 className="text-xl font-bold text-[#1a1c1e]">إدارة المستخدمين والأدوار (IAM)</h1>
          </div>
          <p className="text-xs text-[#707973]">
            إضافة وتعيين الصلاحيات للحسابات الإدارية والموظفين تحت سياق المؤسسة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={loadData}
            className="border-[#e2e2e5] text-[#404943] hover:bg-[#eeeef0]"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            type="button"
            onClick={openCreate}
            className="bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36]"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </Button>
        </div>
      </Card>

      {/* Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setSuccessMsg(null)}
            className="hover:bg-emerald-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="flex flex-col items-center justify-between gap-3 rounded-2xl border-transparent bg-white p-4 shadow-enterprise sm:flex-row">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#707973]">
            <Search className="w-4 h-4" />
          </div>
          <Input
            type="text"
            placeholder="البحث باسم المستخدم أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#f3f3f6] pr-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-[#707973] shrink-0">الصلاحية:</span>
          {["ALL", "admin", "driver", "user"].map((roleKey) => (
            <Button
              type="button"
              variant={roleFilter === roleKey ? "default" : "secondary"}
              size="sm"
              key={roleKey}
              onClick={() => setRoleFilter(roleKey)}
              className={`h-8 text-xs ${
                roleFilter === roleKey
                  ? "bg-[#003422] text-white hover:bg-[#0f4c36]"
                  : "bg-[#eeeef0] text-[#404943] hover:bg-[#e2e2e5]"
              }`}
            >
              {roleKey === "ALL" && "الكل"}
              {roleKey === "admin" && "مدراء المؤسسة"}
              {roleKey === "driver" && "سائقين"}
              {roleKey === "user" && "مستخدمين"}
            </Button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden rounded-2xl border-transparent bg-white shadow-enterprise">
        {loading ? (
          <div className="p-12 text-center text-[#707973] space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#003422]" />
            <p className="text-sm">جاري تحميل قائمة المستخدمين...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#707973] space-y-3">
            <Users className="w-12 h-12 mx-auto text-[#c0c9c2]" />
            <h3 className="font-bold text-[#1a1c1e] text-base">لا يوجد مستخدمون مسجلون</h3>
            <p className="text-xs text-[#707973] max-w-sm mx-auto">
              اضغط على زر &quot;إضافة مستخدم جديد&quot; لإنشاء أول حساب مدير أو سائق.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f3f6]">
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold text-[#1a1c1e]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#b4efd1] text-[#005228] flex items-center justify-center font-bold text-xs">
                          {u.full_name.charAt(0)}
                        </div>
                        <span>{u.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[#404943]">
                      @{u.user_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#404943]">
                      {u.phone_number || "غير محدد"}
                    </TableCell>
                    <TableCell>{getRoleBadge(u.roles)}</TableCell>
                    <TableCell className="text-xs text-[#707973]">
                      {new Date(u.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(u)}
                          className="text-[#707973] hover:text-[#003422] hover:bg-[#e7f8ef]"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openDelete(u)}
                          className="text-[#707973] hover:text-red-600 hover:bg-red-50"
                          title="حذف"
                        >
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

      {/* ── Create Modal ── */}
      <Dialog open={modalMode === "create"}>
        <DialogContent>
          <DialogHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#003422] text-white">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>تعيين كلمة المرور والصلاحية تحت المؤسسة</DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              className="text-[#707973] hover:bg-[#e2e2e5]"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            {renderFormFields(false)}
            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="ghost" onClick={closeModal} className="text-[#404943]">
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36] disabled:opacity-60"
              >
                {submitting ? "جاري الإضافة..." : "حفظ المستخدم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Modal ── */}
      <Dialog open={modalMode === "edit"}>
        <DialogContent>
          <DialogHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                <DialogDescription>
                  {selectedUser ? `@${selectedUser.user_name}` : ""}
                </DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              className="text-[#707973] hover:bg-[#e2e2e5]"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            {renderFormFields(true)}
            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="ghost" onClick={closeModal} className="text-[#404943]">
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-amber-500 text-white shadow-enterprise-hover shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-60"
              >
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={modalMode === "delete"}>
        <DialogContent>
          <DialogHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600 text-white">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
                <DialogDescription>هذا الإجراء لا يمكن التراجع عنه</DialogDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeModal}
              className="text-[#707973] hover:bg-[#e2e2e5]"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogHeader>
          <div className="px-6 py-4">
            <p className="text-sm text-[#404943]">
              هل أنت متأكد من حذف المستخدم{" "}
              <span className="font-bold text-[#1a1c1e]">{selectedUser?.full_name}</span>؟
              <br />
              <span className="text-xs text-[#707973]">
                سيتم حذف جميع صلاحياته وبياناته بشكل نهائي.
              </span>
            </p>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button type="button" variant="ghost" onClick={closeModal} className="text-[#404943]">
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="bg-red-600 text-white shadow-enterprise-hover shadow-red-500/20 hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "جاري الحذف..." : "نعم، احذف المستخدم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
