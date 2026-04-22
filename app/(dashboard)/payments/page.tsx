'use client'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, Table, TableBody,
  TableCell, TableHead, TableRow, Chip, TextField
} from '@mui/material'
import { supabase } from '@/app/lib/supabaseclient'
import { formatCurrency } from '@/app/lib/calculations'
import dayjs from 'dayjs'

const getPaymentChip = (mode: string) => (
  <Chip
    label={mode.toUpperCase()}
    size="small"
    sx={{
      bgcolor:
        mode === 'cash' ? '#F1F8E9' :
        mode === 'upi' ? '#E8F4FD' :
        mode === 'online' ? '#F8F0FF' : '#FFFDE7',
      color:
        mode === 'cash' ? '#558B2F' :
        mode === 'upi' ? '#1976D2' :
        mode === 'online' ? '#7B1FA2' : '#F9A825',
      border: '1px solid',
      borderColor:
        mode === 'cash' ? '#C5E1A5' :
        mode === 'upi' ? '#BBDEFB' :
        mode === 'online' ? '#E1BEE7' : '#FFF176',
      fontWeight: 600,
      fontSize: 11,
      borderRadius: 10,
    }}
  />
)

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*, students(name, class)')
        .order('created_at', { ascending: false })
        .limit(200)
      setPayments(data ?? [])
    }
    fetch()
  }, [])

  const filtered = payments.filter(p =>
    p.students?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>All Payments</Typography>
      <TextField
        placeholder="Search by student name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 260 }}
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f7fa' }}>
              <TableCell>#</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p, i) => (
              <TableRow key={p.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{p.students?.name}</TableCell>
                <TableCell>{p.students?.class}</TableCell>
                <TableCell>
                  <Typography color="success.main" fontWeight={700}>
                    {formatCurrency(p.amount)}
                  </Typography>
                </TableCell>
                <TableCell>{getPaymentChip(p.payment_mode)}</TableCell>
                <TableCell>{dayjs(p.payment_date).format('DD MMM YYYY')}</TableCell>
                <TableCell>{p.note || '-'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={3}>No payments found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  )
}