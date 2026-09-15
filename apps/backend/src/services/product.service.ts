import { prisma } from '../config/prisma';
import type { CreateProductDTO, UpdateProductDTO, DealProductItemDTO } from '../schemas/product.schema';

export const productService = {
  // --- Catálogo de Productos (Multi-Tenant) ---
  async getAll(organizationId: string) {
    return prisma.product.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(organizationId: string, data: CreateProductDTO) {
    return prisma.product.create({
      data: {
        ...data,
        organizationId,
      },
    });
  },

  async update(id: string, organizationId: string, data: UpdateProductDTO) {
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!product) throw new Error('Producto no encontrado en su organización.');

    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, organizationId: string) {
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!product) throw new Error('Producto no encontrado en su organización.');

    return prisma.product.delete({
      where: { id },
    });
  },

  // --- Line Items en Deals (Transacción Atómica) ---
  async setDealProducts(dealId: string, organizationId: string, items: DealProductItemDTO[]) {
    return prisma.$transaction(async (tx) => {
      // 1. Validar que el Deal pertenece a la organización (OWASP #3)
      const deal = await tx.deal.findFirst({
        where: { id: dealId, organizationId },
      });
      if (!deal) throw new Error('Oportunidad no encontrada en su organización.');

      // 2. Limpiar ítems previos del Deal
      await tx.dealProduct.deleteMany({
        where: { dealId },
      });

      if (items.length === 0) {
        return tx.deal.update({
          where: { id: dealId },
          data: { value: 0 },
          include: { dealProducts: { include: { product: true } } },
        });
      }

      // 3. Validar productos y congelar precios
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, organizationId },
      });

      if (dbProducts.length !== productIds.length) {
        throw new Error('Uno o más productos seleccionados no existen en su organización.');
      }

      let totalValue = 0;
      const recordsToCreate = items.map((item) => {
        const prod = dbProducts.find((p) => p.id === item.productId)!;
        const finalPrice = item.unitPrice !== undefined ? item.unitPrice : Number(prod.price);
        totalValue += finalPrice * item.quantity;

        return {
          dealId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: finalPrice,
        };
      });

      // 4. Insertar ítems congelando precios
      await tx.dealProduct.createMany({
        data: recordsToCreate,
      });

      // 5. Actualizar el valor consolidado del Deal
      return tx.deal.update({
        where: { id: dealId },
        data: { value: totalValue },
        include: {
          dealProducts: {
            include: { product: true },
          },
        },
      });
    });
  },
};