import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Container, Typography, Grid, Card, CardContent, TextField, Button, MenuItem, Alert, Chip, FormControl, InputLabel, Select } from '@mui/material'
import { motion } from 'framer-motion'
import { Sports, AccessTime } from '@mui/icons-material'
import { tableAPI, bookingAPI } from '../services/api'
import { toast } from 'react-toastify'

const bookingSchema = z.object({
  tableId: z.string().min(1, 'Please select a table'),
  bookingDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a time'),
  duration: z.number().min(1).max(8),
})

type BookingForm = z.infer<typeof bookingSchema>

interface Table {
  _id: string
  tableName: string
  tableType: string
  hourlyRate: number
  status: string
}

interface AvailableSlots {
  table: Table
  availableSlots: string[]
  bookedSlots: { start: string; end: string }[]
}

const BookTable: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingDate: new Date().toISOString().split('T')[0],
      duration: 1
    }
  })

  const selectedTableId = watch('tableId')
  const selectedDate = watch('bookingDate')

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await tableAPI.getAll()
        setTables(response.data.filter((t: Table) => t.isActive !== false))
      } catch (error) {
        console.error('Error fetching tables:', error)
      }
    }
    fetchTables()
  }, [])

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTableId || !selectedDate) {
        setAvailableSlots([])
        return
      }
      try {
        const dateStr = selectedDate instanceof Date 
          ? selectedDate.toISOString().split('T')[0] 
          : selectedDate
        
        const response = await bookingAPI.getAvailableSlots(selectedTableId, dateStr)
        setAvailableSlots(response.data.availableSlots)
      } catch (error) {
        console.error('Error fetching slots:', error)
        setAvailableSlots([])
      }
    }
    fetchSlots()
  }, [selectedTableId, selectedDate])

  const onSubmit = async (data: BookingForm) => {
    console.log('Booking data:', data)
    try {
      setError('')
      setSuccess('')
      setLoading(true)
      const response = await bookingAPI.create(data)
      console.log('Booking response:', response)
      setSuccess('Booking created successfully!')
      toast.success('Booking confirmed!')
      setValue('startTime', '' as any)
    } catch (err: any) {
      console.error('Booking error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Booking failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedTable = tables.find((t) => t._id === selectedTableId)

  const getTableTypeColor = (type: string) => {
    switch (type) {
      case 'pool':
        return 'primary'
      case 'snooker':
        return 'secondary'
      case 'vip':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          Book a Table
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select your preferred table and time slot
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Booking Details
                  </Typography>

                  <FormControl fullWidth margin="normal" error={!!errors.tableId}>
                    <InputLabel>Select Table</InputLabel>
                    <Select {...register('tableId')} defaultValue="">
                      {tables.map((table) => (
                        <MenuItem key={table._id} value={table._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {table.tableName} - {table.tableType.toUpperCase()} (₹{table.hourlyRate}/hr)
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    {...register('bookingDate')}
                    label="Booking Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    error={!!errors.bookingDate}
                    helperText={errors.bookingDate?.message}
                  />

                  <FormControl fullWidth margin="normal" error={!!errors.startTime}>
                    <InputLabel>Select Time Slot</InputLabel>
                    <Select {...register('startTime')} defaultValue="">
                      {availableSlots.map((slot) => (
                        <MenuItem key={slot} value={slot}>
                          {slot}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" error={!!errors.duration}>
                    <InputLabel>Duration (hours)</InputLabel>
                    <Select
                      {...register('duration', { valueAsNumber: true })}
                      defaultValue={1}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                        <MenuItem key={hour} value={hour}>
                          {hour} hour{hour > 1 ? 's' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Tables
            </Typography>
            {tables.map((table) => {
              const isTableMaintenance = table.status === 'maintenance'
              
              return (
                <motion.div key={table._id} whileHover={!isTableMaintenance ? { scale: 1.02 } : {}} transition={{ duration: 0.2 }}>
                  <Card
                    sx={{
                      mb: 2,
                      cursor: isTableMaintenance ? 'not-allowed' : 'pointer',
                      border: selectedTableId === table._id ? '2px solid #39FF14' : '1px solid rgba(57,255,20,0.1)',
                      opacity: isTableMaintenance ? 0.6 : 1,
                    }}
                    onClick={() => {
                      if (!isTableMaintenance) {
                        setValue('tableId', table._id)
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Sports color={isTableMaintenance ? 'disabled' : 'primary'} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {table.tableName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip label={table.tableType} size="small" color={getTableTypeColor(table.tableType) as any} />
                              {isTableMaintenance && (
                                <Chip label="Maintenance" size="small" color="error" />
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="h6" color="primary.main">
                          ₹{table.hourlyRate}/hr
                        </Typography>
                      </Box>
                      {selectedTableId === table._id && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(57,255,20,0.1)' }}>
                          <Typography variant="body2" color="primary.main">
                            Selected - Choose a time slot below
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
            {selectedTableId && availableSlots.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No time slots available for this table on the selected date. Please try another date or table.
              </Alert>
            )}
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  )
}

export default BookTable