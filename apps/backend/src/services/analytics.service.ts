import { prisma } from '../config/prisma';

export const analyticsService = {
  async getDashboardMetrics(organizationId: string) {
    // 1. Agregados generales de oportunidades
    const totalDeals = await prisma.deal.count({
      where: { organizationId },
    });

    const pipelineAggregate = await prisma.deal.aggregate({
      where: { organizationId },
      _sum: { value: true },
      _avg: { value: true },
    });

    const wonAggregate = await prisma.deal.aggregate({
      where: { organizationId, stage: 'WON' },
      _sum: { value: true },
      _count: { id: true },
    });

    const lostCount = await prisma.deal.count({
      where: { organizationId, stage: 'LOST' },
    });

    // 2. Tasa de conversión (Won / (Won + Lost))
    const closedDeals = wonAggregate._count.id + lostCount;
    const winRate = closedDeals > 0 
      ? Math.round((wonAggregate._count.id / closedDeals) * 100) 
      : 0;

    // 3. Distribución de deals por etapa
    const stageDistribution = await prisma.deal.groupBy({
      by: ['stage'],
      where: { organizationId },
      _count: { id: true },
      _sum: { value: true },
    });

    // 4. Conteo de contactos y miembros
    const totalContacts = await prisma.contact.count({
      where: { organizationId },
    });

    // 5. Últimas actividades registradas en la organización
    const recentActivities = await prisma.activity.findMany({
      where: { organizationId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return {
      kpis: {
        totalPipelineValue: Number(pipelineAggregate._sum.value || 0),
        avgDealValue: Number(pipelineAggregate._avg.value || 0),
        wonValue: Number(wonAggregate._sum.value || 0),
        wonCount: wonAggregate._count.id,
        totalDeals,
        totalContacts,
        winRate,
      },
      stageDistribution: stageDistribution.map((item) => ({
        stage: item.stage,
        count: item._count.id,
        value: Number(item._sum.value || 0),
      })),
      recentActivities,
    };
  },
};