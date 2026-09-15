import { api } from './api';
import type { DealStage } from './deal.service';
import type { ActivityType } from './activity.service';

export interface DashboardMetrics {
  kpis: {
    totalPipelineValue: number;
    avgDealValue: number;
    wonValue: number;
    wonCount: number;
    totalDeals: number;
    totalContacts: number;
    winRate: number;
  };
  stageDistribution: Array<{
    stage: DealStage;
    count: number;
    value: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: ActivityType;
    title: string;
    createdAt: string;
    contact?: {
      firstName: string;
      lastName?: string | null;
    };
  }>;
}

export const analyticsService = {
  getDashboardData: async (): Promise<DashboardMetrics> => {
    const res = await api.get<{ data: DashboardMetrics }>('/analytics/dashboard');
    return res.data.data;
  },
};