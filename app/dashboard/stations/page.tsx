"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Globe2,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  School,
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

const stations = [
  {
    id: "ST-G-001",
    name: "محطة البوابة الرئيسية",
    type: "global",
    scope: "عامة",
    lat: "24.713552",
    lng: "46.675296",
    passengers: 126,
  },
  {
    id: "ST-T-014",
    name: "كلية الهندسة",
    type: "tenant",
    scope: "جامعة الملك سعود",
    lat: "24.725822",
    lng: "46.624128",
    passengers: 72,
  },
  {
    id: "ST-T-021",
    name: "السكن الجامعي",
    type: "tenant",
    scope: "جامعة الملك سعود",
    lat: "24.731440",
    lng: "46.619310",
    passengers: 94,
  },
];

export default function StationsPage() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        station.name.toLowerCase().includes(term) ||
        station.scope.toLowerCase().includes(term);
      const matchesScope = scopeFilter === "all" || station.type === scopeFilter;

      return matchesSearch && matchesScope;
    });
  }, [search, scopeFilter]);

  const globalCount = stations.filter((station) => station.type === "global").length;
  const tenantCount = stations.filter((station) => station.type === "tenant").length;
  const passengerCount = stations.reduce((sum, station) => sum + station.passengers, 0);

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 border-slate-200/80 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">إدارة المحطات</h1>
          </div>
          <p className="text-xs text-slate-500">
            إدارة المحطات العامة والخاصة وتحديد الإحداثيات الجغرافية للطلاب والرحلات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-lg" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button type="button" onClick={() => setOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>إضافة محطة</span>
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">محطات عامة</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{globalCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <Globe2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">محطات المؤسسة</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{tenantCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <School className="h-5 w-5" />
          </div>
        </Card>
        <Card className="flex items-center justify-between border-slate-200/80 p-5">
          <div>
            <span className="block text-xs font-semibold text-slate-500">ركاب مرتبطون</span>
            <span className="mt-1 block text-2xl font-black text-slate-900">{passengerCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <Navigation className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card className="flex flex-col items-center justify-between gap-3 border-slate-200/80 p-4 sm:flex-row">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="بحث باسم المحطة أو نطاقها..."
            className="bg-slate-50 pr-9"
          />
        </div>
        <Select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="w-full bg-slate-50 sm:w-52">
          <option value="all">كل المحطات</option>
          <option value="global">عامة</option>
          <option value="tenant">خاصة بالمؤسسة</option>
        </Select>
      </Card>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden border-slate-200/80 lg:col-span-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>اسم المحطة</TableHead>
                  <TableHead>النطاق</TableHead>
                  <TableHead>نوع المحطة</TableHead>
                  <TableHead>الإحداثيات</TableHead>
                  <TableHead>ركاب مرتبطون</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-bold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {station.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{station.scope}</TableCell>
                    <TableCell>
                      {station.type === "global" ? (
                        <Badge variant="blue" shape="pill">
                          <Globe2 className="h-3.5 w-3.5" />
                          عامة
                        </Badge>
                      ) : (
                        <Badge variant="indigo" shape="pill">
                          <Building2 className="h-3.5 w-3.5" />
                          مؤسسة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {station.lat}, {station.lng}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {station.passengers}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">خريطة تشغيلية</h2>
            <Badge variant="secondary">عرض تمثيلي</Badge>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:34px_34px]" />
            {stations.map((station, index) => (
              <div
                key={station.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white bg-blue-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm"
                style={{
                  right: `${22 + index * 24}%`,
                  top: `${28 + index * 18}%`,
                }}
              >
                <MapPin className="h-3 w-3" />
                {station.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة محطة</DialogTitle>
            <DialogDescription>حدد اسم المحطة ونطاقها وإحداثياتها الجغرافية.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div>
              <Label className="mb-1 block">اسم المحطة</Label>
              <Input placeholder="مثال: كلية الهندسة" />
            </div>
            <div>
              <Label className="mb-1 block">النطاق</Label>
              <Select defaultValue="tenant">
                <option value="global">محطة عامة</option>
                <option value="tenant">محطة خاصة بالمؤسسة</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">خط العرض</Label>
                <Input placeholder="24.725822" />
              </div>
              <div>
                <Label className="mb-1 block">خط الطول</Label>
                <Input placeholder="46.624128" />
              </div>
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
