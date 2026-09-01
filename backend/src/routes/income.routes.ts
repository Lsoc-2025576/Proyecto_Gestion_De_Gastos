import { Router } from 'express';
import { IncomeController } from '../controllers/income.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.get('/', authenticateToken, IncomeController.getAll);
router.get('/summary', authenticateToken, IncomeController.getSummary);
router.post('/', authenticateToken, IncomeController.create);
router.patch('/:id', authenticateToken, IncomeController.update);
router.delete('/:id', authenticateToken, IncomeController.delete);

export default router;