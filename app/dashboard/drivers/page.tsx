"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  IdCard,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  Users,
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

const drivers = [
  {
    id: "DRV-102",
    name: "سالم عبدالله الحربي",
    phone: "0501234567",
    license_number: "KSA-883421",
    status: "available",
    shift: "صباحي",
    assigned_vehicle: "أ ب ج 2147",
  },
  {
    id: "DRV-119",
    name: "محمد راشد القحطاني",
    phone: "0558842100",
    license_number: "KSA-552019",
    status: "on_trip",
    shift: "مسائي",
    assigned_vehicle: "د هـ و 9031",
  },
  {
    id: "DRV-126",
    name: "فهد ناصر العتيبي",
    phone: "0547789122",
    license_number: "KSA-110245",
    status: "off",
    shift: "خارج الدوام",
    assigned_vehicle: "غير معين",
  },
];

const statusLabels = {
  available: { label: "متاح", variant: "emerald" as const },
  on_trip: { label: "قيد الرحلة", variant: "blue" as const },
  off: { label: "خارج الدوام", variant: "secondary" as const },
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        driver.name.toLowerCase().includes(term) ||
        driver.phone.includes(term) ||
        driver.license_number.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const activeDrivers = drivers.filter((driver) => driver.status !== "off").length;
  const assignedDrivers = drivers.filter((driver) => driver.assigned_vehicle !== "غير معين").length;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 rounded-2xl border-transparent bg-white p-6 shadow-enterprise sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-[#003422]" />
            <h1 className="text-xl font-bold text-[#1a1c1e]">إدارة السائقين</h1>
          </div>
          <p className="text-xs text-[#707973]">
            متابعة رخص السائقين والورديات وتخصيص المركبات ضمن المؤسسة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-lg" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button type="button" onClick={() => setOpen(true)} className="bg-[#003422] text-white hover:bg-[#0f4c36]">
            <Plus className="h-4 w-4" />
            <span>إضافة سائق</span>
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center justify-between rounded-2xl border-transparent bg-white p-5 shadow-enterprise">
          <div>
            <span className="block text-xs font-semibold text-[#707973]">إجمالي السائقين</span>
            <span className="mt-1 block text-2xl font-black text-[#1a1c1e]">{drivers.length}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99d3b6] bg-[#e7f8ef] text-[#003422]">
            <UserRound className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between rounded-2xl border-transparent bg-white p-5 shadow-enterprise">
          <div>
            <span className="block text-xs font-semibold text-[#707973]">نشطون اليوم</span>
            <span className="mt-1 block text-2xl font-black text-[#1a1c1e]">{activeDrivers}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#99d3b6] bg-[#e7f8ef] text-[#005228]">
            <BadgeCheck className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between rounded-2xl border-transparent bg-white p-5 shadow-enterprise">
          <div>
            <span className="block text-xs font-semibold text-[#707973]">تخصيصات مركبات</span>
            <span className="mt-1 block text-2xl font-black text-[#1a1c1e]">{assignedDrivers}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#c0c9c2] bg-[#eeeef0] text-[#404943]">
            <CalendarClock className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-between gap-3 rounded-2xl border-transparent bg-white p-4 shadow-enterprise sm:flex-row">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707973]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="بحث باسم السائق أو الجوال أو رقم الرخصة..."
            className="bg-[#f3f3f6] pr-9"
          />
        </div>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full bg-[#f3f3f6] sm:w-52">
          <option value="all">كل الحالات</option>
          <option value="available">متاح</option>
          <option value="on_trip">قيد الرحلة</option>
          <option value="off">خارج الدوام</option>
        </Select>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-transparent bg-white shadow-enterprise">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f3f3f6]">
                <TableHead>السائق</TableHead>
                <TableHead>رقم التواصل</TableHead>
                <TableHead>رقم الرخصة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الوردية</TableHead>
                <TableHead>المركبة الحالية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const status = statusLabels[driver.status as keyof typeof statusLabels];
                return (
                  <TableRow key={driver.id}>
                    <TableCell className="font-bold text-[#1a1c1e]">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b4efd1] text-xs font-bold text-[#005228]">
                          {driver.name.charAt(0)}
                        </span>
                        {driver.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#404943]">{driver.phone}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#404943]">
                        <IdCard className="h-3.5 w-3.5 text-[#707973]" />
                        {driver.license_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} shape="pill">{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#404943]">{driver.shift}</TableCell>
                    <TableCell className="text-xs font-semibold text-[#404943]">{driver.assigned_vehicle}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-amber-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-xs leading-relaxed">
          نموذج السائق مرتبط في قاعدة البيانات بمستخدم فعلي ودور Driver، لذلك صفحة الإضافة هنا واجهة جاهزة لحين ربطها بتدفق إنشاء المستخدمين وتعيينات المركبات.
        </p>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة سائق</DialogTitle>
            <DialogDescription>أدخل بيانات السائق الأساسية ورقم الرخصة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <Label className="mb-1 block">اسم السائق</Label>
              <Input placeholder="مثال: سالم عبدالله الحربي" />
            </div>
            <div>
              <Label className="mb-1 block">رقم التواصل</Label>
              <Input placeholder="05xxxxxxxx" />
            </div>
            <div>
              <Label className="mb-1 block">رقم الرخصة</Label>
              <Input placeholder="KSA-883421" />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="button" className="bg-[#003422] text-white hover:bg-[#0f4c36]">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
