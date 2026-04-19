'use client'
import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, TextField,
  Button, MenuItem, Select, FormControl,
  InputLabel, Snackbar, Alert, Grid
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'
import { CLASS_LIST, ACADEMIC_YEARS } from '@/app/lib/constants'

export default function AddStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    class: '',
    mobile: '',
    guardian_name: '',
    address: '',
    total_fee: '',
    academic_year: '2024-25'
  })

  const handleSubmit = async () => {
    if (!form.name || !form.class || !form.total_fee) {
      setError('Name, Class aur Total Fee required hai!')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('students').insert({
      name: form.name,
      class: form.class,
      mobile: form.mobile,
      guardian_name: form.guardian_name,
      address: form.address,
      total_fee: Number(form.total_fee),
      academic_year: form.academic_year
    })

    if (err) {
      setError('Error: ' + err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/students'), 1500)
  }

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Button onClick={() => router.back()} sx={{ mb: 2 }}>← Back</Button>
      <Box
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: '1px dashed #cfd8dc',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Ayushman Educational Academy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kundiya Dhaga Road, Sharhdi, Semli Bari
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Add New Student
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Student Name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select
                  value={form.class} label="Class *"
                  onChange={e => setForm({ ...form, class: e.target.value })}>
                  {CLASS_LIST.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Mobile Number"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Guardian Name"
                value={form.guardian_name}
                onChange={e => setForm({ ...form, guardian_name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth label="Address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Total Fee (₹) *"
                type="number"
                value={form.total_fee}
                onChange={e => setForm({ ...form, total_fee: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={form.academic_year} label="Academic Year"
                  onChange={e => setForm({ ...form, academic_year: e.target.value })}>
                  {ACADEMIC_YEARS.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {error && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  variant="contained" fullWidth
                  onClick={handleSubmit}
                  disabled={loading}>
                  {loading ? 'Saving...' : 'Add Student'}
                </Button>
                <Button
                  variant="outlined" fullWidth
                  onClick={() => router.back()}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={success} autoHideDuration={2000}>
        <Alert severity="success">Student added successfully! ✅</Alert>
      </Snackbar>
    </Box>
  )
}