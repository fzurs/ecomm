import Image from "next/image";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Product } from "@/lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price?: string) => {
    if (!price) return "Precio no disponible";

    // Si el precio ya incluye símbolo de moneda, lo devolvemos tal como está
    if (price.includes("$") || price.includes("€") || price.includes("£")) {
      return price;
    }

    // Si es solo un número, agregamos el símbolo de dólar
    return `$${price}`;
  };

  const truncateDescription = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        {product.img && (
          <Image
            src={product.img}
            alt={`${product.title} Image`}
            height={512}
            width={512}
            className="w-full"
          />
        )}
        <CardTitle>{product.title}</CardTitle>
        <CardDescription>
          {truncateDescription(product.description)}
        </CardDescription>
        <CardAction>
          {product.category && (
            <Badge variant="outline">{product.category}</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-1.5">
          <p className="font-bold text-lg">{formatPrice(product.price)}</p>
          <Badge>{product.is_active ? "Con stock" : "Sin stock"}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
