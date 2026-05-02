'use client'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid,
  CircularProgress, Stack, Divider, Select, MenuItem,
  SelectChangeEvent, Chip
} from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts'

export default function AIPage() {
  const router = useRouter()

  const [totalCollection, setTotalCollection] = useState(0)
  const [pendingFees, setPendingFees] = useState(0)
  const [collectionRate, setCollectionRate] = useState(0)
  const [lateParents, setLateParents] = useState<{ id: string; name: string; pending: number }[]>([])
  const [smartInsights, setSmartInsights] = useState<string[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [predictedCollection, setPredictedCollection] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState('April 2026')

  useEffect(() => {
    const fetchData = async () => {
      const { data: students } = await supabase.from('student_fee_summary').select('*')
      const { data: payments } = await supabase.from('payments').select('*')

      const totalCollectionVal = payments?.reduce((s, p) => s + p.amount, 0) || 0
      const pendingFeesVal = students?.reduce((s, st) => s + st.remaining_fee, 0) || 0
      const totalFeeVal = students?.reduce((s, st) => s + st.total_fee, 0) || 0
      const collectionRateVal = totalFeeVal > 0 ? Math.round((totalCollectionVal / totalFeeVal) * 100) : 0

      setTotalCollection(totalCollectionVal)
      setPendingFees(pendingFeesVal)
      setCollectionRate(collectionRateVal)

      const lateStudentsRaw = students
        ?.filter(s => s.status !== 'paid')
        .sort((a, b) => b.remaining_fee - a.remaining_fee)
        .slice(0, 5) || []

      setLateParents(lateStudentsRaw.map(s => ({
        id: s.id,
        name: s.name,
        pending: s.remaining_fee
      })))

      const monthMap: any = {}
      payments?.forEach(p => {
        const date = new Date(p.payment_date)
        const month = date.toLocaleString('default', { month: 'short' })
        if (!monthMap[month]) monthMap[month] = 0
        monthMap[month] += p.amount
      })

      const monthsArray = Object.keys(monthMap).map(m => ({
        month: m,
        amount: monthMap[m]
      }))
      setMonthlyData(monthsArray)

      if (monthsArray.length >= 2) {
        const lastThree = monthsArray.slice(-3).map(m => m.amount)
        const avg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length
        const lastMonth = monthsArray[monthsArray.length - 1].amount
        const prevMonth = monthsArray[monthsArray.length - 2].amount
        const growthRate = prevMonth > 0 ? lastMonth / prevMonth : 1
        const predicted = Math.round((avg * 0.6) + (avg * growthRate * 0.4))
        setPredictedCollection(predicted)
      } else {
        const currentDay = new Date().getDate()
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        setPredictedCollection(Math.round((totalCollectionVal / currentDay) * daysInMonth))
      }

      setPieData([
        { name: 'Paid', value: totalCollectionVal },
        { name: 'Pending', value: pendingFeesVal }
      ])

      const arr: string[] = []
      if (payments?.length) {
        const early = payments.filter(p => new Date(p.payment_date).getDate() <= 10).length
        const late = payments.length - early
        arr.push(
          early > late
            ? '📊 Most payments come between 1–10'
            : '📊 Payments mostly come after mid-month'
        )
      }
      if (collectionRateVal < 50) arr.push('⚠️ Very low collection rate')
      else if (collectionRateVal < 80) arr.push('📉 Average collection')
      else arr.push('✅ Good collection')
      setSmartInsights(arr)
    }

    fetchData()
  }, [])

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value)
  }

  const getProgressColor = () => {
    if (collectionRate < 50) return '#EF4444'
    if (collectionRate < 75) return '#F59E0B'
    return '#22C55E'
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          🧠 AI Insights
        </Typography>
        <Select
          value={selectedMonth}
          onChange={handleMonthChange}
          size="small"
          sx={{ bgcolor: 'white', borderRadius: 2, minWidth: 130 }}
        >
          <MenuItem value="April 2026">April 2026</MenuItem>
          <MenuItem value="March 2026">March 2026</MenuItem>
          <MenuItem value="February 2026">February 2026</MenuItem>
        </Select>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Collection
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                ₹{totalCollection.toLocaleString()}
              </Typography>
              {totalCollection > 0 && (
                <Chip
                  label={`${Math.round((totalCollection / (totalCollection + pendingFees)) * 100)}% of total fee`}
                  size="small"
                  sx={{
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #EF4444' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                ⚠️ Pending Fees
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#B91C1C' }}>
                ₹{pendingFees.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lateParents.length} students overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Collection Rate
              </Typography>
              {/* Fixed Stack: alignItems moved to sx */}
              <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={collectionRate}
                    size={70}
                    thickness={5}
                    sx={{ color: getProgressColor() }}
                  />
                  <Box sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {collectionRate}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {collectionRate >= 80 ? 'Excellent' : collectionRate >= 50 ? 'Average' : 'Needs Attention'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TrendingUp sx={{ color: '#2563EB' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            📈 इस महीने के अंत तक अनुमानित कलेक्शन: 
            <strong style={{ marginLeft: 8 }}>₹{predictedCollection.toLocaleString()}</strong>
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🧠 Smart Insights</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {smartInsights.map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2">{text}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🧑‍🎓 Top Late Parents</Typography>
          {lateParents.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No pending fees 🎉
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
              {lateParents.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: '#FFF8F0',
                    borderRadius: 2,
                    border: '1px solid #FFEDD5',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#3B82F6', textDecoration: 'underline' } }}
                    onClick={() => router.push(`/students/${item.id}`)}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} color="error">
                    ₹{item.pending.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>
                📊 Monthly Collection Trend
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Collection']} />
                  <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#blueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                💰 Paid vs Pending
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#22C55E' : '#EF4444'} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#22C55E' }} />
                  <Typography variant="caption">Paid</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#EF4444' }} />
                  <Typography variant="caption">Pending</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}