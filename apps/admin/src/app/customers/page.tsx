import { Customer } from "./columns";
import { CustomersTable } from "./data-table";

export default function CustomersPage() {
  const customers: Customer[] = [
    { id: 1, name: "Franco", role: "-a" },
  ];

  return (
    <div>
      <CustomersTable customers={customers} />
    </div>
  );
}
