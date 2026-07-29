import { NextRequest } from "next/server";
import { AuthController } from "@/src/modules/iam/auth.controller";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  // Placeholder for future getUser by ID endpoint
  const { id } = await params;
  return Response.json({ success: true, data: { id }, message: "Use /api/v1/users for listing" });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return AuthController.updateUser(request, id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return AuthController.deleteUser(request, id);
}
