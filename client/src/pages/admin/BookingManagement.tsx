import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material'
import { motion } from 'framer-motion'
import { Search, CheckCircle, Cancel, Add } from '@mui/icons-material'
import { bookingAPI, tableAPI, analyticsAPI } from '../../services/api'
import { toast } from 'react-toastify'

interface Booking {
  _id: string
  user: { username: string; email: string; phoneNumber: string }
  table: { tableName: string; tableType: string; hourlyRate: number }
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  totalPrice: number
  bookingStatus: string
  paymentStatus: string
}

interface User {
  _id: string
  username: string
  email: string
}

interface Table {
  _id: string
  tableName: string
  tableType: string
  hourlyRate: number
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const today = new Date().toISOString().split('T')[0]
  
  const [newBooking, setNewBooking] = useState({
    userId: '',
    tableId: '',
    bookingDate: today,
    startTime: '',
    duration: 1,
  })

  useEffect(() => {
    fetchBookings()
    fetchUsers()
    fetchTables()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await analyticsAPI.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAllAdmin()
      setTables(response.data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const fetchSlots = async (tableId: string, date: string) => {
    if (!tableId || !date) {
      setAvailableSlots([])
      return
    }
    try {
      const response = await bookingAPI.getAvailableSlots(tableId, date)
      setAvailableSlots(response.data.availableSlots)
    } catch (error) {
      setAvailableSlots([])
    }
  }

const handleCreateBooking = async () => {
    if (!newBooking.userId) {
      toast.error('Please select a user')
      return
    }
    if (!newBooking.tableId) {
      toast.error('Please select a table')
      return
    }
    if (!newBooking.bookingDate) {
      toast.error('Please select a date')
      return
    }
    if (!newBooking.startTime) {
      toast.error('Please select a time slot')
      return
    }
    try {
      console.log('Creating booking:', newBooking)
      const response = await bookingAPI.create({
        userId: newBooking.userId,
        tableId: newBooking.tableId,
        bookingDate: newBooking.bookingDate,
        startTime: newBooking.startTime,
        duration: newBooking.duration,
      })
      console.log('Booking created:', response.data)
      toast.success('Booking created successfully!')
      setCreateDialogOpen(false)
      setNewBooking({ userId: '', tableId: '', bookingDate: today, startTime: '', duration: 1 })
      setAvailableSlots([])
      fetchBookings()
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error?.response?.data?.message || 'Failed to create booking')
    }
  }

  const fetchBookings = async () => {
    try {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter
      const response = await bookingAPI.getAll(params)
      setBookings(response.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, dateFilter])

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await bookingAPI.updateStatus(bookingId, { bookingStatus: status })
      toast.success('Booking status updated')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to update status')
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

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View and manage all bookings
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="date"
              label="Filter by Date"
              InputLabelProps={{ shrink: true }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('')
                setDateFilter('')
              }}
            >
              Clear Filters
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Booking
            </Button>
          </CardContent>
        </Card>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <Typography variant="body2">{booking.user?.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.user?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.table?.tableName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.table?.tableType}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {booking.startTime} - {booking.endTime}
                  </TableCell>
                  <TableCell>{booking.duration}h</TableCell>
                  <TableCell>₹{booking.totalPrice}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.bookingStatus}
                      color={getStatusColor(booking.bookingStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.paymentStatus}
                      color={getPaymentColor(booking.paymentStatus) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {booking.bookingStatus === 'pending' && (
                      <>
                        <IconButton
                          color="success"
                          onClick={() => handleStatusChange(booking._id, 'confirmed')}
                          title="Confirm"
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleStatusChange(booking._id, 'cancelled')}
                          title="Cancel"
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                    {booking.bookingStatus === 'confirmed' && (
                      <IconButton
                        color="info"
                        onClick={() => handleStatusChange(booking._id, 'completed')}
                        title="Mark Completed"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {bookings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No bookings found</Typography>
          </Box>
        )}

        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Booking (Admin)</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={newBooking.userId}
                    onChange={(e) => setNewBooking({ ...newBooking, userId: e.target.value })}
                    label="Select User"
                  >
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Table</InputLabel>
                  <Select
                    value={newBooking.tableId}
                    onChange={(e) => {
                      setNewBooking({ ...newBooking, tableId: e.target.value })
                      fetchSlots(e.target.value, newBooking.bookingDate)
                    }}
                    label="Select Table"
                  >
                    {tables.filter(t => t.isActive !== false).map((table) => (
                      <MenuItem key={table._id} value={table._id}>
                        {table.tableName} - {table.tableType} (₹{table.hourlyRate}/hr)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Booking Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  value={newBooking.bookingDate}
                  onChange={(e) => {
                    setNewBooking({ ...newBooking, bookingDate: e.target.value })
                    fetchSlots(newBooking.tableId, e.target.value)
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration (hours)</InputLabel>
                  <Select
                    value={newBooking.duration}
                    onChange={(e) => setNewBooking({ ...newBooking, duration: Number(e.target.value) })}
                    label="Duration (hours)"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <MenuItem key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Time Slot</InputLabel>
                  <Select
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    label="Select Time Slot"
                  >
                    {availableSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {availableSlots.length === 0 && newBooking.tableId && newBooking.bookingDate && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    No available slots for this table on selected date
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateBooking}>
              Create Booking
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  )
}

export default BookingManagement