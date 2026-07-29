import { NextRequest } from "next/server";
import { AuthController } from "@/src/modules/iam/auth.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return AuthController.assignRole(request, id);
}
