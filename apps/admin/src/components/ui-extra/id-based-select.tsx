"use client";

import { UseQueryOptions, useQuery } from "@tanstack/react-query";

import * as React from "react";

import { Select } from "./select";

function IdBasedSelect<
  TData extends { id: unknown },
  K extends keyof TData = "id",
>({
  value: valueId,
  onValueChange: onValueIdChange,
  getByIdQueryOptions,
  ...props
}: {
  value?: TData[K] | null;
  onValueChange?: (id: TData[K] | null) => void;
  getByIdQueryOptions?: (
    id: TData[K],
  ) => UseQueryOptions<TData, any, TData, any>;
} & Omit<React.ComponentProps<typeof Select>, "value" | "onValueChange">) {
  const [internalValue, setInternalValue] = React.useState<TData | null>(null);

  const query =
    getByIdQueryOptions &&
    useQuery({
      ...getByIdQueryOptions(valueId as TData[K]),
      enabled: !!valueId && !internalValue,
      retry: 0,
    });

  React.useEffect(() => {
    if (query?.data) {
      setInternalValue(query.data);
    }
  }, [query?.data]);

  const handleOnValueChange = React.useCallback(
    (value: TData | null) => {
      setInternalValue(value);
      onValueIdChange?.(value ? value["id" as K] : null);
    },
    [onValueIdChange],
  );

  return (
    <Select<TData>
      value={internalValue}
      onValueChange={handleOnValueChange}
      eq={(a, b) => a?.id === b.id}
      {...props}
    />
  );
}

export { IdBasedSelect };
