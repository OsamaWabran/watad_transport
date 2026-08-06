import { NextRequest } from "next/server";
import { PassengerController } from "@/src/modules/passengers/passenger.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return PassengerController.rejectPassenger(request, id);
}
