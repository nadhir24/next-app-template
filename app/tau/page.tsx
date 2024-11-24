"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, ShoppingCart, UserPlus } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>

      {/* Statistik Penjualan */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex items-center gap-4">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <CardTitle>Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rp 5,000,000</p>
            <p className="text-sm text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-4">
            <UserPlus className="w-6 h-6 text-primary" />
            <CardTitle>Pengguna Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">150</p>
            <p className="text-sm text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-4">
            <PieChart className="w-6 h-6 text-primary" />
            <CardTitle>Produk Habis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-muted-foreground">Segera tambah stok!</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Manajemen */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <span>Pesanan #12345</span>
                  <span className="text-green-600">Selesai</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pesanan #12346</span>
                  <span className="text-yellow-600">Proses</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <button className="px-4 py-2 text-white bg-primary rounded-md">
                Tambah Produk
              </button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Pengguna Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>Olivia Martin</li>
                <li>Jackson Lee</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
