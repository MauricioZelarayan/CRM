import { Request, Response, NextFunction } from 'express';
import { ContactParams, CreateContactInput, UpdateContactInput } from '../schemas/contact.schema';
import * as contactService from '../services/contact.service';

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user!.organizationId;
    const contacts = await contactService.getAllContacts(organizationId);

    return res.status(200).json({ data: contacts });
  } catch (error) {
    next(error);
  }
};

export const getContact = async (
  req: Request<ContactParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;

    const contact = await contactService.getContactById(id, organizationId);
    if (!contact) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    return res.status(200).json({ data: contact });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (
  req: Request<Record<string, never>, unknown, CreateContactInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { firstName, lastName, email, phone } = req.body;

    const newContact = await contactService.createContact({
      firstName,
      lastName,
      email,
      phone,
      organizationId,
    });

    return res.status(201).json({ message: 'Contacto creado con éxito', data: newContact });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (
  req: Request<ContactParams, unknown, UpdateContactInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;

    const updated = await contactService.updateContact(id, organizationId, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    return res.status(200).json({ message: 'Contacto actualizado', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (
  req: Request<ContactParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.user!.organizationId;
    const { id } = req.params;

    const deleted = await contactService.deleteContact(id, organizationId);
    if (!deleted) {
      return res.status(404).json({ message: 'Contacto no encontrado' });
    }

    return res.status(200).json({ message: 'Contacto eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};