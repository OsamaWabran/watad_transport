import { NextRequest } from "next/server";
import { PassengerController } from "@/src/modules/passengers/passenger.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PassengerController.approvePassenger(request, params.id);
}
