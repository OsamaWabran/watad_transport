"use client";

import { useEffect, useState } from "react";
import { Plus, Search, UserCheck, Phone, MapPin, Eye, Edit, Trash2, Filter, FileText, X } from "lucide-react";
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
  type: string;
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
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1c1e]">إدارة الركاب والطلاب</h1>
          <p className="mt-1 text-sm text-[#707973]">
            سجل الطلاب المسجلين بالخدمة وإدارة محطات الانطلاق والوصول والبيانات التفصيلية
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 rounded-xl bg-[#003422] text-white shadow-enterprise hover:bg-[#0f4c36]">
          <Plus className="w-4 h-4" />
          <span>إضافة راكب جديد</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#707973]" />
            <Input
              placeholder="بحث بالاسم أو رقم التواصل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-[#f3f3f6] pr-9 focus-visible:ring-[#003422]"
            />
          </div>
          <Button type="submit" variant="secondary" className="gap-1 text-xs">
            بحث
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-[#707973]">
            <Filter className="w-3.5 h-3.5" /> تصفية حسب الجنس:
          </span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#c0c9c2] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-[#003422]"
          >
            <option value="all">الكل</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>
      </div>

      {/* Passengers Table */}
      <div className="overflow-hidden rounded-2xl border border-transparent bg-white shadow-enterprise">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#707973]">جاري تحميل قائمة الركاب...</div>
        ) : passengers.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#707973]">لا يوجد ركاب مسجلين حالياً</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-[#e2e2e5] bg-[#f3f3f6] text-xs font-bold text-[#404943]">
                <tr>
                  <th className="p-4">اسم الطالب / الراكب</th>
                  <th className="p-4">رقم التواصل</th>
                  <th className="p-4">الجنس</th>
                  <th className="p-4">محطة الانطلاق الافتراضية</th>
                  <th className="p-4">محطة الوصول الافتراضية</th>
                  <th className="p-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeef0]">
                {passengers.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8faf9]">
                    <td className="flex items-center gap-2 p-4 font-bold text-[#1a1c1e]">
                      <UserCheck className="w-4 h-4 text-[#003422]" />
                      {p.full_name}
                    </td>
                    <td className="dir-ltr p-4 text-right text-[#404943]">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#707973]" />
                        {p.contact_number}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          p.gender === "male"
                            ? "border-[#99d3b6] bg-[#e7f8ef] text-[#005228]"
                            : "bg-pink-50 text-pink-700 border-pink-200"
                        }
                      >
                        {p.gender === "male" ? "ذكر" : "أنثى"}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-[#404943]">
                      {p.start_station?.name ? (
                        <span className="flex items-center gap-1 font-semibold text-[#1a1c1e]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          {p.start_station.name}
                        </span>
                      ) : (
                        <span className="text-[#707973]">غير محددة</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-[#404943]">
                      {p.end_station?.name ? (
                        <span className="flex items-center gap-1 font-semibold text-[#1a1c1e]">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {p.end_station.name}
                        </span>
                      ) : (
                        <span className="text-[#707973]">غير محددة</span>
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
                          className="p-1.5 text-[#404943] hover:bg-[#e7f8ef] hover:text-[#003422]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-[#404943] hover:bg-[#e7f8ef] hover:text-[#003422]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePassenger(p.id)}
                          className="p-1.5 text-[#404943] hover:bg-red-50 hover:text-red-600"
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
                className="w-full rounded-lg border border-[#c0c9c2] bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-[#003422]"
                value={formData.default_start_station_id}
                onChange={(e) => setFormData({ ...formData, default_start_station_id: e.target.value })}
                disabled={stationsUnavailable}
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "pickup" || st.type === "both")
                  .map((st) => (
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
                className="w-full rounded-lg border border-[#c0c9c2] bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-[#003422]"
                value={formData.default_end_station_id}
                onChange={(e) => setFormData({ ...formData, default_end_station_id: e.target.value })}
                disabled={stationsUnavailable}
              >
                <option value="">-- اختر المحطة --</option>
                {stations
                  .filter((st) => st.type === "dropoff" || st.type === "both")
                  .map((st) => (
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
              <Button type="submit" className="bg-[#003422] text-white hover:bg-[#0f4c36]">
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal View Passenger Details */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[550px] relative" dir="rtl">
          <button
            onClick={() => setDetailsModalOpen(false)}
            className="absolute left-4 top-4 z-10 rounded-full bg-[#eeeef0] p-1.5 opacity-70 transition-all hover:bg-[#e2e2e5] hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4 text-[#404943]" />
            <span className="sr-only">إغلاق</span>
          </button>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003422]" />
              تفاصيل الراكب الإضافية
            </DialogTitle>
          </DialogHeader>

          {selectedPassenger && (
            <div className="space-y-6 py-2 text-sm">
              <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-[#99d3b6]/50 bg-gradient-to-br from-[#e7f8ef] to-[#f8faf9] p-4 shadow-enterprise md:flex-row">
                <div className="flex-1 space-y-1">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#005228]/80">الاسم</span>
                  <span className="flex items-center gap-2 text-lg font-bold text-[#1a1c1e]">
                    <UserCheck className="w-5 h-5 text-[#003422]" />
                    {selectedPassenger.full_name}
                  </span>
                </div>
                <div className="flex-1 space-y-1 border-t border-[#e2e2e5] pt-3 md:border-r md:border-t-0 md:pr-4 md:pt-0">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#707973]">رقم التواصل</span>
                  <span className="dir-ltr flex w-fit items-center gap-2 font-bold text-[#1a1c1e]">
                    <Phone className="w-4 h-4 text-[#707973]" />
                    {selectedPassenger.contact_number}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-1 rounded-full bg-[#003422]"></div>
                  <h4 className="text-base font-bold text-[#1a1c1e]">البيانات الإضافية (Extra Details)</h4>
                </div>

                {selectedPassenger.extra_details && Object.keys(selectedPassenger.extra_details).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {Object.entries(selectedPassenger.extra_details).map(([k, v]) => (
                      <div key={k} className="group flex flex-col rounded-lg border border-[#e2e2e5] bg-white p-3 shadow-enterprise transition-all duration-200 hover:border-[#99d3b6] hover:shadow-enterprise-hover">
                        <span className="mb-1 text-xs font-medium text-[#707973] transition-colors group-hover:text-[#003422]">{k}</span>
                        <span className="text-sm font-semibold text-[#1a1c1e]">
                          {Array.isArray(v) ? v.join("، ") : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#c0c9c2] bg-[#f8faf9] p-8 text-center">
                    <FileText className="mb-2 w-8 h-8 text-[#c0c9c2]" />
                    <span className="text-sm font-medium text-[#707973]">لا توجد بيانات إضافية مسجلة لهذا الراكب.</span>
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
