import { Configuration, ProductsApi } from "@sdk";

const productsApi = new ProductsApi(
  new Configuration({ basePath: "http://localhost:8000" })
);

export default async function Home() {
  const products = await productsApi.productsList().then((res) => res.data);

  return <div>{JSON.stringify(products)}</div>;
}
