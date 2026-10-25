import { z } from 'zod'

/**
 * Validation schemas for all API requests
 * Using Zod for type-safe runtime validation
 */

// ============ AUTH SCHEMAS ============

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['resident', 'admin', 'watchman'], {
    errorMap: () => ({ message: 'Invalid role' })
  })
})

export type LoginRequest = z.infer<typeof loginSchema>

// ============ PROPERTY SCHEMAS ============

export const createPropertySchema = z.object({
  resident_id: z.string().uuid('Invalid resident ID'),
  property_type: z.enum(['villa', 'bungalow', 'flat']),
  unit_number: z.string().min(1, 'Unit number is required'),
  area_sqft: z.number().positive('Area must be positive')
})

export type CreatePropertyRequest = z.infer<typeof createPropertySchema>

// ============ BILL SCHEMAS ============

export const createBillSchema = z.object({
  resident_id: z.string().uuid('Invalid resident ID'),
  amount: z.number().positive('Amount must be positive'),
  bill_type: z.enum(['monthly', 'quarterly', 'annual']),
  due_date: z.string().datetime('Invalid date format')
})

export type CreateBillRequest = z.infer<typeof createBillSchema>

export const payBillSchema = z.object({
  bill_id: z.string().uuid('Invalid bill ID'),
  amount: z.number().positive('Amount must be positive'),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'cheque'])
})

export type PayBillRequest = z.infer<typeof payBillSchema>

export const confirmPaymentSchema = z.object({
  payment_id: z.string().uuid('Invalid payment ID'),
  confirmed: z.boolean()
})

export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentSchema>

// ============ COMPLAINT SCHEMAS ============

export const createComplaintSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

export type CreateComplaintRequest = z.infer<typeof createComplaintSchema>

export const respondComplaintSchema = z.object({
  complaint_id: z.string().uuid('Invalid complaint ID'),
  response_text: z.string().min(10, 'Response must be at least 10 characters'),
  status: z.enum(['in_progress', 'resolved', 'closed'])
})

export type RespondComplaintRequest = z.infer<typeof respondComplaintSchema>

// ============ VISITOR SCHEMAS ============

export const logVisitorSchema = z.object({
  visitor_name: z.string().min(2, 'Visitor name is required'),
  visitor_phone: z.string().optional(),
  property_id: z.string().uuid('Invalid property ID'),
  check_in_time: z.string().datetime('Invalid check-in time')
})

export type LogVisitorRequest = z.infer<typeof logVisitorSchema>

export const approveVisitorSchema = z.object({
  visitor_log_id: z.string().uuid('Invalid visitor log ID'),
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
  blacklist_requested: z.boolean().default(false),
  blacklist_scope: z.enum(['unit_only', 'society_wide']).optional()
})

export type ApproveVisitorRequest = z.infer<typeof approveVisitorSchema>

// ============ AMENITY SCHEMAS ============

export const createAmenitySchema = z.object({
  name: z.string().min(2, 'Amenity name is required'),
  description: z.string().optional(),
  capacity: z.number().int().positive('Capacity must be positive'),
  cost_per_hour: z.number().nonnegative('Cost cannot be negative'),
  available_hours_start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format HH:MM'),
  available_hours_end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format HH:MM')
})

export type CreateAmenityRequest = z.infer<typeof createAmenitySchema>

export const bookAmenitySchema = z.object({
  amenity_id: z.string().uuid('Invalid amenity ID'),
  booking_date: z.string().date('Invalid booking date'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid start time'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid end time')
})

export type BookAmenityRequest = z.infer<typeof bookAmenitySchema>

// ============ PARCEL SCHEMAS ============

export const logParcelSchema = z.object({
  recipient_name: z.string().min(2, 'Recipient name is required'),
  property_id: z.string().uuid('Invalid property ID'),
  courier_company: z.string().min(1, 'Courier company is required'),
  description: z.string().min(5, 'Description is required')
})

export type LogParcelRequest = z.infer<typeof logParcelSchema>

export const confirmParcelReceiptSchema = z.object({
  parcel_id: z.string().uuid('Invalid parcel ID')
})

export type ConfirmParcelReceiptRequest = z.infer<typeof confirmParcelReceiptSchema>

// ============ WATCHMAN SCHEMAS ============

export const checkInSchema = z.object({
  duty_date: z.string().date('Invalid duty date')
})

export type CheckInRequest = z.infer<typeof checkInSchema>

export const emergencyAlertSchema = z.object({
  alert_type: z.string().min(1, 'Alert type is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('high')
})

export type EmergencyAlertRequest = z.infer<typeof emergencyAlertSchema>

// ============ MESSAGE SCHEMAS ============

export const sendMessageSchema = z.object({
  receiver_id: z.string().uuid('Invalid receiver ID'),
  receiver_type: z.enum(['resident', 'admin', 'watchman']),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Message is required'),
  attachment_url: z.string().url('Invalid attachment URL').optional()
})

export type SendMessageRequest = z.infer<typeof sendMessageSchema>

// ============ UTILITY FUNCTION ============

/**
 * Validate request body against schema
 */
export function validateRequest<T>(schema: z.ZodSchema, data: any): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`)
  }

  return result.data as T
}
