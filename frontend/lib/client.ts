import axios from "axios";
import { Configuration, InventoryApi, ProductsApi } from "./api";

const config = new Configuration();

const apiUrl = "http://localhost:8000";

export const productsApi = new ProductsApi(config, apiUrl, axios);

export const inventoryApi = new InventoryApi(config, apiUrl, axios);
