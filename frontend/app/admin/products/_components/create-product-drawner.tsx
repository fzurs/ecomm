"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PackagePlusIcon } from "lucide-react";
import { ProductForm } from "./product-form";

export function CreateProductDrawner() {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <PackagePlusIcon />
          <span className="sr-only md:not-sr-only">Agregar producto</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <div className="flex gap-1.5 items-center">
            <PackagePlusIcon className="size-4" />
            <DrawerTitle>Agregar nuevo producto</DrawerTitle>
          </div>
          <DrawerDescription />
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <ProductForm
            item={{
              id: 123,
              title: "",
              description: "",
              category: "",
              last_update: new Date(),
              status: "",
              price: "",
              quantity: 0,
              image: "",
            }}
          />
        </div>
        <DrawerFooter>
          <Button>Crear</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
