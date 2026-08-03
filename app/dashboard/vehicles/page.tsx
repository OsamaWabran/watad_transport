"use client";

import { useMemo, useState } from "react";
import {
  Bus,
  Gauge,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wrench,
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

const vehicles = [
  {
    id: "BUS-001",
    plate_number: "أ ب ج 2147",
    type: "حافلة كبيرة",
    capacity: 48,
    status: "available",
    assigned_route: "السكن الجامعي - البوابة 4",
    last_check: "2026-07-26",
  },
  {
    id: "BUS-002",
    plate_number: "د هـ و 9031",
    type: "حافلة متوسطة",
    capacity: 32,
    status: "in_service",
    assigned_route: "كلية الهندسة - محطة المترو",
    last_check: "2026-07-25",
  },
  {
    id: "VAN-014",
    plate_number: "س ع ق 1180",
    type: "مركبة صغيرة",
    capacity: 14,
    status: "maintenance",
    assigned_route: "غير معينة",
    last_check: "2026-07-20",
  },
];

const statusLabels = {
  available: { label: "متاحة", variant: "emerald" as const },
  in_service: { label: "قيد التشغيل", variant: "blue" as const },
  maintenance: { label: "صيانة", variant: "amber" as const },
};

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        vehicle.plate_number.toLowerCase().includes(term) ||
        vehicle.type.toLowerCase().includes(term) ||
        vehicle.assigned_route.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalCapacity = vehicles.reduce((sum, vehicle) => sum + vehicle.capacity, 0);
  const availableCount = vehicles.filter((vehicle) => vehicle.status === "available").length;
  const maintenanceCount = vehicles.filter((vehicle) => vehicle.status === "maintenance").length;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 border-slate-200/80 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">إدارة المركبات</h1>
          </div>
          <p className="text-xs text-slate-500">
            متابعة أسطول الحافلات والمقاعد المتاحة وحالة التشغيل والصيانة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-lg" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button type="button" onClick={() => setOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>إضافة مركبة</span>
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">إجمالي المركبات</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{vehicles.length}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <Bus className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">السعة التشغيلية</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{totalCapacity}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">جاهزة للتخصيص</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{availableCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">تحت الصيانة</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{maintenanceCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
            <Wrench className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-between gap-3 border-slate-200/80 p-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="بحث برقم اللوحة أو النوع أو المسار..."
            className="bg-slate-50 pr-9"
          />
        </div>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full bg-slate-50 sm:w-52">
          <option value="all">كل الحالات</option>
          <option value="available">متاحة</option>
          <option value="in_service">قيد التشغيل</option>
          <option value="maintenance">صيانة</option>
        </Select>
      </Card>

      <Card className="overflow-hidden border-slate-200/80">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>رقم اللوحة</TableHead>
                <TableHead>نوع المركبة</TableHead>
                <TableHead>السعة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التخصيص الحالي</TableHead>
                <TableHead>آخر فحص</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const status = statusLabels[vehicle.status as keyof typeof statusLabels];
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-bold text-slate-900">{vehicle.plate_number}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700">
                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                        {vehicle.capacity} مقعد
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} shape="pill">{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{vehicle.assigned_route}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {new Date(vehicle.last_check).toLocaleDateString("ar-SA")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مركبة</DialogTitle>
            <DialogDescription>واجهة الإدخال جاهزة للربط مع API المركبات عند تفعيله.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <Label className="mb-1 block">رقم اللوحة</Label>
              <Input placeholder="مثال: أ ب ج 2147" />
            </div>
            <div>
              <Label className="mb-1 block">نوع المركبة</Label>
              <Input placeholder="حافلة كبيرة، متوسطة، مركبة صغيرة..." />
            </div>
            <div>
              <Label className="mb-1 block">السعة</Label>
              <Input type="number" min={1} placeholder="48" />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
