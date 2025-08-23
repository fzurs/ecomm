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
import { PackagePlus } from "lucide-react";
import { ProductForm } from "./product-form";
import { Separator } from "@/components/ui/separator";

export function CreateProductDrawer() {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="size-9 md:w-auto">
          <PackagePlus />
          <span className="sr-only md:not-sr-only">Create new Product</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create new Product</DrawerTitle>
          <DrawerDescription>
            Add a new product to your inventory. Fill in the required fields and
            save it to make it available immediately.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <Separator />
          <ProductForm />
        </div>
        <DrawerFooter>
          <Button>Create</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
