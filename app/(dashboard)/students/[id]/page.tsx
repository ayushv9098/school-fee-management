'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Grid
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import dayjs from 'dayjs'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/app/lib/calculations'
import { PAYMENT_MODES } from '@/app/lib/constants'
import { supabase } from '@/app/lib/supabaseclient'
import type { StudentWithFee, Payment } from '@/types'

export default function StudentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentWithFee | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [payForm, setPayForm] = useState({
    amount: '', payment_mode: 'cash', note: ''
  })

  const fetchData = useCallback(async () => {
    const { data: s } = await supabase
      .from('student_fee_summary').select('*').eq('id', id).single()
    const { data: p } = await supabase
      .from('payments').select('*')
      .eq('student_id', id).order('payment_date', { ascending: false })
    setStudent(s)
    setPayments(p ?? [])
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => { void fetchData() }, 0)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handlePayment = async () => {
    if (!payForm.amount) return

    const amount = Number(payForm.amount)

    if (amount <= 0) {
      setError('Amount 0 se zyada hona chahiye!')
      return
    }

    if (amount > student!.remaining_fee) {
      setError(`Remaining fee ${formatCurrency(student!.remaining_fee)} se zyada amount nahi dal sakte!`)
      return
    }

    setError('')
    await supabase.from('payments').insert({
      student_id: id,
      amount: amount,
      payment_mode: payForm.payment_mode,
      note: payForm.note,
      payment_date: new Date().toISOString().split('T')[0]
    })
    setOpen(false)
    setPayForm({ amount: '', payment_mode: 'cash', note: '' })
    setSuccess(true)
    void fetchData()
  }

  if (!student) return (
    <Box sx={{ p: 3 }}>
      <Typography>Loading...</Typography>
    </Box>
  )

  const pct = student.total_fee > 0
    ? Math.min((student.total_paid / student.total_fee) * 100, 100) : 0

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>← Back</Button>

      {/* School Header */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px dashed #cfd8dc', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Ayushman Educational Academy
        </Typography>
      </Box>

      {/* Student Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{student.name}</Typography>
              <Typography color="text.secondary">
                {student.class} • {student.mobile || 'No mobile'}
              </Typography>
              {student.guardian_name && (
                <Typography variant="body2" color="text.secondary">
                  Guardian: {student.guardian_name}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
  label={getStatusLabel(student.status)}
  sx={{
    fontWeight: 500,
    fontSize: '12px',
    height: 26,
    borderRadius: '15px',
    bgcolor:
      student.status === 'paid'
        ? '#e8f5e9'
        : '#fff3e0',
    color:
      student.status === 'paid'
        ? '#2e7d32'
        : '#ef6c00',
    border:
      student.status === 'paid'
        ? '1px solid #c8e6c9'
        : '1px solid #ffe0b2'
  }}
/>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                disabled={student.status === 'paid'}
              >
                + Add Payment
              </Button>
            </Box>
          </Box>

          {/* Fee Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Total Fee</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(student.total_fee)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Paid</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }} color="success.main">
                {formatCurrency(student.total_paid)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Remaining</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }} color="error.main">
                {formatCurrency(Math.max(student.remaining_fee, 0))}
              </Typography>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Payment Progress</Typography>
              <Typography variant="caption" fontWeight={700}>{Math.round(pct)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              color={getStatusColor(student.status)}
              sx={{ height: 7, borderRadius: 2 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
      <Card>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell>#</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p, i) => (
              <TableRow key={p.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{dayjs(p.payment_date).format('DD MMM YYYY')}</TableCell>
                <TableCell>
                  <Typography color="success.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(p.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                <Chip
  label={p.payment_mode.toUpperCase()}
  size="small"
  sx={{
    bgcolor:
      p.payment_mode === 'cash' ? '#F1F8E9' :
      p.payment_mode === 'upi' ? '#E8F4FD' :
      p.payment_mode === 'online' ? '#F8F0FF' : '#FFFDE7',
    color:
      p.payment_mode === 'cash' ? '#558B2F' :
      p.payment_mode === 'upi' ? '#1976D2' :
      p.payment_mode === 'online' ? '#7B1FA2' : '#F9A825',
    border: '1px solid',
    borderColor:
      p.payment_mode === 'cash' ? '#C5E1A5' :
      p.payment_mode === 'upi' ? '#BBDEFB' :
      p.payment_mode === 'online' ? '#E1BEE7' : '#FFF176',
    fontWeight: 600,
    fontSize: 11,
    borderRadius: 10,
  }}
/>
                </TableCell>
                <TableCell>{p.note || '-'}</TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No payments yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog
        open={open}
        onClose={() => { setOpen(false); setError('') }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment — {student.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={`Amount (Remaining: ${formatCurrency(student.remaining_fee)})`}
              type="number"
              fullWidth
              value={payForm.amount}
              onChange={e => {
                setPayForm({ ...payForm, amount: e.target.value })
                setError('')
              }}
            />
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={payForm.payment_mode}
                label="Payment Mode"
                onChange={e => setPayForm({ ...payForm, payment_mode: e.target.value })}
              >
                {PAYMENT_MODES.map(m => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Note (optional)"
              fullWidth
              multiline
              rows={2}
              value={payForm.note}
              onChange={e => setPayForm({ ...payForm, note: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setError('') }}>Cancel</Button>
          <Button variant="contained" onClick={handlePayment}>Save Payment</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">Payment saved successfully! ✅</Alert>
      </Snackbar>
    </Box>
  )
}