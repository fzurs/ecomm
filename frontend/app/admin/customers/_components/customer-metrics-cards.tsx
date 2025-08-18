import { Customer } from "../_lib/customer-schema";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CustomerMetricsCards({ customers }: { customers: Customer[] }) {
  const totalCustomers = customers.length;
  const totalMaleCustomers = customers.filter(
    (customer) => customer.gender === "male"
  ).length;
  const totalFemaleCustomers = customers.filter(
    (customer) => customer.gender === "female"
  ).length;
  const averangeAgeOfCustomers = Math.round(
    customers
      .map((customer) => customer.age)
      .reduce((acc, num) => acc + num, 0) / totalCustomers
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardDescription>Total customers</CardDescription>
          <CardTitle className="text-2xl font-semibold md:text-3xl">
            {totalCustomers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Male customers</CardDescription>
          <CardTitle className="text-2xl font-semibold md:text-3xl">
            {totalMaleCustomers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Female customers</CardDescription>
          <CardTitle className="text-2xl font-semibold md:text-3xl">
            {totalFemaleCustomers}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Average age of customers</CardDescription>
          <CardTitle className="text-2xl font-semibold md:text-3xl">
            {averangeAgeOfCustomers}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
