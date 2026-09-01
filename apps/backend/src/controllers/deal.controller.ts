import { Request, Response, NextFunction } from 'express';
import { dealService } from '../services/deal.service';

export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;
    const deals = await dealService.getAllByOrganization(organizationId);
    res.json({ data: deals });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;
    const newDeal = await dealService.create(organizationId, req.body);
    res.status(201).json({ data: newDeal });
  } catch (error) {
    next(error);
  }
};

export const updateDealStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedDeal = await dealService.updateStage(id, organizationId, req.body);
    res.json({ data: updatedDeal });
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await dealService.delete(id, organizationId);
    res.json({ message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};