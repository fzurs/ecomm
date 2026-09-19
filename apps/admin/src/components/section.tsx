import { cn } from "@workspace/ui/lib/utils"

function SectionGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container flex flex-col gap-4 space-y-6 p-4 lg:gap-6 lg:space-y-8 lg:p-6",
        className
      )}
      {...props}
    />
  )
}

function Section({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />
}

function SectionHeader({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />
}

function SectionTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />
}

function SectionDescription({ ...props }: React.ComponentProps<"p">) {
  return <p className="leading-7 not-first:mt-6" {...props} />
}

function SectionContent({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />
}

function SectionAction({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />
}

export {
  SectionGroup,
  Section,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  SectionAction,
  SectionContent,
}
