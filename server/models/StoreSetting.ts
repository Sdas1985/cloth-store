import { Schema, model, models } from 'mongoose';

export interface IStoreSetting {
  id: number;
  store_name: string;
  tagline_en: string;
  tagline_bn: string;
  phone: string;
  email: string;
  address_en: string;
  address_bn: string;
  default_delivery_chattogram: number;
  default_delivery_national: number;
  free_delivery_threshold: number;
  banner_headline_en: string;
  banner_headline_bn: string;
  banner_subheadline_en: string;
  banner_subheadline_bn: string;
  updated_at?: Date;
}

const StoreSettingSchema = new Schema<IStoreSetting>(
  {
    id: { type: Number, required: true, unique: true },
    store_name: { type: String, default: 'Roxy Fashion BD' },
    tagline_en: { type: String, default: 'Contemporary Bangladeshi Elegance' },
    tagline_bn: { type: String, default: 'সমসাময়িক বাংলাদেশি আভিজাত্য' },
    phone: { type: String, default: '+880 1812-345678' },
    email: { type: String, default: 'support@roxyfashion.com' },
    address_en: { type: String, default: 'GEC Circle, Chattogram, Bangladesh' },
    address_bn: { type: String, default: 'জিইসি মোড়, চট্টগ্রাম, বাংলাদেশ' },
    default_delivery_chattogram: { type: Number, default: 80 },
    default_delivery_national: { type: Number, default: 150 },
    free_delivery_threshold: { type: Number, default: 3500 },
    banner_headline_en: { type: String, default: 'Royal Festive & Heritage Collection 2026' },
    banner_headline_bn: { type: String, default: 'উৎসব ও ঐতিহ্যের নতুন সমাহার ২০২৬' },
    banner_subheadline_en: { type: String, default: 'Handcrafted Premium Panjabi & Designer Womenswear' },
    banner_subheadline_bn: { type: String, default: 'হাতে তৈরি প্রিমিয়াম পাঞ্জাবি এবং এক্সক্লুসিভ নারী পোশাকের বিশ্বস্ত ঠিকানা।' },
  },
  { timestamps: { updatedAt: 'updated_at' } }
);

export const StoreSettingModel = models.StoreSetting || model<IStoreSetting>('StoreSetting', StoreSettingSchema);
