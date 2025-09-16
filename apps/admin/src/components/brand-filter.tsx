"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import * as React from "react";

import { Brand } from "@workspace/api-client";

import { getBrandQueryOptionsOnce } from "@/lib/queries";

import { BrandList } from "./brand-select";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function useBrandSearchParams() {
  return useQueryState("brand", parseAsInteger);
}

export function BrandFilter() {
  const [open, setOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null);

  const [brandId, setBrandId] = useBrandSearchParams();

  const { data } = useQuery(getBrandQueryOptionsOnce(brandId, selectedBrand));

  React.useEffect(() => {
    if (data) {
      setSelectedBrand(data);
    } else if (brandId) {
      setSelectedBrand(null);
    }
  }, [data, brandId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedBrand?.name ?? "Brand"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <BrandList
          selectedBrand={selectedBrand}
          setSelectedBrand={(brand) => {
            setSelectedBrand(brand);
            setBrandId(brand?.id ?? null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
