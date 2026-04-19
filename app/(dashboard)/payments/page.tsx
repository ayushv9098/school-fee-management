'use client'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, Table, TableBody,
  TableCell, TableHead, TableRow, Chip, TextField
} from '@mui/material'
import { formatCurrency } from '@/app/lib/calculations'
import { supabase } from '@/app/lib/supabaseclient'
import dayjs from 'dayjs'

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

  const modeColor: any = {
    cash: 'success', upi: 'primary', online: 'info', cheque: 'warning'
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>All Payments</Typography>
      <TextField
        placeholder="Search by student name..."
        value={search} onChange={e => setSearch(e.target.value)}
        size="small" sx={{ mb: 2, minWidth: 260 }}
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
                  <Typography color="success.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(p.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={p.payment_mode?.toUpperCase()}
                    color={modeColor[p.payment_mode] ?? 'default'} size="small" />
                </TableCell>
                <TableCell>{dayjs(p.payment_date).format('DD MMM YYYY')}</TableCell>
                <TableCell>{p.note || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  )
}