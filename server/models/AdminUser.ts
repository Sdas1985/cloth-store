import { Schema, model, models } from 'mongoose';

export interface IAdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'super_admin' | 'manager' | 'support';
  is_active: boolean;
  last_login_at?: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'manager', 'support'], default: 'super_admin' },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },
  },
  { timestamps: true }
);

export const AdminUserModel = models.AdminUser || model<IAdminUser>('AdminUser', AdminUserSchema);
