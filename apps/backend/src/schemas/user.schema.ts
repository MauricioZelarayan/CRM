import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
});

export type UpdatePreferencesDTO = z.infer<typeof updatePreferencesSchema>;