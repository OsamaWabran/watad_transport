"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function getApiErrorMessage(response: any, fallback: string) {
  return response?.error?.message || response?.message || fallback;
}

interface StationItem {
  id: string;
  tenant_id: string | null;
  name: string;
  location_lat: number;
  location_lng: number;
  type: "pickup" | "dropoff" | "both";
  created_at: string;
}

export default function StationsPage() {
  const [stations, setStations] = useState<StationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string[]>([]);
  const isSuperAdmin = userRole.includes("super_admin");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location_lat: "",
    location_lng: "",
    type: "both" as "pickup" | "dropoff" | "both",
    tenant_id: undefined as string | null | undefined, // null means global
  });
  const [editId, setEditId] = useState<string | null>(null);

  // For simplicity, we just fetch /api/v1/stations which returns hybrid (global + tenant)
  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/stations");
      const data = await res.json();
      if (data.success) {
        setStations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      if (session?.roles) {
        setUserRole(session.roles);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchStations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredStations = stations.filter(s => s.name.includes(searchTerm));

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: "",
      location_lat: "",
      location_lng: "",
      type: "both",
      tenant_id: undefined,
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (s: StationItem) => {
    setEditId(s.id);
    setFormData({
      name: s.name,
      location_lat: s.location_lat.toString(),
      location_lng: s.location_lng.toString(),
      type: s.type,
      tenant_id: s.tenant_id,
    });
    setFormModalOpen(true);
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/v1/stations/${editId}` : "/api/v1/stations";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setFormModalOpen(false);
        fetchStations();
      } else {
        alert(getApiErrorMessage(data, "حدث خطأ أثناء حفظ بيانات المحطة"));
      }
    } catch (err) {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذه المحطة؟")) return;
    try {
      const res = await fetch(`/api/v1/stations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchStations();
      } else {
        alert(getApiErrorMessage(data, "فشل الحذف"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">إدارة المحطات</h1>
          <p className="mt-1 text-sm text-slate-500">
            أماكن صعود ونزول الطلاب والمركبات
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" />
          <span>إضافة محطة جديدة</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">جاري تحميل المحطات...</div>
        ) : filteredStations.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">لا توجد محطات مسجلة حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم المحطة</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الإحداثيات</th>
                  <th className="p-4">نطاق المحطة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStations.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {s.name}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={s.type === 'pickup' ? 'text-blue-600 border-blue-200 bg-blue-50' : s.type === 'dropoff' ? 'text-red-600 border-red-200 bg-red-50' : 'text-purple-600 border-purple-200 bg-purple-50'}>
                        {s.type === 'pickup' ? 'انطلاق فقط' : s.type === 'dropoff' ? 'وصول فقط' : 'انطلاق ووصول'}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600 dir-ltr text-right">
                      {s.location_lat}, {s.location_lng}
                    </td>
                    <td className="p-4">
                      {s.tenant_id === null ? (
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 gap-1 border-indigo-200">
                          <Globe className="w-3 h-3" />
                          عالمية
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 gap-1 border-slate-200">
                          <Shield className="w-3 h-3" />
                          خاصة
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      {(!s.tenant_id && !isSuperAdmin) ? (
                        <span className="text-xs text-slate-400">للقراءة فقط</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStation(s.id)}
                            className="p-1.5 text-slate-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[450px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل بيانات المحطة" : "إضافة محطة جديدة"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveStation} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المحطة *</Label>
              <Input
                id="name"
                placeholder="أدخل اسم المحطة..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">خط العرض (Lat) *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.00000001"
                  placeholder="24.7136"
                  value={formData.location_lat}
                  onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                  required
                  className="dir-ltr text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">خط الطول (Lng) *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.00000001"
                  placeholder="46.6753"
                  value={formData.location_lng}
                  onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
                  required
                  className="dir-ltr text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>نوع المحطة *</Label>
              <select
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
              >
                <option value="both">انطلاق ووصول</option>
                <option value="pickup">انطلاق فقط</option>
                <option value="dropoff">وصول فقط</option>
              </select>
            </div>

            {isSuperAdmin && (
              <div className="space-y-2 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                <Label className="text-indigo-900 font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  نطاق المحطة (صلاحية Super Admin)
                </Label>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="tenant_id"
                      checked={formData.tenant_id !== null}
                      onChange={() => setFormData({ ...formData, tenant_id: undefined })}
                    />
                    محطة خاصة بالمؤسسة الحالية (إن وجد سياق)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="tenant_id"
                      checked={formData.tenant_id === null}
                      onChange={() => setFormData({ ...formData, tenant_id: null })}
                    />
                    محطة عالمية (تظهر لجميع المؤسسات)
                  </label>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
