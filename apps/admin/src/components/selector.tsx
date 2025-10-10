"use client";

import { SelectProps } from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import * as ReactDOM from "react-dom";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandGroup as SelectorGroup,
  CommandInput as SelectorInput,
  CommandList as SelectorList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SelectorContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  valueNode: React.ReactNode;
  setValueNode: (node: React.ReactNode) => void;
  valueNodeHasChildren: boolean;
  setValueNodeHasChildren: (hasChildren: boolean) => void;
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
  defaultOpen = false,
  open: openProp,
  onOpenChange: setOpenProp,
  defaultValue = "",
  value: valueProp,
  onValueChange: setValueProp,
  ...props
}: React.ComponentProps<typeof Popover> & SelectProps) {
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open],
  );

  const [_value, _setValue] = React.useState(defaultValue);
  const value = valueProp ?? _value;
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
  const [valueNodeHasChildren, setValueNodeHasChildren] = React.useState(false);

  const contextValue = React.useMemo<SelectorContextProps>(
    () => ({
      open,
      setOpen,
      value,
      setValue,
      valueNode,
      setValueNode,
      valueNodeHasChildren,
      setValueNodeHasChildren,
    }),
    [
      open,
      setOpen,
      value,
      setValue,
      valueNode,
      setValueNode,
      valueNodeHasChildren,
      setValueNodeHasChildren,
    ],
  );

  return (
    <SelectorContext.Provider value={contextValue}>
      <Popover open={open} onOpenChange={setOpen} {...props} />
    </SelectorContext.Provider>
  );
}

function SelectorTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open } = useSelector();

  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("justify-between", className)}
        {...props}
      >
        {children}
        <ChevronDownIcon className="opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

function SelectorValue({
  placeholder,
  render,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  placeholder?: React.ReactNode;
  render?: (value: string) => React.ReactNode;
}) {
  const { value, valueNode, setValueNodeHasChildren } = useSelector();
  const hasChildren = render !== undefined;
  React.useLayoutEffect(() => {
    setValueNodeHasChildren(hasChildren);
  }, [hasChildren]);

  return (
    <span className="flex items-center gap-2" {...props}>
      {hasChildren
        ? (value && render(value)) || placeholder
        : valueNode || placeholder}
    </span>
  );
}

function SelectorContent({
  children,
  ...props
}: React.ComponentProps<typeof Command>) {
  const { open, value, valueNode, valueNodeHasChildren } = useSelector();

  const [fragment, setFragment] = React.useState<DocumentFragment>();
  React.useLayoutEffect(() => {
    setFragment(new DocumentFragment());
  }, []);

  const content = React.useMemo(
    () => <Command {...props}>{children}</Command>,
    [props, children],
  );

  return (
    <>
      <PopoverContent className="p-0" align="start">
        {content}
      </PopoverContent>
      {!open && fragment && !valueNodeHasChildren && value && !valueNode
        ? ReactDOM.createPortal(content, fragment)
        : null}
    </>
  );
}

function SelectorItem({
  children,
  value: valueProp,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  const {
    value,
    setValue,
    setOpen,
    setValueNode,
    valueNode,
    valueNodeHasChildren,
  } = useSelector();

  const checked = value === valueProp;

  React.useLayoutEffect(() => {
    if (!valueNodeHasChildren && checked && !valueNode) {
      setValueNode(children);
    }
  }, [valueNodeHasChildren, checked, valueNode]);

  return (
    <CommandItem
      value={valueProp}
      onSelect={(currentValue) => {
        setValue(currentValue === value ? "" : currentValue);
        setValueNode(currentValue === value ? undefined : children);
        setOpen(false);
      }}
      {...props}
    >
      {children}
      <CheckIcon
        className={cn(
          "ml-auto",
          value === valueProp ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
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

export {
  Selector,
  SelectorTrigger,
  SelectorValue,
  SelectorContent,
  SelectorItem,
  SelectorEmpty,
  SelectorGroup,
  SelectorList,
  SelectorInput,
  useSelector,
};
