import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconUserShield } from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container p-4 lg:py-6 mx-auto flex justify-center items-center">
      <Card className="max-w-4xl w-full">
        <CardHeader>
          <CardTitle>Tienda online</CardTitle>
          <CardDescription>
            Ejemplo del panel de gestión de una tienda online
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/admin">
              <IconUserShield />
              Ir al panel de administración
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
