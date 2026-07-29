import { NextRequest } from "next/server";
import { TenantController } from "@/src/modules/tenants/tenant.controller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return TenantController.activateTenant(request, id);
}
