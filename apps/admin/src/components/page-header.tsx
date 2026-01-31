import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

export function PageHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div
        className={cn(
          "flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6",
          className
        )}
        {...props}
      >
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {children}
      </div>
    </header>
  );
}

export function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 className={cn("text-base font-medium", className)} {...props} />;
}

export function PageAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ml-auto flex items-center gap-2", className)}
      {...props}
    />
  );
}

export function PageContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div
          className={cn("flex flex-col gap-4 py-4 md:gap-6 md:py-6", className)}
          {...props}
        />
      </div>
    </div>
  );
}
