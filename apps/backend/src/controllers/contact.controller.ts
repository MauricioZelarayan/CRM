import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service';

export const getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const contacts = await contactService.getAll(organizationId);
    res.json({ data: contacts });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const contact = await contactService.create(organizationId, req.body);
    res.status(201).json({ message: 'Contacto creado exitosamente', data: contact });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await contactService.delete(id, organizationId);
    res.json({ message: 'Contacto eliminado' });
  } catch (error) {
    next(error);
  }
};