import { prisma } from '../config/database.js';
import { type CreateIncomeDto, type UpdateIncomeDto } from '../dto/income.dto.js';

export interface IncomeResponse {
  id: number;
  name: string;
  amount: number;
  type: string;
  date: Date;
  description: string | null;
  createdAt: Date;
}

/**
 * Convierte el resultado crudo de Prisma (con amount: Decimal) a IncomeResponse
 * (con amount: number). Prisma usa Decimal para precision monetaria, pero el
 * resto de la app (frontend, calculos) trabaja con number normal.
 */
function toIncomeResponse(income: {
  id: number;
  name: string;
  amount: { toString(): string };
  type: string;
  date: Date;
  description: string | null;
  createdAt: Date;
}): IncomeResponse {
  return {
    id: income.id,
    name: income.name,
    amount: Number(income.amount),
    type: income.type,
    date: income.date,
    description: income.description,
    createdAt: income.createdAt,
  };
}

export class IncomeRepository {
  static async findAllByUser(userId: number): Promise<IncomeResponse[]> {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        name: true,
        amount: true,
        type: true,
        date: true,
        description: true,
        createdAt: true,
      },
    });

    return incomes.map(toIncomeResponse);
  }

  static async findById(id: number, userId: number) {
    return prisma.income.findFirst({
      where: { id, userId },
    });
  }

  static async create(data: CreateIncomeDto & { userId: number }): Promise<IncomeResponse> {
    const income = await prisma.income.create({
      data: {
        name: data.name,
        amount: data.amount,
        type: data.type,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description ?? null,
        userId: data.userId,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        type: true,
        date: true,
        description: true,
        createdAt: true,
      },
    });

    return toIncomeResponse(income);
  }

  static async update(id: number, userId: number, data: UpdateIncomeDto): Promise<IncomeResponse> {
    const income = await prisma.income.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type && { type: data.type }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.description !== undefined && { description: data.description ?? null }),
      },
      select: {
        id: true,
        name: true,
        amount: true,
        type: true,
        date: true,
        description: true,
        createdAt: true,
      },
    });

    return toIncomeResponse(income);
  }

  static async delete(id: number, userId: number): Promise<void> {
    const income = await prisma.income.findFirst({
      where: { id, userId },
    });
    if (!income) {
      throw new Error('Ingreso no encontrado');
    }
    await prisma.income.delete({ where: { id } });
  }

  /**
   * Calcula el resumen de ingresos del usuario: total, fijos y variados.
   * Trae solo amount+type de la DB (no todos los campos) para que sea
   * mas liviano, ya que aqui no necesitamos el resto de la info.
   */
  static async getSummary(userId: number): Promise<{ total: number; fijo: number; variado: number }> {
    const incomes = await prisma.income.findMany({
      where: { userId },
      select: { amount: true, type: true },
    });

    let fijo = 0;
    let variado = 0;

    for (const income of incomes) {
      const amount = Number(income.amount);
      if (income.type === 'FIJO') {
        fijo += amount;
      } else {
        variado += amount;
      }
    }

    return { total: fijo + variado, fijo, variado };
  }
}