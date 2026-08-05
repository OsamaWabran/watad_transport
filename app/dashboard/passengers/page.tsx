"use client";

import { useEffect, useState } from "react";
import { Plus, Search, UserCheck, Phone, MapPin, Eye, Edit, Trash2, Filter, FileText } from "lucide-react";
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
  name: string;
}

interface PassengerItem {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  full_name: string;
  contact_number: string;
  gender: "male" | "female";
  extra_details?: Record<string, any> | null;
  default_start_station_id?: string | null;
  default_end_station_id?: string | null;
  created_at: string;
  start_station?: { id: string; name: string } | null;
  end_station?: { id: string; name: string } | null;
}

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<PassengerItem[]>([]);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [stationsUnavailable, setStationsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerItem | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    gender: "male" as "male" | "female",
    default_start_station_id: "",
    default_end_station_id: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (genderFilter && genderFilter !== "all") params.set("gender", genderFilter);

      const res = await fetch(`/api/v1/passengers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPassengers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/v1/stations");
      if (!res.ok) {
        setStationsUnavailable(true);
        setStations([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStations(data.data);
        setStationsUnavailable(false);
      }
    } catch (err) {
      setStationsUnavailable(true);
      setStations([]);
    }
  };

  useEffect(() => {
    fetchPassengers();
    fetchStations();
  }, [genderFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPassengers();
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      full_name: "",
      contact_number: "",
      gender: "male",
      default_start_station_id: "",
      default_end_station_id: "",
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (p: PassengerItem) => {
    setEditId(p.id);
    setFormData({
      full_name: p.full_name,
      contact_number: p.contact_number,
      gender: p.gender,
      default_start_station_id: p.default_start_station_id || "",
      default_end_station_id: p.default_end_station_id || "",
    });
    setFormModalOpen(true);
  };

  const handleSavePassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/v1/passengers/${editId}` : "/api/v1/passengers";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          default_start_station_id: formData.default_start_station_id || null,
          default_end_station_id: formData.default_end_station_id || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormModalOpen(false);
        fetchPassengers();
      } else {
        alert(getApiErrorMessage(data, "حدث خطأ أثناء حفظ بيانات الراكب"));
      }
    } catch (err) {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeletePassenger = async (id: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذا الراكب؟")) return;
    try {
      const res = await fetch(`/api/v1/passengers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPassengers();
      } else {
        alert(getApiErrorMessage(data, "فشل الحذف"));
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">إدارة الركاب والطلاب</h1>
          <p className="mt-1 text-sm text-slate-500">
            سجل الطلاب المسجلين بالخدمة وإدارة محطات الانطلاق والوصول والبيانات التفصيلية
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />
          <span>إضافة راكب جديد</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث بالاسم أو رقم التواصل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>
          <Button type="submit" variant="secondary" className="gap-1 text-xs">
            بحث
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> تصفية حسب الجنس:
          </span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-xs bg-white focus:outline-none"
          >
            <option value="all">الكل</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>
      </div>

      {/* Passengers Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">جاري تحميل قائمة الركاب...</div>
        ) : passengers.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">لا يوجد ركاب مسجلين حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم الطالب / الراكب</th>
                  <th className="p-4">رقم التواصل</th>
                  <th className="p-4">الجنس</th>
                  <th className="p-4">محطة الانطلاق الافتراضية</th>
                  <th className="p-4">محطة الوصول الافتراضية</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {passengers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      {p.full_name}
                    </td>
                    <td className="p-4 text-slate-700 dir-ltr text-right">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.contact_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          p.gender === "male"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-pink-50 text-pink-700 border-pink-200"
                        }
                      >
                        {p.gender === "male" ? "ذكر" : "أنثى"}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {p.start_station?.name ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {p.start_station.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">غير حددة</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {p.end_station?.name ? (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {p.end_station.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">غير حددة</span>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPassenger(p);
                            setDetailsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePassenger(p.id)}
                          className="p-1.5 text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Create/Edit Passenger */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل بيانات الراكب" : "إضافة راكب / طالب جديد"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePassenger} className="space-y-4 py-2">
            {formData.default_start_station_id && formData.default_end_station_id && formData.default_start_station_id === formData.default_end_station_id && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                تحذير: محطة الطلوع ومحطة النزول متطابقتان، يرجى التأكد من دقة الاختيار.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="full_name">اسم الراكب بالكامل *</Label>
              <Input
                id="full_name"
                placeholder="أدخل الاسم الثلاثي..."
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">رقم التواصل / الجوال *</Label>
              <Input
                id="contact_number"
                placeholder="05xxxxxxxx"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الجنس *</Label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="modal_gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={() => setFormData({ ...formData, gender: "male" })}
                  />
                  ذكر
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="modal_gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={() => setFormData({ ...formData, gender: "female" })}
                  />
                  أنثى
                </label>
              </div>
            </div>

            {stationsUnavailable && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                إدارة المحطات ستتوفر بعد تنفيذ مرحلة المحطات. يمكن حفظ الراكب الآن بدون محطة افتراضية.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="start_st">محطة الانطلاق الافتراضية</Label>
              <select
                id="start_st"
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none"
                value={formData.default_start_station_id}
                onChange={(e) => setFormData({ ...formData, default_start_station_id: e.target.value })}
                disabled={stationsUnavailable}
              >
                <option value="">-- اختر المحطة --</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_st">محطة الوصول الافتراضية</Label>
              <select
                id="end_st"
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:outline-none"
                value={formData.default_end_station_id}
                onChange={(e) => setFormData({ ...formData, default_end_station_id: e.target.value })}
                disabled={stationsUnavailable}
              >
                <option value="">-- اختر المحطة --</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal View Passenger Details */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[550px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              تفاصيل الراكب الإضافية
            </DialogTitle>
          </DialogHeader>

          {selectedPassenger && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-xs text-slate-500 block">الاسم</span>
                  <span className="font-bold text-slate-900">{selectedPassenger.full_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">رقم التواصل</span>
                  <span className="font-bold text-slate-900 dir-ltr text-right block">
                    {selectedPassenger.contact_number}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">
                  البيانات الديناميكية والإجابات المسجلة (Extra Details):
                </h4>

                {selectedPassenger.extra_details &&
                Object.keys(selectedPassenger.extra_details).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(selectedPassenger.extra_details).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 rounded bg-slate-100/70">
                        <span className="font-semibold text-slate-700">{k}:</span>
                        <span className="text-slate-900 font-medium">
                          {Array.isArray(v) ? v.join("، ") : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-4 text-center border border-dashed rounded-lg">
                    لا توجد بيانات ديناميكية إضافية مسجلة لهذا الراكب.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
