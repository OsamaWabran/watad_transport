"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const formatted = status.charAt(0).toUpperCase() + status.slice(1);
      return <div className="capitalize font-medium text-slate-800">{formatted}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-mr-3 h-8 text-xs font-semibold text-slate-900 hover:bg-slate-100"
        >
          Email
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase text-slate-800">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right font-semibold text-slate-900">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium text-slate-900">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-slate-200">
            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
              className="text-xs cursor-pointer"
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs cursor-pointer">View customer</DropdownMenuItem>
            <DropdownMenuItem className="text-xs cursor-pointer">View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316.0,
    status: "success",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242.0,
    status: "success",
    email: "abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837.0,
    status: "processing",
    email: "monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874.0,
    status: "success",
    email: "silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721.0,
    status: "failed",
    email: "carmella@example.com",
  },
];

export default function TableDemoPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">جدول البيانات (DataTable Light Mode)</h1>
        <p className="text-xs text-slate-500">
          تصميم Shadcn DataTable الرسمي بالوضع الفاتح بنفس المظهر والخيارات المعروضة في الصورة
        </p>
      </div>

      <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl">
        <DataTable columns={columns} data={data} searchKey="email" searchPlaceholder="Filter emails..." />
      </Card>
    </div>
  );
}
