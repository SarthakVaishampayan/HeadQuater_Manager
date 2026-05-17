import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material'
import { Menu as MenuIcon, Pool as PoolIcon } from '@mui/icons-material'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Layout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Book Table', path: '/book' },
    ...(isAuthenticated ? [{ label: 'My Bookings', path: '/my-bookings' }] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [{ label: 'Admin Panel', path: '/admin' }] : []),
  ]

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(57,255,20,0.1)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PoolIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #39FF14, #D4AF37)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Pool Zone
              </Typography>
            </Box>

            {isMobile ? (
              <>
                <IconButton color="primary" onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                  <Box sx={{ width: 250, pt: 2 }}>
                    <List>
                      {navItems.map((item) => (
                        <ListItem key={item.path} component={Link} to={item.path} onClick={() => setDrawerOpen(false)}>
                          <ListItemText primary={item.label} />
                        </ListItem>
                      ))}
                      {!isAuthenticated ? (
                        <>
                          <ListItem component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                            <ListItemText primary="Login" />
                          </ListItem>
                          <ListItem component={Link} to="/register" onClick={() => setDrawerOpen(false)}>
                            <ListItemText primary="Register" />
                          </ListItem>
                        </>
                      ) : (
                        <ListItem button onClick={handleLogout}>
                          <ListItemText primary="Logout" />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {navItems.map((item) => (
                  <Button key={item.path} component={Link} to={item.path} sx={{ color: 'text.primary' }}>
                    {item.label}
                  </Button>
                ))}
                {!isAuthenticated ? (
                  <>
                    <Button component={Link} to="/login" variant="outlined" color="primary">
                      Login
                    </Button>
                    <Button component={Link} to="/register" variant="contained" color="primary">
                      Register
                    </Button>
                  </>
                ) : (
                  <Button variant="outlined" color="error" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: '1px solid rgba(57,255,20,0.1)',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2024 Pool & Snooker Zone. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout