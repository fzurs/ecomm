"use client";

import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { Product } from "@/lib/api";
import { productsApi } from "@/lib/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import data from "./data.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 flex gap-4 lg:gap-6 w-full justify-between">
              <Input placeholder="Search products..." className="max-w-sm" />
              <Button size="lg" asChild>
                <Link href="/products/add">
                  <PlusIcon />
                  Add Product
                </Link>
              </Button>
            </div>
            <ProductsList />
          </div>
        </div>
      </div>
    </>
  );
}

function ProductsList() {
  //   const { data } = useSuspenseQuery({
  //     queryKey: [productsApi.productsList.name],
  //     queryFn: () => productsApi.productsList().then((res) => res.data),
  //   });
  const [newProductExists, setNewProductExists] = useState<boolean>(true);
  const [newProduct, setNewProduct] = useState<Product>();

  useEffect(() => {
    const newProductData = localStorage.getItem("testNewProduct");
    if (newProductData) {
      setNewProduct(JSON.parse(newProductData) as Product);
    } else {
      setNewProductExists(false);
    }
  }, [setNewProduct, setNewProductExists]);

  const {
    data: products,
    isPending,
    error,
  } = useQuery({
    queryKey: [productsApi.productsList.name],
    queryFn: () => {
      let products = data as Product[];

      if (newProduct) {
        products = [newProduct, ...data];
      }

      return products;
    },
    enabled: !newProductExists || !!newProduct,
  });

  if (isPending || error) return null;

  return <ProductsGrid products={products} />;
}

function ProductsGrid({ products }: { products: Product[] }) {
  const [columns, setColumns] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width < 640) setColumns(1);
        else if (width < 1024) setColumns(2);
        else setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Distribuir cards en columnas para efecto masonry
  const distributeCards = () => {
    const columnArrays = Array.from(
      { length: columns },
      () => [] as typeof products
    );
    const columnHeights = Array(columns).fill(0);

    products.forEach((card) => {
      // Encontrar la columna con menor altura
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );
      columnArrays[shortestColumnIndex].push(card);
      // Estimar altura de la card (esto sería más preciso midiendo el DOM real)
      columnHeights[shortestColumnIndex] +=
        300 + 40 + card.description.length * 0.3 + 24;
    });

    return columnArrays;
  };

  const cardColumns = distributeCards();

  return (
    <div
      ref={containerRef}
      className="grid gap-4 lg:gap-6 px-4 lg:px-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {cardColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4 lg:gap-6">
          {column.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
}
