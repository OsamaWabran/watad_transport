import { NextRequest } from "next/server";
import { TenantController } from "@/src/modules/tenants/tenant.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return TenantController.getTenantById(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return TenantController.updateTenant(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return TenantController.deleteTenant(request, id);
}
