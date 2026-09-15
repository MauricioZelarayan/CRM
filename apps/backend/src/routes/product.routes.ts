import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  updateDealLineItemsSchema,
} from '../schemas/product.schema';
import { productService } from '../services/product.service';

const router = Router();
router.use(authMiddleware);

// CRUD Catálogo
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAll(req.user!.organizationId);
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validate(createProductSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.create(req.user!.organizationId, req.body);
      res.status(201).json({ message: 'Producto creado exitosamente', data: product });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id',
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await productService.update(id, req.user!.organizationId, req.body);
      res.json({ message: 'Producto actualizado', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  validate(productIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await productService.delete(id, req.user!.organizationId);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
);

// Líneas de producto dentro de una Oportunidad (Deal)
router.put(
  '/deals/:dealId/items',
  validate(updateDealLineItemsSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dealId = Array.isArray(req.params.dealId) ? req.params.dealId[0] : req.params.dealId;
      const updatedDeal = await productService.setDealProducts(
        dealId,
        req.user!.organizationId,
        req.body.items
      );
      res.json({ message: 'Cotización actualizada', data: updatedDeal });
    } catch (error) {
      next(error);
    }
  }
);

export default router;