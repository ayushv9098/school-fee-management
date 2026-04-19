import type { FeeStatus, StudentWithFee } from '../types'

export const calculateFeeStatus = (
  totalFee: number,
  totalPaid: number
): FeeStatus => {
  const remaining = totalFee - totalPaid
  if (remaining <= 0) return 'paid'
  if (totalPaid === 0) return 'unpaid'
  return 'partial'
}

export const getStatusColor = (status: FeeStatus) => {
  if (status === 'paid') return 'success'
  if (status === 'partial') return 'warning'
  return 'error'
}

export const getStatusLabel = (status: FeeStatus) => {
  if (status === 'paid') return 'Paid'
  if (status === 'partial') return 'Partial'
  return 'Unpaid'
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export const getClassSummary = (students: StudentWithFee[]) => {
  const map = new Map<string, {
    total_students: number
    total_fee: number
    total_collected: number
  }>()

  students.forEach(s => {
    const existing = map.get(s.class) ?? {
      total_students: 0,
      total_fee: 0,
      total_collected: 0,
    }
    map.set(s.class, {
      total_students: existing.total_students + 1,
      total_fee: existing.total_fee + s.total_fee,
      total_collected: existing.total_collected + s.total_paid,
    })
  })

  return Array.from(map.entries())
    .map(([cls, data]) => ({
      class: cls,
      ...data,
      total_pending: data.total_fee - data.total_collected,
    }))
    .sort((a, b) => a.class.localeCompare(b.class))
}