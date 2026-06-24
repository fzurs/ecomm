import {
  makeApi,
  Zodios,
  type ZodiosOptions,
} from '@zodios/core'
import { z } from 'zod'

const Login = z
  .object({
    username: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string(),
  })
  .passthrough()
const Token = z
  .object({ key: z.string().max(40) })
  .passthrough()
const RestAuthDetail = z
  .object({ detail: z.string() })
  .passthrough()
const PasswordChange = z
  .object({
    new_password1: z.string().max(128),
    new_password2: z.string().max(128),
  })
  .passthrough()
const PasswordReset = z
  .object({ email: z.string().email() })
  .passthrough()
const PasswordResetConfirm = z
  .object({
    new_password1: z.string().max(128),
    new_password2: z.string().max(128),
    uid: z.string(),
    token: z.string(),
  })
  .passthrough()
const UserDetails = z
  .object({
    pk: z.number().int(),
    username: z
      .string()
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().email(),
    first_name: z.string().max(150).optional(),
    last_name: z.string().max(150).optional(),
  })
  .passthrough()
const PatchedUserDetails = z
  .object({
    pk: z.number().int(),
    username: z
      .string()
      .max(150)
      .regex(/^[\w.@+-]+$/),
    email: z.string().email(),
    first_name: z.string().max(150),
    last_name: z.string().max(150),
  })
  .partial()
  .passthrough()
const Brand = z
  .object({
    id: z.number().int(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/)
      .optional(),
    name: z.string().max(255),
  })
  .passthrough()
const PaginatedBrandList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Brand),
  })
  .passthrough()
const PatchedBrand = z
  .object({
    id: z.number().int(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/),
    name: z.string().max(255),
  })
  .partial()
  .passthrough()
const Category = z
  .object({
    id: z.number().int(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/)
      .optional(),
    name: z.string().max(255),
    description: z.string().nullish(),
  })
  .passthrough()
const PaginatedCategoryList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Category),
  })
  .passthrough()
const PatchedCategory = z
  .object({
    id: z.number().int(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/),
    name: z.string().max(255),
    description: z.string().nullable(),
  })
  .partial()
  .passthrough()
const StatusEnum = z.enum([
  'draft',
  'active',
  'inactive',
  'out_of_stock',
  'discontinued',
])
const Product = z
  .object({
    id: z.number().int(),
    brand: Brand.nullable(),
    brand_id: z.number().int().nullish(),
    category: Category.nullable(),
    category_id: z.number().int().nullish(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/)
      .optional(),
    sku: z.string().max(255).nullish(),
    name: z.string().max(255),
    description: z.string().nullish(),
    image: z.string().url().nullish(),
    status: StatusEnum.optional(),
    featured: z.boolean().optional(),
    price: z
      .number()
      .int()
      .gte(0)
      .lte(2147483647)
      .nullish(),
    discount_price: z
      .number()
      .int()
      .gte(0)
      .lte(2147483647)
      .nullish(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough()
const PaginatedProductList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Product),
  })
  .passthrough()
const PatchedProduct = z
  .object({
    id: z.number().int(),
    brand: Brand.nullable(),
    brand_id: z.number().int().nullable(),
    category: Category.nullable(),
    category_id: z.number().int().nullable(),
    slug: z
      .string()
      .max(255)
      .regex(/^[-a-zA-Z0-9_]+$/),
    sku: z.string().max(255).nullable(),
    name: z.string().max(255),
    description: z.string().nullable(),
    image: z.string().url().nullable(),
    status: StatusEnum,
    featured: z.boolean(),
    price: z
      .number()
      .int()
      .gte(0)
      .lte(2147483647)
      .nullable(),
    discount_price: z
      .number()
      .int()
      .gte(0)
      .lte(2147483647)
      .nullable(),
    created_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough()

export const schemas = {
  Login,
  Token,
  RestAuthDetail,
  PasswordChange,
  PasswordReset,
  PasswordResetConfirm,
  UserDetails,
  PatchedUserDetails,
  Brand,
  PaginatedBrandList,
  PatchedBrand,
  Category,
  PaginatedCategoryList,
  PatchedCategory,
  StatusEnum,
  Product,
  PaginatedProductList,
  PatchedProduct,
}

const endpoints = makeApi([
  {
    method: 'post',
    path: '/auth/login/',
    alias: 'auth_login_create',
    description: `Check the credentials and return the REST Token
if the credentials are valid and authenticated.
Calls Django Auth login method to register User ID
in Django session framework

Accept the following POST parameters: username, password
Return the REST Framework Token Object&#x27;s key.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Login,
      },
    ],
    response: z
      .object({ key: z.string().max(40) })
      .passthrough(),
  },
  {
    method: 'post',
    path: '/auth/logout/',
    alias: 'auth_logout_create',
    description: `Calls Django logout method and delete the Token object
assigned to the current User object.

Accepts/Returns nothing.`,
    requestFormat: 'json',
    response: z
      .object({ detail: z.string() })
      .passthrough(),
  },
  {
    method: 'post',
    path: '/auth/password/change/',
    alias: 'auth_password_change_create',
    description: `Calls Django Auth SetPasswordForm save method.

Accepts the following POST parameters: new_password1, new_password2
Returns the success/fail message.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PasswordChange,
      },
    ],
    response: z
      .object({ detail: z.string() })
      .passthrough(),
  },
  {
    method: 'post',
    path: '/auth/password/reset/',
    alias: 'auth_password_reset_create',
    description: `Calls Django Auth PasswordResetForm save method.

Accepts the following POST parameters: email
Returns the success/fail message.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z
          .object({ email: z.string().email() })
          .passthrough(),
      },
    ],
    response: z
      .object({ detail: z.string() })
      .passthrough(),
  },
  {
    method: 'post',
    path: '/auth/password/reset/confirm/',
    alias: 'auth_password_reset_confirm_create',
    description: `Password reset e-mail link is confirmed, therefore
this resets the user&#x27;s password.

Accepts the following POST parameters: token, uid,
    new_password1, new_password2
Returns the success/fail message.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PasswordResetConfirm,
      },
    ],
    response: z
      .object({ detail: z.string() })
      .passthrough(),
  },
  {
    method: 'get',
    path: '/auth/user/',
    alias: 'auth_user_retrieve',
    description: `Reads and updates UserModel fields
Accepts GET, PUT, PATCH methods.

Default accepted fields: username, first_name, last_name
Default display fields: pk, username, email, first_name, last_name
Read-only fields: pk, email

Returns UserModel fields.`,
    requestFormat: 'json',
    response: UserDetails,
  },
  {
    method: 'put',
    path: '/auth/user/',
    alias: 'auth_user_update',
    description: `Reads and updates UserModel fields
Accepts GET, PUT, PATCH methods.

Default accepted fields: username, first_name, last_name
Default display fields: pk, username, email, first_name, last_name
Read-only fields: pk, email

Returns UserModel fields.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UserDetails,
      },
    ],
    response: UserDetails,
  },
  {
    method: 'patch',
    path: '/auth/user/',
    alias: 'auth_user_partial_update',
    description: `Reads and updates UserModel fields
Accepts GET, PUT, PATCH methods.

Default accepted fields: username, first_name, last_name
Default display fields: pk, username, email, first_name, last_name
Read-only fields: pk, email

Returns UserModel fields.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PatchedUserDetails,
      },
    ],
    response: UserDetails,
  },
  {
    method: 'get',
    path: '/brands/',
    alias: 'brands_list',
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
    ],
    response: PaginatedBrandList,
  },
  {
    method: 'post',
    path: '/brands/',
    alias: 'brands_create',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Brand,
      },
    ],
    response: Brand,
  },
  {
    method: 'get',
    path: '/brands/:slug/',
    alias: 'brands_retrieve',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Brand,
  },
  {
    method: 'put',
    path: '/brands/:slug/',
    alias: 'brands_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Brand,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Brand,
  },
  {
    method: 'patch',
    path: '/brands/:slug/',
    alias: 'brands_partial_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PatchedBrand,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Brand,
  },
  {
    method: 'delete',
    path: '/brands/:slug/',
    alias: 'brands_destroy',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'get',
    path: '/brands/all/',
    alias: 'brands_list_all',
    requestFormat: 'json',
    response: z.array(Brand),
  },
  {
    method: 'get',
    path: '/categories/',
    alias: 'categories_list',
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: PaginatedCategoryList,
  },
  {
    method: 'post',
    path: '/categories/',
    alias: 'categories_create',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Category,
      },
    ],
    response: Category,
  },
  {
    method: 'get',
    path: '/categories/:slug/',
    alias: 'categories_retrieve',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Category,
  },
  {
    method: 'put',
    path: '/categories/:slug/',
    alias: 'categories_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Category,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Category,
  },
  {
    method: 'patch',
    path: '/categories/:slug/',
    alias: 'categories_partial_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PatchedCategory,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Category,
  },
  {
    method: 'delete',
    path: '/categories/:slug/',
    alias: 'categories_destroy',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'get',
    path: '/categories/all/',
    alias: 'categories_list_all',
    requestFormat: 'json',
    parameters: [
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.array(Category),
  },
  {
    method: 'get',
    path: '/products/',
    alias: 'products_list',
    requestFormat: 'json',
    parameters: [
      {
        name: 'brand',
        type: 'Query',
        schema: z.array(z.string()).optional(),
      },
      {
        name: 'category',
        type: 'Query',
        schema: z.array(z.string()).optional(),
      },
      {
        name: 'created_at_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'created_at_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'discount_price_max',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(0)
          .lte(2147483647)
          .nullish(),
      },
      {
        name: 'discount_price_min',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(0)
          .lte(2147483647)
          .nullish(),
      },
      {
        name: 'featured',
        type: 'Query',
        schema: z.boolean().optional(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().optional(),
      },
      {
        name: 'ordering',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'price_max',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(0)
          .lte(2147483647)
          .nullish(),
      },
      {
        name: 'price_min',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(0)
          .lte(2147483647)
          .nullish(),
      },
      {
        name: 'search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'status',
        type: 'Query',
        schema: z
          .array(
            z.enum([
              'active',
              'discontinued',
              'draft',
              'inactive',
              'out_of_stock',
            ]),
          )
          .optional(),
      },
    ],
    response: PaginatedProductList,
  },
  {
    method: 'post',
    path: '/products/',
    alias: 'products_create',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Product,
      },
    ],
    response: Product,
  },
  {
    method: 'get',
    path: '/products/:slug/',
    alias: 'products_retrieve',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Product,
  },
  {
    method: 'put',
    path: '/products/:slug/',
    alias: 'products_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Product,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Product,
  },
  {
    method: 'patch',
    path: '/products/:slug/',
    alias: 'products_partial_update',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PatchedProduct,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Product,
  },
  {
    method: 'delete',
    path: '/products/:slug/',
    alias: 'products_destroy',
    requestFormat: 'json',
    parameters: [
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: 'post',
    path: '/products/:slug/detect-and-assign-brand/',
    alias: 'products_detect_and_assign_brand_create',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Product,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Product,
  },
  {
    method: 'post',
    path: '/products/:slug/generate-sku/',
    alias: 'products_generate_sku_create',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Product,
      },
      {
        name: 'slug',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: Product,
  },
])

export const api = new Zodios(endpoints)

export function createApiClient(
  baseUrl: string,
  options?: ZodiosOptions,
) {
  return new Zodios(baseUrl, endpoints, options)
}
