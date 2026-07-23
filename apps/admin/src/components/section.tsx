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

function Section({ ...props }: React.ComponentProps<"section">) {
  return <section {...props} />
}

function SectionContent({ ...props }: React.ComponentProps<"div">) {
  return <div className="mt-10 first:mt-0" {...props} />
}

function SectionHeader({ ...props }: React.ComponentProps<"header">) {
  return <header {...props} />
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    />
  )
}

function SectionDescription({ ...props }: React.ComponentProps<"p">) {
  return <p className="leading-7 not-first:mt-6" {...props} />
}

export {
  SectionGroup,
  Section,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  SectionContent,
}
