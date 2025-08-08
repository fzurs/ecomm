"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "../_lib/types";
import { ProductCategorySelect } from "./product-category-select";

export function ProductForm({ item }: { item: Product }) {
  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="title">Título</Label>
        <Input id="title" defaultValue={item.title} />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" defaultValue={item.description} />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="category">Categoría</Label>
        <ProductCategorySelect />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="price">Precio (pesos)</Label>
          <Input type="string" id="price" defaultValue={item.price} />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input type="string" id="quantity" defaultValue={item.quantity} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="status">Status</Label>
        <Select defaultValue={item.status}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Selecciona el estado del producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="En stock">En stock</SelectItem>
            <SelectItem value="Poco stock">Poco stock</SelectItem>
            <SelectItem value="Agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
