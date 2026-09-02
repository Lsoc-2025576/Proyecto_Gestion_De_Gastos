import { IncomeRepository } from '../repositories/income.repository.js';
import { type CreateIncomeDto, type UpdateIncomeDto } from '../dto/income.dto.js';
import { NotFoundError, ValidationError } from '../middlewares/error-handler.middleware.js';

export class IncomeService {
  static async getAllByUser(userId: number) {
    return IncomeRepository.findAllByUser(userId);
  }

  static async create(userId: number, dto: CreateIncomeDto) {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new ValidationError('El nombre del ingreso es obligatorio');
    }
    if (dto.amount === undefined || dto.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }
    if (!dto.type || !['FIJO', 'VARIADO'].includes(dto.type)) {
      throw new ValidationError('El tipo debe ser FIJO o VARIADO');
    }

    // Validaciones de Clasificación fiscal según el tipo
    const validFijo = ['SUELDO', 'CAPITAL'];
    const validVariado = ['SERVICIO_FACTURADO', 'VENTA_ACTIVO'];

    if (dto.type === 'FIJO' && !validFijo.includes(dto.classification)) {
      throw new ValidationError('La clasificación fiscal no corresponde a un ingreso fijo');
    }
    if (dto.type === 'VARIADO' && !validVariado.includes(dto.classification)) {
      throw new ValidationError('La clasificación fiscal no corresponde a un ingreso variado');
    }

    // Si es servicio facturado, el régimen fiscal es obligatorio
    if (dto.classification === 'SERVICIO_FACTURADO' && !dto.regime) {
      throw new ValidationError('El régimen fiscal es obligatorio para servicios facturados');
    }

    return IncomeRepository.create({ ...dto, userId });
  }

  static async update(userId: number, incomeId: number, dto: UpdateIncomeDto) {
    const existing = await IncomeRepository.findById(incomeId, userId);
    if (!existing) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }

    return IncomeRepository.update(incomeId, userId, dto);
  }

  static async delete(userId: number, incomeId: number) {
    const existing = await IncomeRepository.findById(incomeId, userId);
    if (!existing) {
      throw new NotFoundError('Ingreso no encontrado');
    }

    await IncomeRepository.delete(incomeId, userId);
  }

  static async getSummary(userId: number) {
    return IncomeRepository.getSummary(userId);
  }
}