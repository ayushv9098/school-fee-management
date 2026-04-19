'use client'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent,
  LinearProgress, Chip
} from '@mui/material'
import { formatCurrency, getClassSummary } from '@/app/lib/calculations'
import { supabase } from '@/app/lib/supabaseclient'
import type { StudentWithFee } from '@/types'

export default function ClassesPage() {
  const [students, setStudents] = useState<StudentWithFee[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('student_fee_summary').select('*')
      setStudents(data ?? [])
    }
    fetch()
  }, [])

  const summary = getClassSummary(students)

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Class-wise Report</Typography>
      <Grid container spacing={2}>
        {summary.map(cls => {
          const pct = cls.total_fee > 0
            ? (cls.total_collected / cls.total_fee) * 100 : 0
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.class}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{cls.class}</Typography>
                    <Chip label={`${cls.total_students} students`}
                      size="small" color="primary" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Total Fee</Typography>
                      <Typography sx={{ fontWeight: 600 }}>{formatCurrency(cls.total_fee)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Collected</Typography>
                      <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(cls.total_collected)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                      <Typography sx={{ fontWeight: 600, color: 'error.main' }}>
                        {formatCurrency(cls.total_pending)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Collection Progress</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{Math.round(pct)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pct}
                      color={pct === 100 ? 'success' : pct > 50 ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
        {summary.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 6 }}>
              No data yet. Add students first.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
