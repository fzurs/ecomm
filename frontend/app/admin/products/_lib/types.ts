export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  price: string;
  quantity: number;
  last_update: Date;
  image?: string | undefined;
};
