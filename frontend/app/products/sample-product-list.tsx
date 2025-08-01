"use client";

import { Product } from "@/lib/api";
import { productsApi } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import data from "./data.json";
import { ProductsGrid } from "./products-grid";

export function SampleProductsList() {
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
