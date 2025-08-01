import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import Link from "next/link";

export default function Home() {
  return (
    <Card className="max-w-3xl mx-auto mt-10 p-6">
      <CardContent>
        <h1 className="text-2xl font-bold mb-4">Ejemplo de Ecommerce</h1>
        <p className="text-muted-foreground mb-6">
          Este es un ejemplo del panel de admin de un ecommerce o tienda online,
          el propósito es mostrar el stack de tecnologías que se podrían usar
          para realizarlo con éxito.
        </p>

        <Separator className="mb-6" />

        <h2 className="text-xl font-semibold mb-4">Tech stack</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Django</li>
          <li>DRF para la creación de API views</li>
          <li>DRF_Spectacular para documentación de la API</li>
          <li>
            OpenAPI generator para generar clients con axios o similares
            utilizables en el frontend
          </li>
          <li>Next.js como framework para el frontend</li>
          <li>shadcn/ui y dependencias para UI</li>
          <li>Docker y Docker Compose</li>
        </ul>
        <Separator className="mb-6" />

        <h2 className="text-xl font-semibold mb-4">Secciones del Panel</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/products"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Productos
            </Link>
          </li>
          <li>
            <Link
              href="/inventory"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Inventario
            </Link>
          </li>
          <li>
            <Link
              href="/products/add"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Creación de Producto
            </Link>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
