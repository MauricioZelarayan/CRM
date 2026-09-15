import { prisma } from '../config/prisma';
import type { CreateDealDTO } from '../schemas/deal.schema';
import { workflowService } from './workflow.service';
import type { DealStage } from '@prisma/client';

export const dealService = {
  // 1. Listar tratos del tenant actual (OWASP #3)
  async getAll(organizationId: string) {
    return prisma.deal.findMany({
      where: { organizationId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        dealProducts: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // 2. Crear trato con cálculo atómico de monto e inventario
  async create(organizationId: string, data: CreateDealDTO) {
    return prisma.$transaction(async (tx) => {
      let finalValue = 0;
      let selectedProduct = null;

      // TypeScript ahora infiere los tipos de forma segura gracias a Zod
      if (data.quoteType === 'CATALOG') {
        selectedProduct = await tx.product.findFirst({
          where: { id: data.productId, organizationId },
        });

        if (!selectedProduct) {
          throw new Error('El producto seleccionado no existe en su organización.');
        }

        finalValue = Number(selectedProduct.price) * data.quantity;
      } else if (data.quoteType === 'MANUAL') {
        finalValue = data.manualValue;
      }

      const newDeal = await tx.deal.create({
        data: {
          title: data.title,
          value: finalValue,
          stage: data.stage || 'LEAD',
          contactId: data.contactId || null,
          organizationId,
        },
      });

      // Lógica de inventario solo si es catálogo
      if (data.quoteType === 'CATALOG' && selectedProduct) {
        await tx.dealProduct.create({
          data: {
            dealId: newDeal.id,
            productId: selectedProduct.id,
            quantity: data.quantity,
            unitPrice: selectedProduct.price,
          },
        });

        if (data.stage === 'WON') {
          if (selectedProduct.stock < data.quantity) {
            throw new Error(`Stock insuficiente para "${selectedProduct.name}".`);
          }

          await tx.product.update({
            where: { id: selectedProduct.id },
            data: { stock: { decrement: data.quantity } },
          });
        }
      }

      return newDeal;
    });
  },

  // 3. Cambiar etapa comprobando tenencia y ajustando existencias de stock
  async updateStage(dealId: string, newStage: DealStage, organizationId: string) {
    return prisma.$transaction(async (tx) => {
      const deal = await tx.deal.findFirst({
        where: { id: dealId, organizationId },
        include: {
          dealProducts: {
            include: { product: true },
          },
          contact: true,
        },
      });

      if (!deal) {
        throw new Error('Oportunidad no encontrada en su organización.');
      }

      // Si pasa a WON: Descontar stock si cuenta con productos asociados
      if (newStage === 'WON' && deal.stage !== 'WON') {
        for (const item of deal.dealProducts) {
          if (item.product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para el producto "${item.product.name}". Disponible: ${item.product.stock}, Requerido: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Si se revierte desde WON: Restaurar stock devuelto
      if (deal.stage === 'WON' && newStage !== 'WON') {
        for (const item of deal.dealProducts) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      const updatedDeal = await tx.deal.update({
        where: { id: dealId },
        data: { stage: newStage },
        include: {
          dealProducts: { include: { product: true } },
          contact: true,
        },
      });

      return updatedDeal;
    }).then((updatedDeal) => {
      // Disparo asíncrono de automatizaciones
      if (newStage === 'WON') {
        workflowService.dispatchEvent('DEAL_WON', organizationId, {
          dealId: updatedDeal.id,
          contactId: updatedDeal.contactId || undefined,
          title: updatedDeal.title,
        }).catch(console.error);
      }

      workflowService.dispatchEvent('DEAL_STAGE_CHANGED', organizationId, {
        dealId: updatedDeal.id,
        contactId: updatedDeal.contactId || undefined,
        title: updatedDeal.title,
      }).catch(console.error);

      return updatedDeal;
    });
  },

  // 4. Eliminar oportunidad validando tenencia
  async delete(id: string, organizationId: string) {
    const deal = await prisma.deal.findFirst({
      where: { id, organizationId },
    });

    if (!deal) {
      throw new Error('Trato u oportunidad no encontrada en su organización.');
    }

    return prisma.deal.delete({
      where: { id },
    });
  },
};