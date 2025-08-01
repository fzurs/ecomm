import { Configuration, InventoryApi, ProductsApi } from "./api";
import env from "./env";

const config = new Configuration({
  basePath: env.NEXT_PUBLIC_API_URL,
});

export const productsApi = new ProductsApi(config);

export const inventoryApi = new InventoryApi(config);

export const isMock = env.NEXT_PUBLIC_USE_MOCK === "true" ? true : false;
