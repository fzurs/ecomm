import { CustomerSummary } from "@workspace/api-client"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { buttonVariants } from "@workspace/ui/components/button"
import { EyeIcon, MailIcon } from "lucide-react"
import Link from "next/link"

export function OrderCustomerItem({ customer }: { customer: CustomerSummary }) {
  return (
    <Item variant="muted">
      <ItemMedia variant="image">
        <Avatar size="lg">
          {customer.image && <AvatarImage src={customer.image} />}
          <AvatarFallback />
        </Avatar>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle>{customer.name}</ItemTitle>
        {customer.email && (
          <ItemDescription className="flex items-center gap-2">
            <MailIcon className="size-4 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <Link
          href={`/customers/${customer.id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          <EyeIcon />
          <span>View details</span>
        </Link>
      </ItemActions>
    </Item>
  )
}
