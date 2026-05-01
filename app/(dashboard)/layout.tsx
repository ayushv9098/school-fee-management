'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  List, ListItem, ListItemButton,
  ListItemText, IconButton, useMediaQuery, useTheme,
  Avatar, Divider, Menu, MenuItem, ListItemIcon
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import PaymentIcon from '@mui/icons-material/Payment'
import SchoolIcon from '@mui/icons-material/School'
import InsightsIcon from '@mui/icons-material/Insights'
import Logout from '@mui/icons-material/Logout'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabaseclient'
import Person from '@mui/icons-material/Person'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Students', icon: <PeopleIcon />, path: '/students' },
  { label: 'Payments', icon: <PaymentIcon />, path: '/payments' },
  { label: 'Classes', icon: <SchoolIcon />, path: '/classes' },
  { label: 'AI Insights', icon: <InsightsIcon />, path: '/ai' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const pathname = usePathname()
  const router = useRouter()

  // ✅ प्रोफाइल मेन्यू के लिए स्टेट
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [user, setUser] = useState<any>(null)
  const open = Boolean(anchorEl)

  // ✅ यूज़र डिटेल लाओ
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#1565C0', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'white', lineHeight: 1.2 }}>
            Ayushman Educational Academy
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ px: 1, mt: 1 }}>
        {navItems.map(item => {
          const active = pathname === item.path
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { router.push(item.path); setMobileOpen(false) }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 14, fontWeight: active ? 700 : 400, color: 'white' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F0F4F8' }}>
      {!isMobile && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ width: DRAWER_WIDTH, position: 'fixed', height: '100vh' }}>
            {drawer}
          </Box>
        </Box>
      )}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: '#1565C0' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565C0', flex: 1 }}>
              {navItems.find(n => n.path === pathname)?.label ?? 'School Fee Management'}
            </Typography>

            {/* ✅ प्रोफाइल अवतार – अब क्लिकेबल */}
            {/* ✅ पहले वाला Avatar बदलो इस तरह */}
<IconButton onClick={() => router.push('/profile')} sx={{ p: 0 }}>
  <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: 14 }}>
    {user?.email?.charAt(0).toUpperCase() || 'A'}
  </Avatar>
</IconButton>

            {/* ✅ प्रोफाइल मेन्यू */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {user?.email || 'Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
              <Divider />
              <Menu
              anchorEl={anchorEl}
              open={open}
               onClose={handleMenuClose}
               // ... बाकी props
                   >
                  <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                   {user?.email || 'Admin'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                         Administrator
                  </Typography>
                  </Box>
                  <Divider />

              {/* ✅ नया Profile Menu Item */}
                    </Menu>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
        <Box
          component="footer"
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderTop: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            © 2026 Ayushman Educational Academy, Semli Bari
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}