'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Button,
  Typography, Alert, CircularProgress, InputAdornment,
  IconButton, OutlinedInput, FormControl, InputLabel
} from '@mui/material'
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material'
import { supabase } from '@/app/lib/supabaseclient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F9FAFB',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Ayushman Educational Academy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="email-input">Email</InputLabel>
              <OutlinedInput
                id="email-input"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                }
              />
            </FormControl>

            {/* Password Field */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel htmlFor="password-input">Password</InputLabel>
              <OutlinedInput
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                startAdornment={
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none', py: 1.2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            © 2026 Ayushman Educational Academy
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}