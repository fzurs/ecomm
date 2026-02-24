import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Category = z
  .object({ id: z.number().int(), name: z.string().max(255) })
  .passthrough();
const PaginatedCategoryList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Category),
  })
  .passthrough();
const PatchedCategory = z
  .object({ id: z.number().int(), name: z.string().max(255) })
  .partial()
  .passthrough();
const StatusEnum = z.enum([
  "draft",
  "active",
  "inactive",
  "out_of_stock",
  "discontinued",
]);
const Product = z
  .object({
    id: z.number().int(),
    category: Category.nullable(),
    category_id: z.number().int().nullish(),
    name: z.string().max(255),
    description: z.string().nullish(),
    status: StatusEnum.optional(),
  })
  .passthrough();
const PaginatedProductList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Product),
  })
  .passthrough();
const PatchedProduct = z
  .object({
    id: z.number().int(),
    category: Category.nullable(),
    category_id: z.number().int().nullable(),
    name: z.string().max(255),
    description: z.string().nullable(),
    status: StatusEnum,
  })
  .partial()
  .passthrough();

export const schemas = {
  Category,
  PaginatedCategoryList,
  PatchedCategory,
  StatusEnum,
  Product,
  PaginatedProductList,
  PatchedProduct,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/categories/",
    alias: "categories_list",
    requestFormat: "json",
    parameters: [
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCategoryList,
  },
  {
    method: "post",
    path: "/categories/",
    alias: "categories_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Category,
      },
    ],
    response: Category,
  },
  {
    method: "get",
    path: "/categories/:id/",
    alias: "categories_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "put",
    path: "/categories/:id/",
    alias: "categories_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Category,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "patch",
    path: "/categories/:id/",
    alias: "categories_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCategory,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
  },
  {
    method: "delete",
    path: "/categories/:id/",
    alias: "categories_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/products/",
    alias: "products_list",
    requestFormat: "json",
    parameters: [
      {
        name: "category",
        type: "Query",
        schema: z.array(z.number().int()).optional(),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "offset",
        type: "Query",
        schema: z.number().int().optional(),
      },
      {
        name: "ordering",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "status",
        type: "Query",
        schema: z
          .array(
            z.enum([
              "active",
              "discontinued",
              "draft",
              "inactive",
              "out_of_stock",
            ])
          )
          .optional(),
      },
    ],
    response: PaginatedProductList,
  },
  {
    method: "post",
    path: "/products/",
    alias: "products_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Product,
      },
    ],
    response: Product,
  },
  {
    method: "get",
    path: "/products/:id/",
    alias: "products_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "put",
    path: "/products/:id/",
    alias: "products_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Product,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "patch",
    path: "/products/:id/",
    alias: "products_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedProduct,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
  },
  {
    method: "delete",
    path: "/products/:id/",
    alias: "products_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
