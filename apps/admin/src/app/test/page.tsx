"use client";

import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowData,
  TableOptions,
  TableState,
  Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Loader,
  LucideIcon,
  Search,
  Timer,
  X,
} from "lucide-react";
import { Check, PlusCircle } from "lucide-react";
import { useDebounce, useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Product, ProductStatusEnum } from "@workspace/api-client";

import { productsApi } from "@/lib/apis";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    isFetching?: boolean;
  }
  interface ColumnMeta<TData extends RowData, TValue> {
    variant?: "text" | "select";
    label?: string;
    placeholder?: string;
    options?: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }
}

const columns: ColumnDef<Product>[] = [
  { accessorKey: "id" },
  {
    accessorKey: "name",
    meta: { variant: "text", placeholder: "Search for a product..." },
  },
  {
    accessorKey: "status",
    meta: {
      variant: "select",
      options: [
        { label: "Active", value: ProductStatusEnum.Active },
        { label: "Out of stock", value: ProductStatusEnum.OutOfStock },
      ],
    },
  },
];

const getProductsQueryOptions = (
  params?: Parameters<typeof productsApi.productsList>[0],
) =>
  queryOptions({
    queryKey: ["products", params],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return productsApi.productsList(params).then((res) => res.data);
    },
    placeholderData: keepPreviousData,
  });

function useProducts({ columnFilters, pagination }: Partial<TableState> = {}) {
  const search =
    (columnFilters?.find((columnFilter) => columnFilter.id === "name")
      ?.value as string) ?? undefined;

  const status =
    (columnFilters?.find((columnFilter) => columnFilter.id === "status")
      ?.value as ProductStatusEnum) ?? undefined;

  return useQuery(
    getProductsQueryOptions({
      limit: pagination?.pageSize,
      offset: pagination
        ? pagination.pageIndex * pagination.pageSize
        : undefined,
      search,
      status,
    }),
  );
}

function useDataTable<TData>({
  data = { results: [], count: 0 },
  ...options
}: Omit<TableOptions<TData>, "getCoreRowModel" | "data"> & {
  data?: { results: TData[]; count: number };
}) {
  return useReactTable({
    data: data?.results ?? [],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(
      data.count / (options.state?.pagination?.pageSize ?? 1),
    ),
    ...options,
  });
}

export default function Page() {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isFetching } = useProducts({ pagination, columnFilters });

  const table = useDataTable({
    data,
    columns,
    state: { pagination, columnFilters },
    onPaginationChange: setPagination,
    onColumnFiltersChange: (updaterOrValue) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageIndex: 0 }));
      setColumnFilters(updaterOrValue);
    },
    meta: { isFetching },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Products</h1>
      <div className="w-full">
        <DataTableToolbar table={table} />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

function DataTable<TData>({ table }: { table: TanstackTable<TData> }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.options.meta?.isFetching ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Fetching data...
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DataTablePagination<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function DataTableToolbar<TData>({ table }: { table: TanstackTable<TData> }) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex flex-1 items-center gap-2">
        {table
          .getAllColumns()
          .filter((column) => column.getCanFilter())
          .map((column) => (
            <DataTableToolbarFilter key={column.id} column={column} />
          ))}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

function DataTableToolbarFilter<TData>({ column }: { column: Column<TData> }) {
  const columnMeta = column.columnDef.meta;

  switch (columnMeta?.variant) {
    case "text":
      const [value, setValue] = React.useState(
        (column.getFilterValue() as string) ?? "",
      );
      const debouncedSetFilterValue = useDebouncedCallback(
        column.setFilterValue,
        300,
      );
      return (
        <InputGroup>
          <InputGroupInput
            placeholder={columnMeta.placeholder ?? columnMeta.label}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              debouncedSetFilterValue(event.target.value);
            }}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      );
    case "select":
      return (
        <DataTableFacetedFilter
          column={column}
          title={columnMeta.label ?? column.id}
          options={columnMeta.options ?? []}
        />
      );
    default:
      return null;
  }
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input [&_svg]:invisible",
                      )}
                    >
                      <Check className="text-primary-foreground size-3.5" />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
