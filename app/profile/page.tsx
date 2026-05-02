'use client'

import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, TextField,
  Button, Avatar, List, ListItemButton, ListItemText,
  Divider, CircularProgress, Stack,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material'
import { Logout, ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'

const sidebarItems = [
  { label: 'My Profile', section: 'profile' },
  { label: 'Security', section: 'security' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // Profile form data
  const [firstName, setFirstName] = useState('Admin')
  const [lastName, setLastName] = useState('User')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  // Keep original values for cancel/reset
  const [originalFirstName, setOriginalFirstName] = useState('Admin')
  const [originalLastName, setOriginalLastName] = useState('User')
  const [originalPhone, setOriginalPhone] = useState('')
  const [originalBio, setOriginalBio] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const userEmail = user?.email || ''
      setEmail(userEmail)
      // In a real app, fetch profile from a 'profiles' table
      // For demo, we set default values
      setOriginalFirstName('Admin')
      setOriginalLastName('User')
      setOriginalPhone('')
      setOriginalBio('')
      setFirstName('Admin')
      setLastName('User')
      setPhone('')
      setBio('')
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const handleLogoutConfirm = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSave = () => {
    // Save current values as new "original" state
    setOriginalFirstName(firstName)
    setOriginalLastName(lastName)
    setOriginalPhone(phone)
    setOriginalBio(bio)
    alert('Profile saved! (Demo)')
  }

  const handleCancel = () => {
    // Reset to last saved values
    setFirstName(originalFirstName)
    setLastName(originalLastName)
    setPhone(originalPhone)
    setBio(originalBio)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1565C0', width: 48, height: 48, fontSize: 20 }}>
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {user?.email || 'Admin'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Administrator
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 1 }} />

              <List component="nav" disablePadding>
                {sidebarItems.map((item) => (
                  <ListItemButton
                    key={item.section}
                    selected={activeSection === item.section}
                    onClick={() => setActiveSection(item.section)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: '#E3F2FD',
                        '&:hover': { bgcolor: '#BBDEFB' }
                      }
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: activeSection === item.section ? 700 : 400,
                        color: activeSection === item.section ? '#1565C0' : 'inherit'
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Content area */}
        <Grid size={{ xs: 12, md: 9 }}>
          {activeSection === 'profile' && (
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Personal Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="First Name" size="small"
                      value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="Last Name" size="small"
                      value={lastName} onChange={(e) => setLastName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth label="Email address" size="small"
                      value={email} disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="Phone" size="small"
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="Bio" size="small"
                      value={bio} onChange={(e) => setBio(e.target.value)}
                      placeholder="Team Manager"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Change Password
                </Typography>

                <Stack spacing={2}>
                  <TextField label="Current Password" type="password" size="small" fullWidth />
                  <TextField label="New Password" type="password" size="small" fullWidth />
                  <TextField label="Confirm New Password" type="password" size="small" fullWidth />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Cancel
                    </Button>
                    <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Update Password
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Buttons: Back to Dashboard (left) and Logout (right) */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.push('/dashboard')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="text"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogoutClick}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Logout
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? You will need to log in again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}