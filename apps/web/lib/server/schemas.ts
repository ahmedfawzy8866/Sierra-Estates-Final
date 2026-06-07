import { z } from 'zod';

export const LeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(50),
  message: z.string().max(2000).optional().default(''),
  locale: z.string().max(10).optional().default('en'),
});

export const ViewingRequestSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  unitId: z.string().min(1, 'Unit ID is required'),
  portfolioId: z.string().optional(),
});

export const ListingsQuerySchema = z.object({
  id: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export type LeadInput = z.infer<typeof LeadSchema>;
export type ViewingRequestInput = z.infer<typeof ViewingRequestSchema>;
export type ListingsQuery = z.infer<typeof ListingsQuerySchema>;
