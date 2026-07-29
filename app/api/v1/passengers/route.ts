import { NextRequest } from "next/server";
import { PassengerController } from "@/src/modules/passengers/passenger.controller";

export async function GET(request: NextRequest) {
  return PassengerController.listPassengers(request);
}

export async function POST(request: NextRequest) {
  return PassengerController.createPassenger(request);
}
