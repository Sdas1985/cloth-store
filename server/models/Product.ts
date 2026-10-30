import { Schema, model, models } from 'mongoose';

export interface IProductVariant {
  id: number;
  product_id?: number;
  size_name?: string;
  color_name_en?: string;
  color_name_bn?: string;
  color_hex?: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  is_enabled: boolean;
}

export interface IProduct {
  id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  product_type: 'simple' | 'variable';
  short_description?: string;
  full_description?: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  main_image: string;
  gallery_images: string[];
  category_id?: number;
  category_slug?: string;
  category_name_en?: string;
  category_name_bn?: string;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  weight?: string;
  specifications?: Record<string, string>;
  variants?: IProductVariant[];
  created_at?: Date;
  updated_at?: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: Number, required: true },
  product_id: { type: Number },
  size_name: { type: String },
  color_name_en: { type: String },
  color_name_bn: { type: String },
  color_hex: { type: String },
  sku: { type: String, required: true },
  regular_price: { type: Number, required: true },
  sale_price: { type: Number },
  stock_quantity: { type: Number, default: 0 },
  image_url: { type: String },
  is_enabled: { type: Boolean, default: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number, required: true, unique: true },
    name_en: { type: String, required: true },
    name_bn: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    product_type: { type: String, enum: ['simple', 'variable'], default: 'simple' },
    short_description: { type: String },
    full_description: { type: String },
    sku: { type: String, required: true, unique: true },
    regular_price: { type: Number, required: true },
    sale_price: { type: Number },
    main_image: { type: String, required: true },
    gallery_images: [{ type: String }],
    category_id: { type: Number },
    category_slug: { type: String, index: true },
    category_name_en: { type: String },
    category_name_bn: { type: String },
    stock_quantity: { type: Number, default: 0 },
    stock_status: { type: String, enum: ['in_stock', 'out_of_stock', 'on_backorder'], default: 'in_stock' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published', index: true },
    is_featured: { type: Boolean, default: false, index: true },
    is_bestseller: { type: Boolean, default: false, index: true },
    is_new_arrival: { type: Boolean, default: false, index: true },
    weight: { type: String },
    specifications: { type: Map, of: String },
    variants: [ProductVariantSchema],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const ProductModel = models.Product || model<IProduct>('Product', ProductSchema);
