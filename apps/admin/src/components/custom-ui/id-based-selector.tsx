"use client";

import { UseQueryOptions, useQuery } from "@tanstack/react-query";

import * as React from "react";

import { Selector } from "./selector";

function IdBasedSelector<
  TValue = { id: unknown },
  TKey extends keyof TValue = "id" & keyof TValue,
>({
  value: valueProp,
  onValueChange: setValueProp,
  idKey = "id" as TKey,
  queryOptions = () => ({
    queryKey: ["disabled-query"],
    queryFn: async () => undefined,
    enabled: false,
  }),
  eq = (a, b) => a[idKey] === b[idKey],
  ...props
}: Omit<
  React.ComponentProps<typeof Selector<TValue>>,
  "value" | "onValueChange"
> & {
  value?: TValue[TKey] | null;
  onValueChange?: (value: TValue[TKey] | null) => void;
  idKey?: TKey;
  queryOptions?: (id: TValue[TKey]) => UseQueryOptions<any, any, TValue, any>;
}) {
  const [item, _setItem] = React.useState<TValue | null>(null);

  const onValueChange = React.useCallback(
    (newItem: TValue | null) => {
      _setItem(newItem);
      if (setValueProp) {
        setValueProp(newItem?.[idKey] ?? null);
      }
    },
    [setValueProp],
  );

  const { data: fetchedItem } = useQuery({
    enabled: !!valueProp && !item,
    retry: 0,
    ...queryOptions(valueProp as TValue[TKey]),
  });
  React.useEffect(() => {
    if (fetchedItem) {
      onValueChange(fetchedItem);
    }
  }, [fetchedItem, onValueChange]);

  return (
    <Selector value={item} onValueChange={onValueChange} eq={eq} {...props} />
  );
}

export { IdBasedSelector };
