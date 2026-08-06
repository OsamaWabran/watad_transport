import { NextRequest } from "next/server";
import { FormController } from "@/src/modules/forms/form.controller";

export async function POST(request: NextRequest) {
  return FormController.submitPublicForm(request);
}
