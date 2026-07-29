import { NextRequest } from "next/server";
import { TenantController } from "@/src/modules/tenants/tenant.controller";

export async function GET(request: NextRequest) {
  return TenantController.listTenants(request);
}

export async function POST(request: NextRequest) {
  return TenantController.createTenant(request);
}
