import { type Request, type Response } from 'express';
import { IncomeService } from '../services/income.service.js';
import { type AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class IncomeController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const incomes = await IncomeService.getAllByUser(userId);

    return res.status(200).json({
      success: true,
      data: { incomes },
    });
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const income = await IncomeService.create(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Ingreso creado exitosamente',
      data: { income },
    });
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ingreso invalido',
        code: 'VALIDATION_ERROR',
      });
    }

    const incomeId = parseInt(idParam);

    if (isNaN(incomeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ingreso invalido',
        code: 'VALIDATION_ERROR',
      });
    }

    const income = await IncomeService.update(userId, incomeId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Ingreso actualizado exitosamente',
      data: { income },
    });
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const idParam = req.params.id;

    if (!idParam || Array.isArray(idParam)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ingreso invalido',
        code: 'VALIDATION_ERROR',
      });
    }

    const incomeId = parseInt(idParam);

    if (isNaN(incomeId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de ingreso invalido',
        code: 'VALIDATION_ERROR',
      });
    }

    await IncomeService.delete(userId, incomeId);

    return res.status(200).json({
      success: true,
      message: 'Ingreso eliminado exitosamente',
    });
  }

  
  static async getSummary(req: AuthenticatedRequest, res: Response) {
    const userId = req.user!.id;
    const summary = await IncomeService.getSummary(userId);

    return res.status(200).json({
      success: true,
      data: { summary },
    });
  }
}