import { api } from './api';

export type TriggerEvent = 'DEAL_STAGE_CHANGED' | 'DEAL_WON' | 'CONTACT_CREATED';
export type ActionType = 'CREATE_TASK' | 'SEND_EMAIL' | 'NOTIFY_TEAM';

export interface WorkflowAction {
  id: string;
  actionType: ActionType;
  payload: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  triggerEvent: TriggerEvent;
  active: boolean;
  actions: WorkflowAction[];
  createdAt: string;
}

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  triggerEvent: TriggerEvent;
  active?: boolean;
  actions: Array<{ actionType: ActionType; payload: Record<string, unknown> }>;
}

export const workflowService = {
  getAll: async (): Promise<Workflow[]> => {
    const res = await api.get<{ data: Workflow[] }>('/workflows');
    return res.data.data;
  },

  create: async (data: CreateWorkflowDTO): Promise<Workflow> => {
    const res = await api.post<{ message: string; data: Workflow }>('/workflows', data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}`);
  },
};