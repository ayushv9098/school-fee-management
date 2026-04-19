'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  Box, Typography, Button, TextField, MenuItem,
  Select, FormControl, InputLabel, Chip, LinearProgress
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import { CLASS_LIST } from '@/app/lib/constants'
import { supabase } from '@/app/lib/supabaseclient'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/app/lib/calculations'
import type { StudentWithFee } from '@/types'

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentWithFee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchStudents = useCallback(async () => {
    let query = supabase.from('student_fee_summary').select('*').order('name')
    if (filterClass) query = query.eq('class', filterClass)
    if (filterStatus) query = query.eq('status', filterStatus)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query
    setStudents(data ?? [])
    setLoading(false)
  }, [filterClass, filterStatus, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStudents()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchStudents])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchStudents)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchStudents])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Student Name', flex: 1.5, minWidth: 150 },
    { field: 'class', headerName: 'Class', flex: 1, minWidth: 100 },
    { field: 'mobile', headerName: 'Mobile', flex: 1, minWidth: 120 },
    {
      field: 'total_fee', headerName: 'Total Fee', flex: 1, minWidth: 120,
      renderCell: (p) => formatCurrency(p.value)
    },
    {
      field: 'total_paid', headerName: 'Paid', flex: 1, minWidth: 120,
      renderCell: (p) => (
        <Typography color="success.main" sx={{ fontWeight: 600 }}>
          {formatCurrency(p.value)}
        </Typography>
      )
    },
    {
      field: 'remaining_fee', headerName: 'Remaining', flex: 1, minWidth: 120,
      renderCell: (p) => (
        <Typography color={p.value > 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 600 }}>
          {formatCurrency(p.value)}
        </Typography>
      )
    },
    {
      field: 'status', headerName: 'Status', flex: 1, minWidth: 110,
      renderCell: (p) => (
        <Chip
          label={getStatusLabel(p.value)}
          color={getStatusColor(p.value)}
          size="small"
        />
      )
    },
    {
      field: 'progress', headerName: 'Progress', flex: 1.5, minWidth: 150,
      renderCell: (p) => {
        const pct = p.row.total_fee > 0
          ? (p.row.total_paid / p.row.total_fee) * 100 : 0
        return (
          <Box sx={{ width: '100%', mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              color={getStatusColor(p.row.status)}
              sx={{ borderRadius: 2, height: 8 }}
            />
            <Typography variant="caption">{Math.round(pct)}%</Typography>
          </Box>
        )
      }
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Students</Typography>
        <Button variant="contained" onClick={() => router.push('/students/add')}>
          + Add Student
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Class</InputLabel>
          <Select value={filterClass} label="Class"
            onChange={e => setFilterClass(e.target.value)}>
            <MenuItem value="">All Classes</MenuItem>
            {CLASS_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status"
            onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
          </Select>
        </FormControl>
        {(filterClass || filterStatus || search) && (
          <Button variant="outlined" size="small"
            onClick={() => { setSearch(''); setFilterClass(''); setFilterStatus('') }}>
            Clear Filters
          </Button>
        )}
      </Box>
      

      <DataGrid
        rows={students}
        columns={columns}
        loading={loading}
        autoHeight
        onRowClick={p => router.push(`/students/${p.id}`)}
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          cursor: 'pointer',
          '& .MuiDataGrid-row:hover': { bgcolor: '#f0f7ff' }
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } }
        }}
      />
    </Box>
  )
}