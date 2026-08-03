import { NextRequest } from "next/server";
import { FormController } from "@/src/modules/forms/form.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return FormController.getResponses(request, id);
}
