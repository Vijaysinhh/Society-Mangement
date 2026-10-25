// Database entity types
export interface Society {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  phone: string
  contact_person: string
  villas: number
  bungalows: number
  flats: number
  created_at: string
  updated_at: string
}

export interface SocietyAdmin {
  id: string
  society_id: string
  username: string
  password_hash: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Resident {
  id: string
  society_id: string
  username: string
  password_hash: string
  name: string
  email: string
  phone: string
  property_id: string | null
  unit_number: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Watchman {
  id: string
  society_id: string
  username: string
  password_hash: string
  name: string
  email: string
  phone: string
  shift_timing: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// Flow 1: Property Management (auto-created on resident signup)
export interface Property {
  id: string
  society_id: string
  resident_id: string
  property_type: 'villa' | 'bungalow' | 'flat'
  unit_number: string
  area_sqft: number
  created_at: string
  updated_at: string
}

// Flow 2: Maintenance Bills
export interface MaintenanceBill {
  id: string
  society_id: string
  property_id: string
  resident_id: string
  amount: number
  bill_type: 'monthly' | 'quarterly' | 'annual'
  due_date: string
  created_at: string
  updated_at: string
}

export interface BillPayment {
  id: string
  bill_id: string
  resident_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  transaction_id: string | null
  status: 'pending' | 'confirmed' | 'failed'
  confirmed_by_admin_id: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

// Flow 3: Complaints
export interface Complaint {
  id: string
  society_id: string
  resident_id: string
  property_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export interface ComplaintResponse {
  id: string
  complaint_id: string
  admin_id: string
  response_text: string
  status_update: string
  created_at: string
}

// Flow 4: Visitor Access
export interface VisitorPreApproval {
  id: string
  society_id: string
  resident_id: string
  property_id: string
  visitor_name: string
  visitor_phone: string | null
  visit_date: string
  visit_time: string
  duration_hours: number
  purpose: string
  status: 'approved' | 'rejected' | 'pending'
  created_at: string
}

export interface VisitorLog {
  id: string
  society_id: string
  watchman_id: string
  visitor_name: string
  visitor_phone: string | null
  property_id: string | null
  resident_id: string | null
  check_in_time: string
  check_out_time: string | null
  description: string
  status: 'pending_approval' | 'approved' | 'rejected'
  resident_decision: 'approved' | 'rejected' | null
  resident_decision_at: string | null
  created_at: string
}

export interface VisitorApproval {
  id: string
  visitor_log_id: string
  resident_id: string
  decision: 'approved' | 'rejected'
  reason: string | null
  blacklist_requested: boolean
  blacklist_scope: 'unit_only' | 'society_wide' | null
  decided_at: string
}

// Flow 8: Visitor Blacklist
export interface VisitorBlacklist {
  id: string
  society_id: string
  property_id: string | null
  visitor_name: string
  visitor_phone: string | null
  reason: string
  scope: 'unit_only' | 'society_wide'
  added_by_resident_id: string | null
  added_by_watchman_id: string | null
  status: 'active' | 'removed'
  created_at: string
  removed_at: string | null
}

// Flow 6: Amenity Booking
export interface Amenity {
  id: string
  society_id: string
  name: string
  description: string
  capacity: number
  cost_per_hour: number
  available_hours_start: string
  available_hours_end: string
  created_at: string
}

export interface AmenityBooking {
  id: string
  amenity_id: string
  resident_id: string
  property_id: string
  society_id: string
  booking_date: string
  start_time: string
  end_time: string
  total_hours: number
  cost: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  approved_by_admin_id: string | null
  approved_at: string | null
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
}

// Flow 7: Financial Data
export interface FinancialData {
  id: string
  society_id: string
  period: string
  total_collected: number
  total_expenses: number
  balance: number
  expense_breakdown: Record<string, number>
  created_at: string
  updated_at: string
}

// Flow 9: Parcel Management
export interface Parcel {
  id: string
  society_id: string
  property_id: string
  resident_id: string
  recipient_name: string
  courier_company: string
  description: string
  logged_by_watchman_id: string
  logged_at: string
  received_at: string | null
  status: 'pending' | 'received' | 'unclaimed'
  created_at: string
}

// Flow 10: Watchman Schedule
export interface DutySchedule {
  id: string
  society_id: string
  watchman_id: string
  day_of_week: number
  start_time: string
  end_time: string
  area_assigned: string
  created_at: string
}

export interface DutyLog {
  id: string
  society_id: string
  watchman_id: string
  duty_date: string
  check_in_time: string | null
  check_out_time: string | null
  status: 'present' | 'absent' | 'leave'
  duration_hours: number | null
  created_at: string
}

// Flow 12: In-App Messaging
export interface Message {
  id: string
  society_id: string
  sender_id: string
  sender_type: 'resident' | 'admin' | 'watchman'
  receiver_id: string
  receiver_type: 'resident' | 'admin' | 'watchman'
  subject: string
  content: string
  attachment_url: string | null
  read: boolean
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: string
  society_id: string
  resident_id: string
  admin_id: string | null
  watchman_id: string | null
  subject: string
  status: 'active' | 'resolved' | 'archived'
  message_count: number
  last_message_at: string
  created_at: string
}

// Flow 13: Offline Cache
export interface OfflineCache {
  key: string
  data: any
  timestamp: string
  expires_at: string
}

// Flow 14: Payment Reminders
export interface PaymentReminder {
  id: string
  bill_id: string
  resident_id: string
  sent_at: string
  reminder_count: number
  next_reminder_at: string | null
  status: 'sent' | 'acknowledged' | 'failed'
}

export interface PaymentStatus {
  id: string
  bill_id: string
  status: 'paid' | 'pending' | 'overdue' | 'disputed'
  days_overdue: number
  last_payment_date: string | null
  payment_history: BillPayment[]
}

// Emergency Alerts
export interface EmergencyAlert {
  id: string
  society_id: string
  watchman_id: string
  alert_type: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  notified_to_admin: boolean
  notified_to_residents: boolean
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: Omit<SocietyAdmin | Resident | Watchman, 'password_hash'>
  error?: string
}
