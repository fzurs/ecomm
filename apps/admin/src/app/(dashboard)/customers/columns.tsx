import { ColumnDef } from "@tanstack/react-table";
import { ShieldUser, User } from "lucide-react";

import { Customer } from "@workspace/api-client";

import { useIsMobile } from "@/hooks/use-mobile";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const columns: ColumnDef<Customer>[] = [
  {
    id: "username",
    header: "Username",
    cell: function Cell({ row }) {
      const customer = row.original;

      const isMobile = useIsMobile();

      return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
          <DrawerTrigger asChild>
            <Button variant={"link"}>{customer.user.username}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{customer.user.username}</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter>
              <Button type="submit">Saving...</Button>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    },
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => row.original.user.email,
  },
  {
    id: "firstName",
    header: "First Name",
    cell: ({ row }) => row.original.user.first_name,
  },
  {
    id: "lastName",
    header: "Last Name",
    cell: ({ row }) => row.original.user.last_name,
  },
  {
    id: "isStaff",
    header: "Is Staff",
    cell: ({ row }) => (
      <Badge variant={"outline"}>
        {row.original.user.is_staff ? (
          <>
            <ShieldUser className="fill-green-400 text-green-800" />
            Staff
          </>
        ) : (
          <>
            <User />
            User
          </>
        )}
      </Badge>
    ),
  },
];
