import { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import { AttachMoney, EventNote, Sports, TrendingUp } from '@mui/icons-material'
import { analyticsAPI } from '../../services/api'

interface DashboardStats {
  todayRevenue: number
  totalRevenue: number
  activeBookings: number
  totalTables: number
  occupiedTables: number
  occupancyRate: number
  monthlyRevenue: { _id: string; revenue: number; count: number }[]
  topTables: { tableName: string; tableType: string; bookingCount: number }[]
  peakHours: { _id: string; count: number }[]
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsAPI.getDashboard()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: "Today's Revenue", value: `₹${stats?.todayRevenue || 0}`, icon: <AttachMoney />, color: '#39FF14' },
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: <TrendingUp />, color: '#D4AF37' },
    { title: 'Active Bookings', value: stats?.activeBookings || 0, icon: <EventNote />, color: '#39FF14' },
    { title: 'Occupancy Rate', value: `${stats?.occupancyRate || 0}%`, icon: <Sports />, color: '#D4AF37' },
  ]

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Overview of your pool & snooker zone
        </Typography>

        <Grid container spacing={3}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Booked Tables
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Table Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Bookings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.topTables?.map((table, index) => (
                        <TableRow key={index}>
                          <TableCell>{table.tableName}</TableCell>
                          <TableCell>
                            <Chip label={table.tableType} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">{table.bookingCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Peak Hours
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell align="right">Bookings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.peakHours?.map((hour, index) => (
                        <TableRow key={index}>
                          <TableCell>{hour._id}:00</TableCell>
                          <TableCell align="right">{hour.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Table Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Tables: {stats?.totalTables || 0} | Occupied: {stats?.occupiedTables || 0} | Available: {(stats?.totalTables || 0) - (stats?.occupiedTables || 0)}
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  )
}

export default AdminDashboard