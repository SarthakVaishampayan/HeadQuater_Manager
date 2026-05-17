import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { motion } from 'framer-motion'
import { Delete, Event } from '@mui/icons-material'
import { bookingAPI } from '../services/api'
import { toast } from 'react-toastify'

interface Booking {
  _id: string
  table: { tableName: string; tableType: string; hourlyRate: number }
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  totalPrice: number
  bookingStatus: string
  paymentStatus: string
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getMyBookings()
        setBookings(response.data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const handleCancelClick = (bookingId: string) => {
    setSelectedBooking(bookingId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return
    try {
      await bookingAPI.cancel(selectedBooking)
      setBookings(bookings.filter((b) => b._id !== selectedBooking))
      toast.success('Booking cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelDialogOpen(false)
      setSelectedBooking(null)
    }
  }

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

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'refunded':
        return 'info'
      default:
        return 'default'
    }
  }

  const activeBookings = bookings.filter((b) => b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed')
  const pastBookings = bookings.filter((b) => b.bookingStatus === 'cancelled' || b.bookingStatus === 'completed')

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          My Bookings
        </Typography>

        {activeBookings.length === 0 && pastBookings.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No bookings found. Book a table to get started!
          </Alert>
        ) : (
          <>
            {activeBookings.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                  Active Bookings
                </Typography>
                <Grid container spacing={3}>
                  {activeBookings.map((booking) => (
                    <Grid item xs={12} md={6} key={booking._id}>
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6">{booking.table.tableName}</Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={booking.bookingStatus} color={getStatusColor(booking.bookingStatus) as any} size="small" />
                                <Chip label={booking.paymentStatus} color={getPaymentColor(booking.paymentStatus) as any} size="small" variant="outlined" />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Event fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {new Date(booking.bookingDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {booking.duration} hour(s)
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Typography variant="h6" color="primary.main">
                                ₹{booking.totalPrice}
                              </Typography>
                              <IconButton color="error" onClick={() => handleCancelClick(booking._id)}>
                                <Delete />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {pastBookings.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                  Past Bookings
                </Typography>
                <Grid container spacing={3}>
                  {pastBookings.map((booking) => (
                    <Grid item xs={12} md={6} key={booking._id}>
                      <Card sx={{ opacity: 0.7 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">{booking.table.tableName}</Typography>
                            <Chip label={booking.bookingStatus} color={getStatusColor(booking.bookingStatus) as any} size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(booking.bookingDate).toLocaleDateString()} | {booking.startTime} - {booking.endTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {booking.duration} hour(s)
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ mt: 2 }}>
                            ₹{booking.totalPrice}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to cancel this booking?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
            <Button onClick={handleCancelConfirm} color="error" variant="contained">
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  )
}

export default MyBookings