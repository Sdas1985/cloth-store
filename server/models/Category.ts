import { Schema, model, models } from 'mongoose';

export interface ICategory {
  id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: Number, required: true, unique: true },
    name_en: { type: String, required: true },
    name_bn: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image_url: { type: String },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const CategoryModel = models.Category || model<ICategory>('Category', CategorySchema);
