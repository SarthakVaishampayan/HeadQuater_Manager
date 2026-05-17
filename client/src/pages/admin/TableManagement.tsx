import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import { motion } from 'framer-motion'
import { Add, Edit, Delete } from '@mui/icons-material'
import { tableAPI } from '../../services/api'
import { toast } from 'react-toastify'

const tableSchema = z.object({
  tableName: z.string().min(1, 'Table name is required'),
  tableType: z.enum(['pool', 'snooker', 'vip']),
  hourlyRate: z.number().positive('Hourly rate must be positive'),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
})

type TableForm = z.infer<typeof tableSchema>

interface Table {
  _id: string
  tableName: string
  tableType: 'pool' | 'snooker' | 'vip'
  hourlyRate: number
  status: 'available' | 'occupied' | 'maintenance'
  isActive: boolean
}

const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await tableAPI.getAllAdmin()
      setTables(response.data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TableForm) => {
    try {
      if (editingTable) {
        await tableAPI.update(editingTable._id, data)
        toast.success('Table updated successfully')
      } else {
        await tableAPI.create(data)
        toast.success('Table created successfully')
      }
      setDialogOpen(false)
      reset()
      setEditingTable(null)
      fetchTables()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save table')
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    reset({
      tableName: table.tableName,
      tableType: table.tableType,
      hourlyRate: table.hourlyRate,
      status: table.status,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return
    try {
      await tableAPI.delete(id)
      toast.success('Table deleted successfully')
      // Remove from local state immediately
      setTables(tables.filter(t => t._id !== id))
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error?.response?.data?.message || 'Failed to delete table')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'occupied':
        return 'warning'
      case 'maintenance':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type: string) => {
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
    <Box>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4">Table Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your pool and snooker tables
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTable(null)
              reset()
              setDialogOpen(true)
            }}
          >
            Add Table
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Table Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Hourly Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table._id}>
                  <TableCell>{table.tableName}</TableCell>
                  <TableCell>
                    <Chip label={table.tableType} color={getTypeColor(table.tableType) as any} size="small" />
                  </TableCell>
                  <TableCell>₹{table.hourlyRate}</TableCell>
                  <TableCell>
                    <Chip label={table.status} color={getStatusColor(table.status) as any} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(table)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(table._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                {...register('tableName')}
                label="Table Name"
                fullWidth
                margin="normal"
                error={!!errors.tableName}
                helperText={errors.tableName?.message}
              />
              <FormControl fullWidth margin="normal" error={!!errors.tableType}>
                <InputLabel>Table Type</InputLabel>
                <Select {...register('tableType')} defaultValue="">
                  <MenuItem value="pool">Pool</MenuItem>
                  <MenuItem value="snooker">Snooker</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                </Select>
              </FormControl>
              <TextField
                {...register('hourlyRate', { valueAsNumber: true })}
                label="Hourly Rate (₹)"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.hourlyRate}
                helperText={errors.hourlyRate?.message}
              />
              {editingTable && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select {...register('status')} defaultValue={editingTable.status}>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingTable ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </motion.div>
    </Box>
  )
}

export default TableManagement