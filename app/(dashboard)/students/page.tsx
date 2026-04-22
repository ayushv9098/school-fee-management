'use client'
import { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button, TextField, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import { CLASS_LIST } from '@/app/lib/constants'
import { supabase } from '@/app/lib/supabaseclient'
import { formatCurrency } from '@/app/lib/calculations'
import type { StudentWithFee } from '@/types'
import { useSearchParams } from 'next/navigation'

export default function StudentsPage() {
  const searchParams = useSearchParams()
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
    const timer = setTimeout(() => { void fetchStudents() }, 0)
    return () => clearTimeout(timer)
  }, [fetchStudents])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchStudents)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchStudents])
  
  useEffect(() => {
    const status = searchParams.get('status')
    
    if (status) {
      setFilterStatus(status)
    }
  }, [searchParams])

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Student Name',
      flex: 1.5,
      minWidth: 140,
      renderCell: (p) => <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
    },
    { field: 'class', headerName: 'Class', flex: 0.8, minWidth: 90 },
    {
      field: 'mobile',
      headerName: 'Mobile',
      flex: 1,
      minWidth: 110,
      renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value || '-'}</Typography>
    },
    {
      field: 'total_fee',
      headerName: 'Total Fee',
      flex: 1,
      minWidth: 110,
      renderCell: (p) => <Typography variant="body2">{formatCurrency(p.value)}</Typography>
    },
    {
      field: 'total_paid',
      headerName: 'Paid',
      flex: 1,
      minWidth: 110,
      renderCell: (p) => <Typography variant="body2" color="success.main" fontWeight={600}>{formatCurrency(p.value)}</Typography>
    },
    {
      field: 'remaining_fee',
      headerName: 'Remaining',
      flex: 1,
      minWidth: 110,
      renderCell: (p) => <Typography variant="body2" color={p.value > 0 ? 'error.main' : 'success.main'} fontWeight={600}>{formatCurrency(Math.max(p.value, 0))}</Typography>
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 100,
      renderCell: (p) => (
        <Chip
          label={p.value === 'paid' ? 'Paid' : p.value === 'partial' ? 'Partial' : 'Unpaid'}
          size="small"
          sx={{
            bgcolor: p.value === 'paid' ? '#F1F8E9' : p.value === 'partial' ? '#FFF3E0' : '#FFEBEE',
            color: p.value === 'paid' ? '#558B2F' : p.value === 'partial' ? '#E65100' : '#C62828',
            border: '1px solid',
            borderColor: p.value === 'paid' ? '#C5E1A5' : p.value === 'partial' ? '#FFCC80' : '#EF9A9A',
            fontWeight: 600,
            fontSize: 11,
            borderRadius: 10,
          }}
        />
      )
    },
    {
      field: 'progress',
      headerName: 'Progress',
      flex: 1.2,
      minWidth: 130,
      sortable: false,
      renderCell: (p) => {
        const pct = p.row.total_fee > 0 ? Math.min((p.row.total_paid / p.row.total_fee) * 100, 100) : 0
        const color = p.row.status === 'paid' ? '#558B2F' : p.row.status === 'partial' ? '#E65100' : '#C62828'
        const bg = p.row.status === 'paid' ? '#F1F8E9' : p.row.status === 'partial' ? '#FFF3E0' : '#FFEBEE'
        return (
            <Box sx={{ width: '100%', px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: bg, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                {Math.round(pct)}%
              </Typography>
            </Box>
          )
      }
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Students</Typography>
        <Button variant="contained" onClick={() => router.push('/students/add')}>+ Add Student</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} size="small" sx={{ minWidth: 220 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Class</InputLabel>
          <Select value={filterClass} label="Class" onChange={e => setFilterClass(e.target.value)}>
            <MenuItem value="">All Classes</MenuItem>
            {CLASS_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
          </Select>
        </FormControl>
        {(filterClass || filterStatus || search) && (
          <Button variant="outlined" size="small" onClick={() => { setSearch(''); setFilterClass(''); setFilterStatus('') }}>Clear Filters</Button>
        )}
      </Box>
      <DataGrid
        rows={students}
        columns={columns}
        loading={loading}
        autoHeight
        rowHeight={60}
        onRowClick={(p) => {
            console.log('Row clicked:', p.row.id)
            router.push(`/students/${p.row.id}`)
          }}
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          cursor: 'pointer',
          '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f7fa' },
          '& .MuiDataGrid-row:hover': { bgcolor: '#f0f7ff' },
          '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
        }}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
      />
    </Box>
  )
}