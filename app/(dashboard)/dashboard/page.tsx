'use client'
import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography,
  CircularProgress
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'
import { formatCurrency, getClassSummary } from '@/app/lib/calculations'
import type { StudentWithFee } from '@/types'
import PeopleIcon from '@mui/icons-material/People'

export default function DashboardPage() {
  const [students, setStudents] = useState<StudentWithFee[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('student_fee_summary').select('*')
      setStudents(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  )

  const totalStudents = students.length
  const totalCollection = students.reduce((s, x) => s + x.total_paid, 0)
  const totalPending = students.reduce((s, x) => s + x.remaining_fee, 0)
  const totalFees = students.reduce((s, x) => s + x.total_fee, 0)
  const paidStudents = students.filter(s => s.status === 'paid').length
  const classSummary = getClassSummary(students)

  const statCards = [
    { label: 'Total Students', value: totalStudents },
    { label: 'Total Fees', value: formatCurrency(totalFees) },
    { label: 'Total Collected', value: formatCurrency(totalCollection) },
    { label: 'Total Pending', value: formatCurrency(totalPending) },
    { label: 'Fully Paid', value: paidStudents },
  ]

  return (
    <Box
  sx={{
    p: { xs: 2, md: 3 },
    bgcolor: '#F6F9FC', // soft background
    minHeight: '100vh'
  }}
>
      <Typography variant="h5" mb={3}>Dashboard</Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
       {statCards.map(card => (
  <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={card.label}>
    <Card
      onClick={() => {
        if (card.label === 'Total Students') {
          router.push('/students')
        }
        if (card.label === 'Fully Paid') {
          router.push('/students?status=paid')
        }
      }}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
              <CardContent sx={{ p: '20px !important' }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {card.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Class wise */}
      <Typography variant="h6" mb={2}>Class-wise Summary</Typography>
      <Grid container spacing={2}>
        {classSummary.map(cls => {
          const pct = cls.total_fee > 0
            ? Math.min((cls.total_collected / cls.total_fee) * 100, 100) : 0
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.class}>
              <Card
                onClick={() => router.push(`/students?class=${encodeURIComponent(cls.class)}`)}
                sx={{
                  cursor: 'pointer', height: '100%',
                  '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }
                }}
              >
                <CardContent sx={{ p: '16px !important' }}>

                  {/* Header */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Box sx={{
                      position: 'absolute', top: 0, right: 0,
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      bgcolor: '#EEF2FF', borderRadius: 2, px: 1, py: 0.3
                    }}>
                      <PeopleIcon sx={{ fontSize: 13, color: '#6366F1' }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6366F1' }}>
                        {cls.total_students}
                      </Typography>
                    </Box>
                    <Typography fontWeight={700} fontSize={16}>{cls.class}</Typography>
                  </Box>

                  {/* Total Fee */}
                  <Box sx={{ borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', py: 1.5, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Total Fee</Typography>
                      <Typography variant="body2" fontWeight={700}>{formatCurrency(cls.total_fee)}</Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.8}>
  <Typography variant="caption" color="text.secondary">Collection Progress</Typography>
  <Typography variant="caption" fontWeight={700} sx={{
    color: pct >= 100 ? '#16A34A' : pct > 50 ? '#D97706' : '#DC2626'
  }}>
    {Math.round(pct)}%
  </Typography>
</Box>
                    <Box sx={{ height: 7, borderRadius: 4, bgcolor: '#F3F4F6', overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%',
                        width: `${pct}%`,
                        bgcolor: pct >= 100 ? '#86EFAC' : pct > 50 ? '#FCD34D' : '#FCA5A5',
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>

                  {/* Collected & Pending */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>● Collected</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#16A34A' }}>
                        {formatCurrency(cls.total_collected)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>● Pending</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#DC2626' }}>
                        {formatCurrency(Math.max(cls.total_pending, 0))}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                    View Students →
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          )
        })}
        {classSummary.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary" textAlign="center" mt={4}>
              No students yet. Add students to see class-wise data.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}