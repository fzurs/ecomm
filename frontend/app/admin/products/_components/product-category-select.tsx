"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const categories = [
  "Analgésicos",
  "Antihistamínicos",
  "Antiinflamatorios",
  "Antisépticos",
  "Cardiología",
  "Cuidado Personal",
  "Dispositivos Médicos",
  "Gastroenterología",
  "Material de Curación",
  "Medicamentos Respiratorios",
  "Protección Personal",
  "Soluciones",
  "Vitaminas y Suplementos",

  // Nuevas categorías añadidas
  "Antibióticos",
  "Antivirales",
  "Antimicóticos",
  "Cuidado Capilar",
  "Cuidado de la Piel",
  "Cuidado Dental",
  "Cuidado Infantil",
  "Dermatología",
  "Diabetes",
  "Endocrinología",
  "Ginecología",
  "Homeopatía",
  "Instrumentos de Medición",
  "Medicamentos Oftálmicos",
  "Medicamentos Óticos",
  "Medicamentos Pediátricos",
  "Medicina Alternativa",
  "Neurología",
  "Nutrición Clínica",
  "Oncología",
  "Ortopedia",
  "Productos Naturales",
  "Psiquiatría",
  "Reumatología",
  "Salud Femenina",
  "Salud Masculina",
  "Salud Mental",
  "Salud Sexual",
  "Sistema Inmunológico",
  "Urología",
  "Veterinaria",
];

export function ProductCategorySelect() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {value
            ? categories.find((category) => category === value)
            : "Seleccionar una categoría..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category}
                  value={category}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {category}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === category ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
