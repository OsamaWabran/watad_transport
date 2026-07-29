import { NextRequest } from "next/server";
import { AuthController } from "@/src/modules/iam/auth.controller";

export async function GET(request: NextRequest) {
  return AuthController.listUsers(request);
}

export async function POST(request: NextRequest) {
  return AuthController.createUser(request);
}
