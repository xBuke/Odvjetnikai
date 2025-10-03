import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().min(1, 'Phone number is required');
export const oibSchema = z.string().min(11, 'OIB must be at least 11 characters').max(11, 'OIB must be exactly 11 characters');

// Client validation schemas
export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: emailSchema,
  phone: phoneSchema,
  oib: oibSchema,
  notes: z.string().optional()
});

export const updateClientSchema = createClientSchema.partial();

// Case validation schemas
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  client_id: z.string().uuid('Invalid client ID'),
  status: z.enum(['Open', 'In Progress', 'Closed']),
  notes: z.string().optional(),
  case_type: z.string().optional(),
  case_status: z.enum(['Zaprimanje', 'Priprema', 'Ročište', 'Presuda']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

export const updateCaseSchema = createCaseSchema.partial();

// Document validation schemas
export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(255, 'Document name is too long'),
  file_url: z.string().url('Invalid file URL').optional(),
  case_id: z.string().uuid('Invalid case ID'),
  file_size: z.number().positive('File size must be positive').optional(),
  file_type: z.string().optional(),
  type: z.enum(['ugovor', 'punomoc', 'tuzba', 'pravni_dokument', 'nacrt_dokumenta', 'financijski_dokument', 'korespondencija', 'dokazni_materijal']).optional()
});

export const updateDocumentSchema = createDocumentSchema.partial();

// Billing validation schemas
export const createBillingSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  case_id: z.string().uuid('Invalid case ID').optional(),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  billing_date: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional()
});

export const updateBillingSchema = createBillingSchema.partial();

// Billing entry validation schemas
export const createBillingEntrySchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  case_id: z.string().uuid('Invalid case ID').optional(),
  hours: z.number().positive('Hours must be positive'),
  rate: z.number().positive('Rate must be positive'),
  notes: z.string().optional()
});

export const updateBillingEntrySchema = createBillingEntrySchema.partial();

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}

// Helper function to create standardized API response
export function createApiResponse<T>(success: boolean, data?: T, error?: string): ApiResponse<T> {
  return { success, data, error };
}
