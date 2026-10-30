import { Schema, model, models } from 'mongoose';

export interface IOrderItem {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantDetails?: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface IOrder {
  public_reference: string;
  customer_name: string;
  customer_phone: string;
  district_id: number;
  district_name: string;
  delivery_address: string;
  order_note?: string;
  items: IOrderItem[];
  subtotal: number;
  delivery_charge: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'partially_paid';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_history?: Array<{
    status: string;
    note: string;
    timestamp: Date;
  }>;
  created_at?: Date;
  updated_at?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Number, required: true },
  variantId: { type: Number, default: null },
  productName: { type: String, required: true },
  variantDetails: { type: String, default: '' },
  sku: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  imageUrl: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    public_reference: { type: String, required: true, unique: true, index: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true, index: true },
    district_id: { type: Number, required: true },
    district_name: { type: String, required: true },
    delivery_address: { type: String, required: true },
    order_note: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    delivery_charge: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_method: { type: String, default: 'cash_on_delivery' },
    payment_status: { type: String, enum: ['unpaid', 'paid', 'partially_paid'], default: 'unpaid' },
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    tracking_history: [
      {
        status: { type: String, required: true },
        note: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export const OrderModel = models.Order || model<IOrder>('Order', OrderSchema);
