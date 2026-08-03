import { NextRequest } from "next/server";
import { FormController } from "@/src/modules/forms/form.controller";

export async function GET(request: NextRequest) {
  return FormController.listForms(request);
}

export async function POST(request: NextRequest) {
  return FormController.createForm(request);
}
