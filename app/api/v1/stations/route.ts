import { NextRequest } from "next/server";
import { StationController } from "@/src/modules/stations/station.controller";

export async function GET(request: NextRequest) {
  return StationController.listStations(request);
}

export async function POST(request: NextRequest) {
  return StationController.createStation(request);
}
