"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import * as ReactDOM from "react-dom";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SelectableCommandItem } from "./command";

type SelectorContextProps<TValue> = {
  value: TValue | null;
  onValueChange: (value: TValue, node: React.ReactNode) => void;
  eq: (a: TValue, b: TValue) => boolean;
  valueNode: React.ReactNode;
  setValueNode: (node: React.ReactNode) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectorContext = React.createContext<SelectorContextProps<any> | null>(
  null,
);

function useSelector<TValue>() {
  const context = React.useContext(SelectorContext);
  if (!context) {
    throw new Error("useSelector must be used within a Selector");
  }
  return context as SelectorContextProps<TValue>;
}

function Selector<TValue>({
  value: valueProp,
  onValueChange: setValueProp,
  eq = (a: TValue, b: TValue) => a === b,
  ...props
}: React.ComponentProps<typeof Popover> & {
  value?: TValue | null;
  onValueChange?: (value: TValue | null) => void;
  eq?: (a: TValue, b: TValue) => boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [_value, _setValue] = React.useState<TValue | null>(null);
  const [valueNode, setValueNode] = React.useState<React.ReactNode>();

  const value = valueProp ?? _value;
  const onValueChange = React.useCallback(
    (newValue: TValue, node: React.ReactNode) => {
      const next = value && eq(value, newValue) ? null : newValue;
      if (setValueProp) {
        setValueProp(next);
      } else {
        _setValue(next);
      }
      setValueNode(next ? node : null);
      setOpen(false);
    },
    [setValueProp, value],
  );

  const contextValue = React.useMemo<SelectorContextProps<TValue>>(
    () => ({
      value,
      onValueChange,
      eq,
      valueNode,
      setValueNode,
      open,
      setOpen,
    }),
    [value, onValueChange, eq, valueNode, setValueNode, open, setOpen],
  );

  return (
    <SelectorContext.Provider value={contextValue}>
      <Popover
        data-slot="selector"
        open={open}
        onOpenChange={setOpen}
        {...props}
      />
    </SelectorContext.Provider>
  );
}

function SelectorTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <PopoverTrigger asChild>
      <Button
        data-slot="selector-trigger"
        variant="outline"
        className={cn("w-fit text-muted-foreground font-normal", className)}
        {...props}
      >
        {children}
        <ChevronsUpDownIcon className="ml-auto size-4 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

function SelectorContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  const { open, value, valueNode } = useSelector();

  const [fragment, setFragment] = React.useState<DocumentFragment>();
  React.useLayoutEffect(() => {
    if (!open && value && !valueNode) {
      setFragment(new DocumentFragment());
    }
  }, [open, value, valueNode]);

  return (
    <>
      <PopoverContent
        data-slot="selector-content"
        className={cn("p-0", className)}
        align="start"
        forceMount
        {...props}
      >
        {children}
      </PopoverContent>
      {fragment && ReactDOM.createPortal(children, fragment)}
    </>
  );
}

function SelectorItem<TValue>({
  value: valueProp,
  onSelect,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectableCommandItem>, "value"> & {
  value: TValue;
}) {
  const { value, onValueChange, setValueNode, eq, valueNode } =
    useSelector<TValue>();

  const selected = value ? eq(value, valueProp) : false;

  React.useLayoutEffect(() => {
    if (selected && !valueNode) {
      setValueNode(children);
    }
  }, [selected, valueNode, children]);

  return (
    <SelectableCommandItem
      data-slot="selector-item"
      selected={selected}
      onSelect={(event) => {
        onSelect?.(event);
        onValueChange(valueProp, children);
      }}
      {...props}
    >
      {children}
    </SelectableCommandItem>
  );
}

function SelectorValue<TValue>({
  placeholder = "Selector",
  render,
}: Omit<React.ComponentProps<"span">, "children"> & {
  placeholder?: React.ReactNode;
  render?: (value: TValue) => React.ReactNode;
}) {
  const { value, valueNode } = useSelector<TValue>();

  const content = React.useMemo(() => {
    if (render) {
      return value ? render(value) : placeholder;
    } else {
      return valueNode || placeholder;
    }
  }, [render, value, valueNode, placeholder]);

  return (
    <span
      data-slot="selector-value"
      data-placeholder={!value}
      className="text-foreground data-[placeholder=true]:text-muted-foreground transition-colors flex gap-2 items-center"
    >
      {content}
    </span>
  );
}

export {
  Selector,
  SelectorTrigger,
  SelectorValue,
  SelectorContent,
  SelectorItem,
  useSelector,
};
