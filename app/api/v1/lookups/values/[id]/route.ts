import { NextRequest } from "next/server";
import { LookupController } from "@/src/modules/lookups/lookup.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return LookupController.updateValue(request, id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return LookupController.updateValue(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return LookupController.deleteValue(request, id);
}
