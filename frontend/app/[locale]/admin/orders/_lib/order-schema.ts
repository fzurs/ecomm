import { z } from "zod";

// Schema para un item individual de la orden
const OrderItemSchema = z.object({
  product_id: z.string().min(1, "Product ID es requerido"),
  quantity: z
    .number()
    .int()
    .positive("La cantidad debe ser un número positivo"),
  unit_price: z
    .number()
    .positive("El precio unitario debe ser positivo")
    .optional(),
  subtotal: z.number().positive("El subtotal debe ser positivo").optional(),
});

// Schema para dirección (solo ID como referencia)
const ShippingAddressSchema = z.object({
  address_id: z.string().min(1, "Address ID es requerido"),
});

// Schema para método de pago (solo ID como referencia)
const PaymentMethodSchema = z.object({
  payment_id: z.string().min(1, "Payment ID es requerido"),
});

// Schema principal para una orden
const OrderSchema = z.object({
  order_id: z.string().min(1, "Order ID es requerido"),
  user_id: z.string().min(1, "User ID es requerido"),
  status: z
    .enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .default("pending"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  total_amount: z.number().positive("El monto total debe ser positivo"),
  currency: z
    .string()
    .length(3, "La moneda debe tener 3 caracteres")
    .default("USD"),
  items: z
    .array(OrderItemSchema)
    .min(1, "La orden debe tener al menos un item"),
  shipping_address: ShippingAddressSchema.optional(),
  payment_method: PaymentMethodSchema.optional(),
});

const OrdersArraySchema = z.object({
  orders: z.array(OrderSchema),
});

// Tipos TypeScript generados automáticamente
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrdersArray = z.infer<typeof OrdersArraySchema>;

export { OrderItemSchema, OrderSchema, OrdersArraySchema };
