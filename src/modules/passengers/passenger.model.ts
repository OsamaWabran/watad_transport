import { prisma } from "@/lib/prisma";
import { Gender, Passenger } from "@/app/generated/prisma/client";

export interface CreatePassengerDTO {
  tenant_id: string;
  user_id?: string | null;
  full_name: string;
  contact_number: string;
  gender: Gender;
  extra_details?: unknown;
  default_start_station_id?: string | null;
  default_end_station_id?: string | null;
}

export interface UpdatePassengerDTO {
  user_id?: string | null;
  full_name?: string;
  contact_number?: string;
  gender?: Gender;
  extra_details?: unknown;
  default_start_station_id?: string | null;
  default_end_station_id?: string | null;
}

export interface PassengerFilter {
  tenant_id: string;
  gender?: Gender;
  search?: string;
}

const passengerInclude = {
  tenant: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  start_station: {
    select: {
      id: true,
      name: true,
    },
  },
  end_station: {
    select: {
      id: true,
      name: true,
    },
  },
};

export type PassengerWithRelations = Passenger & {
  tenant: { id: string; name: string; code: string };
  start_station: { id: string; name: string } | null;
  end_station: { id: string; name: string } | null;
};

export class PassengerModel {
  static async findById(
    tenant_id: string,
    id: string
  ): Promise<PassengerWithRelations | null> {
    return prisma.passenger.findFirst({
      where: { id, tenant_id },
      include: passengerInclude,
    }) as Promise<PassengerWithRelations | null>;
  }

  static async findByContactNumber(
    tenant_id: string,
    contact_number: string
  ): Promise<Passenger | null> {
    return prisma.passenger.findUnique({
      where: {
        tenant_id_contact_number: {
          tenant_id,
          contact_number: contact_number.trim(),
        },
      },
    });
  }

  static async findAll(filter: PassengerFilter): Promise<PassengerWithRelations[]> {
    const where: any = { tenant_id: filter.tenant_id };
    if (filter.gender) {
      where.gender = filter.gender;
    }
    if (filter.search) {
      where.OR = [
        { full_name: { contains: filter.search, mode: "insensitive" } },
        { contact_number: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    return prisma.passenger.findMany({
      where,
      include: passengerInclude,
      orderBy: { created_at: "desc" },
    }) as Promise<PassengerWithRelations[]>;
  }

  static async create(data: CreatePassengerDTO): Promise<PassengerWithRelations> {
    return prisma.passenger.create({
      data: {
        tenant_id: data.tenant_id,
        user_id: data.user_id || null,
        full_name: data.full_name.trim(),
        contact_number: data.contact_number.trim(),
        gender: data.gender,
        extra_details: data.extra_details as any,
        default_start_station_id: data.default_start_station_id || null,
        default_end_station_id: data.default_end_station_id || null,
      },
      include: passengerInclude,
    }) as Promise<PassengerWithRelations>;
  }

  static async update(
    tenant_id: string,
    id: string,
    data: UpdatePassengerDTO
  ): Promise<PassengerWithRelations> {
    return prisma.passenger.update({
      where: { id },
      data: {
        ...(data.user_id !== undefined && { user_id: data.user_id }),
        ...(data.full_name !== undefined && { full_name: data.full_name.trim() }),
        ...(data.contact_number !== undefined && {
          contact_number: data.contact_number.trim(),
        }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.extra_details !== undefined && {
          extra_details: data.extra_details as any,
        }),
        ...(data.default_start_station_id !== undefined && {
          default_start_station_id: data.default_start_station_id,
        }),
        ...(data.default_end_station_id !== undefined && {
          default_end_station_id: data.default_end_station_id,
        }),
      },
      include: passengerInclude,
    }) as Promise<PassengerWithRelations>;
  }

  static async delete(
    tenant_id: string,
    id: string
  ): Promise<PassengerWithRelations> {
    return prisma.passenger.delete({
      where: { id },
      include: passengerInclude,
    }) as Promise<PassengerWithRelations>;
  }
}
