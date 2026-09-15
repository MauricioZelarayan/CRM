import { Request, Response, NextFunction } from 'express';
import { dealService } from '../services/deal.service';
import type { CreateDealDTO, UpdateDealStageDTO } from '../schemas/deal.schema';

export const getDeals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId; // OWASP #3: Obtenido del JWT verificado
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
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const newDeal = await dealService.create(organizationId, req.body);
    res.status(201).json({ message: 'Oportunidad creada con éxito', data: newDeal });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('organización')) {
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
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;
    
    const updated = await dealService.updateStage(id, req.body.stage, organizationId);
    res.status(200).json({ message: 'Etapa actualizada', data: updated });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('insuficiente')) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('no encontrada')) {
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
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;
    await dealService.delete(id, organizationId);
    res.status(200).json({ message: 'Oportunidad eliminada' });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('no encontrada')) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
};