import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPackage, IconTrendingUp } from "@tabler/icons-react";

const data = [
  {
    title: "Total of orders",
    description: "1",
    badgeText: "+100% vs last month",
    icon: IconTrendingUp,
    footer: {
      text1: "Trending up this month",
      text2: "Orders for the last 30 days",
    },
  },
  {
    title: "Total of products",
    description: "30",
    badgeText: "100% in stock",
    icon: IconPackage,
    footer: {
      text1: "Inventory stable",
      text2: "15 products added this month",
    },
  },
  {
    title: "Total of customers",
    description: "15",
    badgeText: "+3 new",
    icon: IconTrendingUp,
    footer: {
      text1: "Growing customer base",
      text2: "Customer growth in the last quarter",
    },
  },
  {
    title: "Monthly Revenue",
    description: "$1,365",
    badgeText: "+8.2% vs last month",
    icon: IconTrendingUp,
    footer: {
      text1: "Revenue increasing",
      text2: "Revenue trend for the last 3 months",
    },
  },
];

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:shadow-xs">
      {data.map(({ title, description, badgeText, icon: Icon, footer }, i) => (
        <Card className="@container/card" key={i}>
          <CardHeader>
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {description}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">{badgeText}</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {footer.text1} <Icon className="size-4" />
            </div>
            <div className="text-muted-foreground">{footer.text2}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
