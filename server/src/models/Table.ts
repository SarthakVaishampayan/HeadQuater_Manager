import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  tableName: string;
  tableType: 'pool' | 'snooker' | 'vip';
  hourlyRate: number;
  status: 'available' | 'occupied' | 'maintenance';
  isActive: boolean;
}

const TableSchema = new Schema<ITable>(
  {
    tableName: { type: String, required: true, unique: true },
    tableType: { type: String, enum: ['pool', 'snooker', 'vip'], required: true },
    hourlyRate: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Table = mongoose.model<ITable>('Table', TableSchema);