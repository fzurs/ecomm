"use client";

import { parseAsString, useQueryState } from "nuqs";

import * as React from "react";

import { Product } from "@workspace/api-client";

import {
  InfiniteSelector,
  InfiniteSelectorContent,
  InfiniteSelectorEmpty,
  InfiniteSelectorGroup,
  InfiniteSelectorInput,
  InfiniteSelectorItem,
  InfiniteSelectorList,
  InfiniteSelectorTrigger,
  InfiniteSelectorValue,
} from "@/components/infinite-selector";

import {
  getProductQueryOptions,
  getProductsInfiniteQueryOptions,
} from "./product-selector";

export function ProductSelector() {
  const [value, setValue] = useQueryState(
    "prod",
    parseAsString.withDefault(""),
  );

  return (
    <InfiniteSelector
      value={value}
      onValueChange={setValue}
      queryOptions={getProductsInfiniteQueryOptions}
    >
      <InfiniteSelectorTrigger>
        <InfiniteSelectorValue
          placeholder="Assign a product..."
          resolveQuery={({ value }) => getProductQueryOptions({ id: value })}
          render={(item) => item?.name}
        />
      </InfiniteSelectorTrigger>
      <InfiniteSelectorContent>
        <InfiniteSelectorInput placeholder="Search for a product..." />
        <InfiniteSelectorList>
          <InfiniteSelectorEmpty>No products.</InfiniteSelectorEmpty>
          <InfiniteSelectorGroup
            render={(products: Product[]) =>
              products.map((product) => (
                <InfiniteSelectorItem key={product.id} value={product.id}>
                  {product.name}
                </InfiniteSelectorItem>
              ))
            }
          />
        </InfiniteSelectorList>
      </InfiniteSelectorContent>
    </InfiniteSelector>
  );
}
