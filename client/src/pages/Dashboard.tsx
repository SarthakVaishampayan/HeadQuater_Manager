import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip } from '@mui/material'
import { Sports, CalendarMonth, AttachMoney } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { bookingAPI } from '../services/api'

interface Booking {
  _id: string
  table: { tableName: string; tableType: string; hourlyRate: number }
  bookingDate: string
  startTime: string
  endTime: string
  totalPrice: number
  bookingStatus: string
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings()
        setRecentBookings(response.data.slice(0, 5))
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your bookings and explore our tables
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Sports sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Book a Table
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Find and book your preferred table
                </Typography>
                <Button component={Link} to="/book" variant="contained">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CalendarMonth sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  My Bookings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View your booking history
                </Typography>
                <Button component={Link} to="/my-bookings" variant="outlined">
                  View All
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AttachMoney sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Total Bookings
                </Typography>
                <Typography variant="h3" color="primary.main">
                  {recentBookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  bookings made
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
          Recent Bookings
        </Typography>

        <Grid container spacing={2}>
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking._id}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{booking.table.tableName}</Typography>
                        <Chip label={booking.bookingStatus} color={getStatusColor(booking.bookingStatus) as any} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.startTime} - {booking.endTime}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2, fontWeight: 600 }}>
                        ₹{booking.totalPrice}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No bookings yet. Start by booking a table!
                </Typography>
                <Button component={Link} to="/book" variant="contained" sx={{ mt: 2 }}>
                  Book Your First Table
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  )
}

export default Dashboard