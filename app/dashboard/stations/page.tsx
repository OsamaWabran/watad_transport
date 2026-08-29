"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MapPin, Edit, Trash2, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormBody, FormField, FormGrid } from "@/components/ui/form-layout";
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
      if (session?.user?.roles) {
        setUserRole(session.user.roles);
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
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1c1e]">إدارة المحطات</h1>
          <p className="mt-1 text-sm text-[#707973]">
            أماكن صعود ونزول الطلاب والمركبات
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 rounded-xl bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36]">
          <Plus className="w-4 h-4" />
          <span>إضافة محطة جديدة</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-transparent bg-white p-4 shadow-enterprise">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#707973]" />
            <Input
              placeholder="بحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-transparent bg-white shadow-enterprise">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#707973]">جاري تحميل المحطات...</div>
        ) : filteredStations.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#707973]">لا توجد محطات مسجلة حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#f3f3f6] text-xs font-bold text-[#404943] border-b border-[#e2e2e5]">
                <tr>
                  <th className="p-4">اسم المحطة</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">الإحداثيات</th>
                  <th className="p-4">نطاق المحطة</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeef0]">
                {filteredStations.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f3f3f6]">
                    <td className="p-4 font-bold text-[#1a1c1e] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#003422]" />
                      {s.name}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={s.type === 'pickup' ? 'text-[#003422] border-[#99d3b6] bg-[#e7f8ef]' : s.type === 'dropoff' ? 'text-red-600 border-red-200 bg-red-50' : 'text-[#404943] border-[#c0c9c2] bg-[#eeeef0]'}>
                        {s.type === 'pickup' ? 'انطلاق فقط' : s.type === 'dropoff' ? 'وصول فقط' : 'انطلاق ووصول'}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#404943] dir-ltr text-right">
                      {s.location_lat}, {s.location_lng}
                    </td>
                    <td className="p-4">
                      {s.tenant_id === null ? (
                        <Badge variant="secondary" className="bg-[#e7f8ef] text-[#005228] gap-1 border-[#99d3b6]">
                          <Globe className="w-3 h-3" />
                          عالمية
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-[#eeeef0] text-[#404943] gap-1 border-[#e2e2e5]">
                          <Shield className="w-3 h-3" />
                          خاصة
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      {(!s.tenant_id && !isSuperAdmin) ? (
                        <span className="text-xs text-[#707973]">للقراءة فقط</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-[#404943] hover:bg-[#e7f8ef] hover:text-[#003422]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStation(s.id)}
                            className="p-1.5 text-[#404943] hover:text-red-600"
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

          <form onSubmit={handleSaveStation}>
            <FormBody>
              <FormField label="اسم المحطة" htmlFor="name" required>
              <Input
                id="name"
                placeholder="أدخل اسم المحطة..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              </FormField>

              <FormGrid>
                <FormField label="خط العرض (Lat)" htmlFor="lat" required>
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
                </FormField>
                <FormField label="خط الطول (Lng)" htmlFor="lng" required>
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
                </FormField>
              </FormGrid>

              <FormField label="نوع المحطة" required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                required
              >
                <option value="both">انطلاق ووصول</option>
                <option value="pickup">انطلاق فقط</option>
                <option value="dropoff">وصول فقط</option>
              </Select>
              </FormField>
            </FormBody>

            <DialogFooter className="px-6 pb-6">
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-[#003422] text-white hover:bg-[#0f4c36]">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
