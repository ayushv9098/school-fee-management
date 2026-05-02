'use client'

import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, TextField,
  Button, Avatar, List, ListItemButton, ListItemText,
  Divider, CircularProgress, Stack
} from '@mui/material'
import { Logout } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'

// सेक्शन के नाम और आइकन (बिना आइकन के भी चल सकता है)
const sidebarItems = [
  { label: 'My Profile', section: 'profile' },
  { label: 'Security', section: 'security' },
  // आगे और सेक्शन जोड़ सकते हैं जैसे Notifications, Billing etc.
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // प्रोफाइल फॉर्म डेटा (Demo)
  const [firstName, setFirstName] = useState('Admin')
  const [lastName, setLastName] = useState('User')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setEmail(user?.email || '')
      // बाकी फ़ील्ड बाद में डेटाबेस से भर सकते हैं
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleSave = () => {
    // बाद में Supabase में सेव करें
    alert('Profile saved! (Demo)')
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
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* बायीं साइडबार */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2 }}>
              {/* अवतार और नाम (ऊपर दिखाने के लिए) */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1565C0', width: 48, height: 48, fontSize: 20 }}>
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} fontSize={14}>
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

        {/* दायाँ कॉन्टेंट एरिया */}
        <Grid size={{ xs: 12, md: 9 }}>
          {activeSection === 'profile' && (
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
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
                  <Button variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Cancel
                  </Button>
                  <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }} onClick={handleSave}>
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
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

          {/* लॉगआउट बटन नीचे */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="error"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Logout
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}