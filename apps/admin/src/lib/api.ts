import { CategoriesApi, Configuration, ProductsApi } from "@sdk";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const config = new Configuration({ basePath: apiUrl });

export const productsApi = new ProductsApi(config);

export const categoriesApi = new CategoriesApi(config);
