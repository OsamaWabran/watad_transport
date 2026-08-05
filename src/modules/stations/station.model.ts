import { prisma } from "@/lib/prisma";
import { Station, StationType } from "@/app/generated/prisma/client";

export interface CreateStationDTO {
  tenant_id: string | null;
  name: string;
  location_lat: number | string;
  location_lng: number | string;
  type: StationType;
}

export interface UpdateStationDTO {
  name?: string;
  location_lat?: number | string;
  location_lng?: number | string;
  type?: StationType;
}

export class StationModel {
  /**
   * Find a station by ID
   */
  static async findById(id: string): Promise<Station | null> {
    return prisma.station.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new station
   */
  static async create(data: CreateStationDTO): Promise<Station> {
    return prisma.station.create({
      data,
    });
  }

  /**
   * Update a station
   */
  static async update(id: string, data: UpdateStationDTO): Promise<Station> {
    return prisma.station.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a station
   */
  static async delete(id: string): Promise<Station> {
    return prisma.station.delete({
      where: { id },
    });
  }

  /**
   * T026-a: Hybrid Visibility Query
   * Fetch stations that are either global (tenant_id = null) or belong to the specified tenant
   */
  static async findHybridStations(tenant_id: string | null): Promise<Station[]> {
    if (tenant_id) {
      return prisma.station.findMany({
        where: {
          OR: [
            { tenant_id: null },
            { tenant_id: tenant_id },
          ],
        },
        orderBy: [
          { tenant_id: 'asc' }, // nulls (global) will come first depending on db collation, but typically we want them ordered
          { created_at: 'desc' }
        ]
      });
    } else {
      // If no tenant_id is provided, and the caller is authorized (like super_admin), maybe return globals or all
      // For now, let's just return global stations if tenant_id is explicitly null
      return prisma.station.findMany({
        where: { tenant_id: null },
        orderBy: { created_at: 'desc' }
      });
    }
  }

  /**
   * Get all stations without filter (super_admin only)
   */
  static async findAll(): Promise<Station[]> {
    return prisma.station.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}
