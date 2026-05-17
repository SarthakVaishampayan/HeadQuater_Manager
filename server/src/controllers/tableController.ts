import { Response } from 'express';
import { Table, ITable } from '../models';
import { AuthRequest } from '../middleware';

export const getTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tables = await Table.find().sort({ createdAt: -1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTableById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tableName, tableType, hourlyRate, status } = req.body;
    const existing = await Table.findOne({ tableName });
    if (existing) {
      res.status(400).json({ message: 'Table with this name already exists' });
      return;
    }
    const table = new Table({ tableName, tableType, hourlyRate, status: status || 'available' });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log('Delete table request:', { 
    tableId: req.params.id, 
    userId: (req as any).userId, 
    userRole: (req as any).user?.role 
  });
  
  try {
    // Actually delete the table from database
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllTablesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Show all tables including deleted ones, but mark isActive status
    const tables = await Table.find().sort({ createdAt: -1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};