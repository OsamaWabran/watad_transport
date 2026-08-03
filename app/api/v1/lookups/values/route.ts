import { NextRequest } from "next/server";
import { LookupController } from "@/src/modules/lookups/lookup.controller";

export async function GET(request: NextRequest) {
  return LookupController.listValues(request);
}

export async function POST(request: NextRequest) {
  return LookupController.createValue(request);
}
