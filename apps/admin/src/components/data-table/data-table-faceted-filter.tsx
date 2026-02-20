"use client";

import type { Column } from "@tanstack/react-table";
import { Check, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import type { Option, OptionAsQueryOptions } from "@/types/data-table";
import { cn } from "@workspace/ui/lib/utils";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueries,
} from "@tanstack/react-query";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type OptionValue = Option["value"];

type OptionValueOrArray = OptionValue | OptionValue[];

interface DataTableFieldsetFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options?: Option[] | OptionAsQueryOptions;
  multiple?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options: optionsProp = [],
  multiple,
}: DataTableFieldsetFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);

  const columnFilterValue = column?.getFilterValue() as
    | Option["value"]
    | Option["value"][]
    | undefined;
  const selectedValues = new Set<Option["value"]>(
    typeof columnFilterValue === "undefined"
      ? []
      : Array.isArray(columnFilterValue)
        ? columnFilterValue
        : [columnFilterValue.toString()],
  );

  const onItemSelect = React.useCallback(
    (option: Option, isSelected: boolean) => {
      if (!column) return;

      if (multiple) {
        const newSelectedValues = new Set(selectedValues);
        if (isSelected) {
          newSelectedValues.delete(option.value);
        } else {
          newSelectedValues.add(option.value);
        }
        const filterValues = Array.from(newSelectedValues);
        column.setFilterValue(filterValues.length ? filterValues : undefined);
      } else {
        column.setFilterValue(isSelected ? undefined : option.value);
        setOpen(false);
      }
    },
    [column, multiple, selectedValues],
  );

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      column?.setFilterValue(undefined);
    },
    [column],
  );

  const [searchValue, setSearchValue] = React.useState("");
  const isQuery = !Array.isArray(optionsProp);
  const {
    data: itemsFetched,
    hasNextPage,
    fetchNextPage,
    isFetched,
  } = useInfiniteQuery(
    isQuery
      ? {
          ...optionsProp.getItemsInfiniteQueryOptions({
            search: searchValue ?? undefined,
            pageSize: 10,
          }),
          enabled: open,
          placeholderData: keepPreviousData,
        }
      : {
          queryKey: ["none"],
          queryFn: () => undefined,
          getNextPageParam: () => undefined,
          initialPageParam: undefined,
          enabled: false,
          placeholderData: keepPreviousData,
        },
  );
  const options = React.useMemo(
    () =>
      isQuery && itemsFetched
        ? itemsFetched.map(optionsProp.transformItemToOption)
        : (optionsProp as Option[]),
    [isQuery, itemsFetched],
  );
  const onScroll = useInfiniteScroll({ hasNextPage, fetchNextPage });
  const currentItemsFetched = useQueries(
    isQuery
      ? {
          queries: [...selectedValues].map((value) => ({
            ...optionsProp.getItemQueryOptions(value),
            enabled: !isFetched,
          })),
        }
      : { queries: [] },
  );
  const currentOptionsFetched = React.useMemo(
    () =>
      isQuery
        ? currentItemsFetched
            .filter(({ data }) => !!data)
            .map(({ data }) => data)
            .map(optionsProp.transformItemToOption)
        : [],
    [isQuery, currentItemsFetched],
  );

  const currentOptions = React.useMemo<Option[]>(() => {
    return [...selectedValues]
      .map((value) => {
        const optionFinded = options.find((option) => option.value === value);
        if (!optionFinded) {
          return currentOptionsFetched.find((option) => option.value === value);
        }
        return optionFinded;
      })
      .filter((option): option is Option => option !== undefined);
  }, [selectedValues, options, currentOptionsFetched]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed font-normal"
        >
          {selectedValues?.size > 0 ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onClick={onReset}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
                <span className="hidden md:flex"> selected</span>
              </Badge>
              <div className="hidden items-center gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  currentOptions.map((option) => (
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
      <PopoverContent className="w-50 p-0" align="start">
        <Command shouldFilter={!isQuery}>
          <CommandInput
            placeholder={title}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup
              className="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden"
              onScroll={onScroll}
            >
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onItemSelect(option, isSelected)}
                    value={option.value.toString()}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && <option.icon />}
                    <span className="truncate">{option.label}</span>
                    {option.count && (
                      <span className="ml-auto font-mono text-xs">
                        {option.count}
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
                    onSelect={() => onReset()}
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
