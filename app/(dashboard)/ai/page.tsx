'use client'
import { useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material'
import { supabase } from '@/app/lib/supabaseclient'

export default function AIPage() {
  const [insights, setInsights] = useState([
    { title: 'Total Collection', value: '₹0', color: '#E3F2FD' },
    { title: 'Pending Fees', value: '₹0', color: '#FFEBEE' },
    { title: 'Collection Rate', value: '0%', color: '#E8F5E9' },
  ])

  const [lateParents, setLateParents] = useState<string[]>([])
  const [smartInsights, setSmartInsights] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: students } = await supabase
        .from('student_fee_summary')
        .select('*')

      const { data: payments } = await supabase
        .from('payments')
        .select('*')

      // ✅ calculations
      const totalCollection =
        payments?.reduce((sum, p) => sum + p.amount, 0) || 0

      const pendingFees =
        students?.reduce((sum, s) => sum + s.remaining_fee, 0) || 0

      const totalFee =
        students?.reduce((sum, s) => sum + s.total_fee, 0) || 0

      const collectionRate =
        totalFee > 0 ? Math.round((totalCollection / totalFee) * 100) : 0

      // ✅ late parents (top 3 unpaid)
      const late =
        students
          ?.filter(s => s.status !== 'paid')
          .sort((a, b) => b.remaining_fee - a.remaining_fee)
          .slice(0, 3)
          .map(s => s.name) || []

      // ✅ set data
      setInsights([
        {
          title: 'Total Collection',
          value: `₹${totalCollection}`,
          color: '#E3F2FD'
        },
        {
          title: 'Pending Fees',
          value: `₹${pendingFees}`,
          color: '#FFEBEE'
        },
        {
          title: 'Collection Rate',
          value: `${collectionRate}%`,
          color: '#E8F5E9'
        },
      ])

      setLateParents(late)
    }

    fetchData()
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        🧠 AI Insights
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {insights.map((item, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: item.color,
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
        {smartInsights.map((text, i) => (
  <Typography key={i} variant="body2" sx={{ mb: 1 }}>
    {text}
  </Typography>
))}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} sx={{ mb: 2 }}>
            🧍 Top Late Parents
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {lateParents.map((name, i) => (
              <Chip
                key={i}
                label={name}
                sx={{
                  bgcolor: '#FFF3E0',
                  color: '#E65100',
                  borderRadius: 2,
                  fontWeight: 600
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}