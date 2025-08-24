export * from "./axios-client";
import { CategoriesApi, Configuration, ProductsApi } from "./axios-client";

const API_URL = process.env.API_URL as string;
const config = new Configuration({ basePath: API_URL });

export const productsApi = new ProductsApi(undefined, "http://localhost:8000");
export const categoriesApi = new CategoriesApi(undefined, "http://localhost:8000");
