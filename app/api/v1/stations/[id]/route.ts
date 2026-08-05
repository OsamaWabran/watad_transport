import { NextRequest } from "next/server";
import { StationController } from "@/src/modules/stations/station.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return StationController.getStationById(request, resolvedParams.id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return StationController.updateStation(request, resolvedParams.id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return StationController.deleteStation(request, resolvedParams.id);
}
