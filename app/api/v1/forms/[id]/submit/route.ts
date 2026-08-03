import { NextRequest } from "next/server";
import { FormController } from "@/src/modules/forms/form.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return FormController.submitForm(request, id);
}
