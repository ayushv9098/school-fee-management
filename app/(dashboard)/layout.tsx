'use client'
import { useState } from 'react'
import Image from 'next/image'
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  List, ListItem, ListItemButton,
  ListItemText, IconButton, useMediaQuery, useTheme,
  Avatar, Divider
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import PaymentIcon from '@mui/icons-material/Payment'
import SchoolIcon from '@mui/icons-material/School'
import { usePathname, useRouter } from 'next/navigation'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Students', icon: <PeopleIcon />, path: '/students' },
  { label: 'Payments', icon: <PaymentIcon />, path: '/payments' },
  { label: 'Classes', icon: <SchoolIcon />, path: '/classes' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const pathname = usePathname()
  const router = useRouter()

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#1565C0', color: 'white' }}>
      {/* Logo */}
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
      {/* Sidebar */}
      {!isMobile && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ width: DRAWER_WIDTH, position: 'fixed', height: '100vh' }}>
            {drawer}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar */}
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
            <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: 14 }}>A</Avatar>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}