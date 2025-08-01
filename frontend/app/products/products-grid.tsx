"use client";

import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

export function ProductsGrid({ products }: { products: Product[] }) {
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
