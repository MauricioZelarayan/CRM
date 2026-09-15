import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { exportService } from '../services/export.service';

const router = Router();
router.use(authMiddleware);

router.get('/deals/csv', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const csvContent = await exportService.getDealsCsv(req.user!.organizationId);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="deals-export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

router.get('/contacts/csv', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const csvContent = await exportService.getContactsCsv(req.user!.organizationId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts-export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

export default router;