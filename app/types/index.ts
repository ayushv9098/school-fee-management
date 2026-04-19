export type PaymentMode = 'cash' | 'upi' | 'online' | 'cheque'
export type FeeStatus = 'paid' | 'partial' | 'unpaid'

export interface Student {
  id: string
  name: string
  class: string
  mobile: string
  guardian_name?: string
  address?: string
  total_fee: number
  academic_year: string
  created_at: string
}

export interface StudentWithFee extends Student {
  total_paid: number
  remaining_fee: number
  status: FeeStatus
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  payment_date: string
  payment_mode: PaymentMode
  note?: string
  received_by?: string
  created_at: string
}

export interface ClassSummary {
  class: string
  total_students: number
  total_fee: number
  total_collected: number
  total_pending: number
}

export interface DashboardStats {
  total_students: number
  total_collection: number
  total_pending: number
  total_paid_students: number
}