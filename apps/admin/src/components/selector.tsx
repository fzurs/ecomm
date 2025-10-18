"use client";

import {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import * as ReactDOM from "react-dom";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandGroup as SelectorGroup,
  CommandList as SelectorList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SelectorContextProps = {
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  valueNode: React.ReactNode;
  setValueNode: (node: React.ReactNode) => void;
  valueNodeHasChild: boolean;
  setValueNodeHasChild: (hasChild: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
};

const SelectorContext = React.createContext<SelectorContextProps | null>(null);

function useSelector() {
  const context = React.useContext(SelectorContext);
  if (!context) {
    throw new Error("useSelector must be used within a Selector.");
  }

  return context;
}

function Selector({
  defaultValue,
  value: valueProp,
  onValueChange: setValueProp,
  children,
  open: openProp,
  onOpenChange: setOpenProp,
  defaultOpen,
  ...props
}: React.ComponentProps<typeof Popover> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}) {
  const [_open, _setOpen] = React.useState(false);
  const open = openProp !== undefined ? openProp : _open;
  const setOpen = React.useCallback(
    (open: boolean) => {
      if (setOpenProp) {
        setOpenProp(open);
      } else {
        _setOpen(open);
      }
    },
    [setOpenProp],
  );

  const [_value, _setValue] = React.useState(defaultValue ?? "");
  const value = valueProp !== undefined ? valueProp : _value;
  const setValue = React.useCallback(
    (value: string) => {
      if (setValueProp) {
        setValueProp(value);
      } else {
        _setValue(value);
      }
    },
    [setValueProp],
  );

  const [valueNode, setValueNode] = React.useState<React.ReactNode>();
  const [valueNodeHasChild, setValueNodeHasChild] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const contextValue = React.useMemo<SelectorContextProps>(
    () => ({
      value,
      setValue,
      open,
      setOpen,
      valueNode,
      setValueNode,
      valueNodeHasChild,
      setValueNodeHasChild,
      search,
      setSearch,
    }),
    [
      value,
      setValue,
      open,
      setOpen,
      valueNode,
      setValueNode,
      valueNodeHasChild,
      setValueNodeHasChild,
      search,
      setSearch,
    ],
  );

  return (
    <SelectorContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Popover>
    </SelectorContext.Provider>
  );
}

function SelectorTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open } = useSelector();

  return (
    <PopoverTrigger asChild>
      <Button
        role="combobox"
        aria-expanded={open}
        variant="outline"
        className={cn("justify-between", className)}
        {...props}
      >
        {children}
        <ChevronDown className="opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

function SelectorValue({
  placeholder,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  placeholder?: React.ReactNode;
}) {
  const { value, valueNode, setValueNodeHasChild } = useSelector();

  const hasChild = children !== undefined;
  React.useLayoutEffect(() => {
    if (hasChild) {
      setValueNodeHasChild(true);
    }
  }, [hasChild]);

  return (
    <span {...props}>
      {hasChild ? children : value ? valueNode : placeholder}
    </span>
  );
}
function SelectorContent({
  className,
  align = "start",
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const { open, value, valueNode, valueNodeHasChild } = useSelector();

  const [fragment, setFragment] = React.useState<DocumentFragment>();
  React.useLayoutEffect(() => {
    setFragment(new DocumentFragment());
  }, []);

  return (
    <>
      <PopoverContent className={cn("p-0", className)} align={align} {...props}>
        {children}
      </PopoverContent>
      {fragment &&
        !valueNodeHasChild &&
        !open &&
        value &&
        !valueNode &&
        ReactDOM.createPortal(children, fragment)}
    </>
  );
}

function SelectorControl({ ...props }: React.ComponentProps<typeof Command>) {
  return <Command {...props} />;
}

function CommandCheckboxItem({
  checked = false,
  children,
  ...props
}: React.ComponentProps<typeof CommandItem> & { checked?: boolean }) {
  return (
    <CommandItem {...props}>
      {children}
      <Check className={cn("ml-auto", checked ? "opacity-100" : "opacity-0")} />
    </CommandItem>
  );
}

function SelectorItem({
  value: valueProp = "",
  children,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandCheckboxItem>) {
  const {
    value,
    setValue,
    setOpen,
    setValueNode,
    valueNode,
    valueNodeHasChild,
  } = useSelector();

  const checked = value ? valueProp === value : false;

  React.useLayoutEffect(() => {
    if (checked && !valueNode && !valueNodeHasChild) {
      setValueNode(children);
    }
  }, [checked, valueNode, children, valueNodeHasChild]);

  return (
    <CommandCheckboxItem
      checked={checked}
      onSelect={(currentValue) => {
        onSelect?.(currentValue);
        setValue(checked ? "" : currentValue);
        setValueNode(checked ? undefined : children);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </CommandCheckboxItem>
  );
}

function SelectorEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty
      className={cn(
        "flex justify-center items-center py-6 text-center text-sm gap-2 [&>svg]:size-4 [&>svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

type SelectorInfiniteContextProps<TData> = {
  options: UseInfiniteQueryOptions<TData, any, InfiniteData<TData>, any, any>;
};

const SelectorInfiniteContext =
  React.createContext<SelectorInfiniteContextProps<any> | null>(null);

function useSelectorInfinite() {
  const context = React.useContext(SelectorInfiniteContext);
  if (!context) {
    throw new Error(
      "useSelectorInfinite must be used within a SelectorInfiniteOptions.",
    );
  }

  return context;
}

function SelectorInfiniteOptions<TData extends { results: unknown[] }>({
  options: optionsProp,
  children,
}: {
  options: (params: {
    search: string;
  }) => UseInfiniteQueryOptions<TData, any, InfiniteData<TData>, any, any>;
  children: (
    data: TData["results"],
    query: UseInfiniteQueryResult<InfiniteData<TData, unknown>, any>,
  ) => React.ReactNode;
}) {
  const { search } = useSelector();
  const options = optionsProp({ search });
  const query = useInfiniteQuery(options);
  const items = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.results) ?? [],
    [query.data],
  );

  const contextValue = React.useMemo<SelectorInfiniteContextProps<TData>>(
    () => ({ options }),
    [options],
  );

  return (
    <SelectorInfiniteContext.Provider value={contextValue}>
      {children(items, query)}
    </SelectorInfiniteContext.Provider>
  );
}

function SelectorInfiniteScrollList({
  onScroll,
  ...props
}: React.ComponentProps<typeof SelectorList>) {
  const { options } = useSelectorInfinite();
  const { hasNextPage, fetchNextPage } = useInfiniteQuery(options);

  return (
    <SelectorList
      onScroll={(event) => {
        onScroll?.(event);
        const target = event.currentTarget;
        if (
          hasNextPage &&
          target.scrollTop + target.clientHeight >= target.scrollHeight
        ) {
          fetchNextPage();
        }
      }}
      {...props}
    />
  );
}

function SelectorInput({
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  const { search, setSearch } = useSelector();

  return <CommandInput value={search} onValueChange={setSearch} {...props} />;
}

function SelectorDebouncedInput({
  ...props
}: React.ComponentProps<typeof SelectorInput>) {
  const [value, setValue] = React.useState("");
  const { setSearch } = useSelector();
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);
  const onValueChange = React.useCallback((value: string) => {
    setValue(value);
    debouncedSetSearch(value);
  }, []);

  return <SelectorInput value={value} onValueChange={onValueChange} />;
}

export {
  Selector,
  SelectorTrigger,
  SelectorValue,
  SelectorContent,
  SelectorControl,
  SelectorItem,
  SelectorEmpty,
  SelectorGroup,
  SelectorList,
  SelectorInput,
  useSelector,
  SelectorInfiniteOptions,
  SelectorInfiniteScrollList,
  SelectorDebouncedInput,
};
