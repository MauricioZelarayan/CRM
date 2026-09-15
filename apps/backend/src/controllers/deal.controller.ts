import { Request, Response, NextFunction } from 'express';
import { dealService } from '../services/deal.service';
import { CreateDealDTO, UpdateDealStageDTO } from '../schemas/deal.schema';

export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId; // Obtenido del JWT
    const deals = await dealService.getAll(organizationId);
    res.status(200).json({ data: deals });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (
  req: Request<Record<string, never>, unknown, CreateDealDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const newDeal = await dealService.create(organizationId, req.body);
    res.status(201).json({ message: 'Oportunidad creada con éxito', data: newDeal });
  } catch (error: any) {
    if (error.message.includes('organización')) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const updateDealStage = async (
  req: Request<{ id: string }, unknown, UpdateDealStageDTO>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;
    const updated = await dealService.updateStage(id, organizationId, req.body);
    res.status(200).json({ message: 'Etapa actualizada', data: updated });
  } catch (error: any) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
};

export const deleteDeal = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;
    await dealService.delete(id, organizationId);
    res.status(200).json({ message: 'Oportunidad eliminada' });
  } catch (error: any) {
    if (error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
};