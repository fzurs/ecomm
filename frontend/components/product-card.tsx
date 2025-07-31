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
import { Eye, TrashIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "@/lib/client";

export function ProductCard({
  product,
}: {
  product: Product & { isTest?: true };
}) {
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
      {product.isTest && (
        <CardFooter>
          <DestroyProductLocalStorageButton product={product} />
        </CardFooter>
      )}
    </Card>
  );
}

function DestroyProductLocalStorageButton({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("testNewProduct");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [productsApi.productsList.name],
      });

      queryClient.setQueryData(
        [productsApi.productsList.name],
        (old: Product[] | undefined) =>
          old ? old.filter((item) => item.id !== product.id) : null
      );
    },

    onError: (err) => {
      toast.error("Algo salio mal.", { description: err.message });
    },
    onSuccess: () => {
      toast("Se removio el producto que agregaste.");
    },
  });

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
    >
      <TrashIcon />
      Delete this product
    </Button>
  );
}
