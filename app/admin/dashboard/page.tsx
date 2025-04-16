"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Users, ShoppingBag, DollarSign } from "lucide-react";

interface DashboardSummary {
  totalSales: number;
  totalUsers: number;
  totalProducts: number;
  recentSales: Array<{
    id: number;
    amount: number;
    createdAt: string;
    user: {
      fullName: string;
    } | null;
  }>;
  recentOrders: Array<{
    id: number;
    invoiceId: number;
    invoiceStatus: string;
    userName: string;
    productName: string;
    quantity: number;
    price: number;
    date: string;
    sizeId: number;
    sizeLabel: string;
  }>;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        console.log(data);
        setSummary(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalProducts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.recentSales?.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{sale.user?.fullName || 'Anonymous User'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="font-medium text-green-600">
                    +{formatCurrency(sale.amount)}
                  </div>
                </div>
              ))}
              {(!summary?.recentSales || summary.recentSales.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent sales</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{order.userName}</p>
                    <p className="text-sm font-medium">
                      {order.productName} 
                      {order.sizeLabel && <span> ({order.sizeLabel})</span>} 
                      <span> ({order.quantity}x)</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-right">{formatCurrency(order.price)}</p>
                    <p className={`text-sm text-right ${
                      order.invoiceStatus === 'settlement' ? 'text-green-600' : 
                      order.invoiceStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {order.invoiceStatus}
                    </p>
                  </div>
                </div>
              ))}
              {(!summary?.recentOrders || summary.recentOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}