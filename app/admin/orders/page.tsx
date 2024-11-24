"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: number;
  customerName: string;
  totalPrice: string;
  date: string;
  status: "completed" | "pending";
}

const orders: Order[] = [
  {
    id: 101,
    customerName: "John Doe",
    totalPrice: "Rp320,000",
    date: "2024-11-21",
    status: "completed",
  },
  {
    id: 102,
    customerName: "Jane Smith",
    totalPrice: "Rp150,000",
    date: "2024-11-20",
    status: "pending",
  },
  {
    id: 103,
    customerName: "Michael Brown",
    totalPrice: "Rp220,000",
    date: "2024-11-19",
    status: "completed",
  },
];

export default function OrdersPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders Management</h1>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5%]">#</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.totalPrice}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "completed" ? "default" : "destructive"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
