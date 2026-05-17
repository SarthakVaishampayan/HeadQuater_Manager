import { Router } from 'express';
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getAllTablesAdmin,
} from '../controllers/tableController';
import { auth, admin } from '../middleware';
import { validate } from '../middleware/validate';
import { tableSchema, updateTableSchema } from '../schemas';

const router = Router();

router.get('/', getTables);
router.get('/admin', auth, admin, getAllTablesAdmin);
router.get('/:id', getTableById);
router.post('/', auth, admin, validate(tableSchema), createTable);
router.put('/:id', auth, admin, validate(updateTableSchema), updateTable);
router.delete('/:id', auth, admin, deleteTable);

export default router;