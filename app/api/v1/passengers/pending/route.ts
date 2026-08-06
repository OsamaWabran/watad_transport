import { NextRequest } from "next/server";
import { PassengerController } from "@/src/modules/passengers/passenger.controller";

export async function GET(request: NextRequest) {
  return PassengerController.getPendingPassengers(request);
}
