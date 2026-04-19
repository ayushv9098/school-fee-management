'use client'
import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography,
  CircularProgress, Chip
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>Dashboard</Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map(card => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={card.label}>
            <Card sx={{ height: '100%' }}>
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
                <CardContent sx={{ p: '20px !important' }}>

                  {/* Header */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
  <Chip
    label={`${cls.total_students} students`}
    size="small"
    variant="outlined"
    color="primary"
    sx={{ position: 'absolute', top: 0, right: 0 }}
  />
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
                      <Typography variant="caption" fontWeight={700}
                        color={pct >= 100 ? 'success.main' : pct > 50 ? 'warning.main' : 'error.main'}>
                        {Math.round(pct)}%
                      </Typography>
                    </Box>
                    <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#eee', overflow: 'hidden' }}>
                      <Box sx={{
                        height: '100%',
                        width: `${pct}%`,
                        bgcolor: pct >= 100 ? '#2E7D32' : pct > 50 ? '#E65100' : '#C62828',
                        borderRadius: 4,
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                  </Box>

                  {/* Collected & Pending */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
  <PeopleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
  <Typography variant="caption" fontWeight={700} color="primary.main">
    {cls.total_students}
  </Typography>
</Box>
                  <Typography variant="caption" color="primary"
                    sx={{ mt: 2, display: 'block', fontWeight: 600 }}>
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