import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';

export const getActivitiesByContact = async (
  req: Request<{ contactId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const contactId = Array.isArray(req.params.contactId)
      ? req.params.contactId[0]
      : req.params.contactId;

    const activities = await activityService.getByContact(contactId, organizationId);
    res.json({ data: activities });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const activity = await activityService.create(organizationId, req.body);
    res.status(201).json({ message: 'Actividad registrada', data: activity });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await activityService.delete(id, organizationId);
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    next(error);
  }
};