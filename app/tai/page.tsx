"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart } from "recharts";
import { Sidebar, TrendingUp, UsersRound } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { title } from "@/components/primitives";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
const salesTrendsData = [
  { month: "Jan", sales: 5 },
  { month: "Feb", sales: 10 },
  { month: "Mar", sales: 20 },
  { month: "Apr", sales: 30 },
  { month: "May", sales: 40 },
  { month: "Jun", sales: 50 },
];
const bestSellingProducts = [
  { productName: "Rano Cake", quantity: 120 },
  { productName: "Nastar", quantity: 95 },
  { productName: "Brownies", quantity: 110 },
  { productName: "Kue Cubir", quantity: 85 },
  { productName: "Tart", quantity: 130 },
];
const revenueProjectionData = [
  { month: "Jan", revenue: 200000 },
  { month: "Feb", revenue: 220000 },
  { month: "Mar", revenue: 240000 },
  { month: "Apr", revenue: 250000 },
  { month: "May", revenue: 270000 },
  { month: "Jun", revenue: 290000 },
];
const userDemographicsData = [
  { category: "Pengguna Baru", value: 350 },
  { category: "Pengguna Lama", value: 150 },
];

const salesData = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
  },
  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00" },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
  },
  { name: "William Kim", email: "will@email.com", amount: "+$99.00" },
  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00" },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
};

interface InfoCardProps {
  title: string;
  description?: string;
  value: string;
  icon?: React.ReactNode; // Untuk ikon opsional
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  value,
  icon,
}) => (
  <Card className="w-[350px] mt-4">
    <CardHeader>
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>} {/* Render ikon */}
        <CardTitle>{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid w-full items-center gap-4 capitalize">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name" className="text-lg font-bold">
            {value}
          </Label>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function TaiPage() {
  return (
    <>
      <div className={title({ color: "red", size: "lg", fullWidth: true })}>
        hello
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="flex flex-row w-full gap-4 mt-6 ">
            {/* Project Creation Form Cards */}
            <InfoCard
              title="Penghasilan Total"
              value="Rp.100.000"
              description="penghasilan hari ini"
              icon={<CircleDollarSign className="w-6 h-6" />} // Ikon dengan ukuran tertentu
            />
            <InfoCard
              title="Pengguna baru"
              value="50"
              description="bertambah +10"
              icon={<UsersRound className="w-6 h-6" />}
            />
            <InfoCard
              title="Total Penjualan Makanan"
              value="Rp.100.000"
              icon={<CircleDollarSign />}
            />
            <InfoCard
              title="stock produk"
              value="5"
              description="segera restock produk"
              icon={<PieChart />}
            />
          </div>

          {/* Wrapper untuk jarak */}
          <div className="flex flex-col gap-8 mt-8 ">
            <div className="flex flex-row gap-6">
              {/* Bar Chart */}
              <div className="aspect-video rounded-xl bg-muted/50 flex-1 capitalize">
                <Card>
                  <CardHeader>
                    <CardTitle>pendapatan tiap tahun</CardTitle>
                    <CardDescription>January - June 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="desktop"
                          fill="var(--color-desktop)"
                          radius={8}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                      Trending up by x.x% this month{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Showing total visitors for the last x months
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Recent Sales */}
              <Card className="w-full max-w-md ">
                <CardHeader className="capitalize">
                  <CardTitle>sales terbaru</CardTitle>
                  <CardDescription>
                    Rano cake telah menjual x produk bulan ini.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {salesData.map((sale, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300" />
                          <div>
                            <p>{sale.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {sale.email}
                            </p>
                          </div>
                        </div>
                        <p>{sale.amount}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="analysis" className="space-y-8">
          {/* Grafik Tren Penjualan */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Penjualan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={salesTrendsData} width={1000} height={300}>
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${value} Juta rupiah`} />
                <Legend />
              </LineChart>
            </CardContent>
          </Card>

          {/* Produk Terlaris */}
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={1000} height={300} data={bestSellingProducts}>
                <Bar dataKey="quantity" fill="#8884d8" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
              </BarChart>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={1000} height={300} data={bestSellingProducts}>
                <Bar dataKey="quantity" fill="#8884d8" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
              </BarChart>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={1000} height={300} data={bestSellingProducts}>
                <Bar dataKey="quantity" fill="#8884d8" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
              </BarChart>
            </CardContent>
          </Card>

          {/* Pengguna Baru vs Lama */}
          <Card>
            <CardHeader>
              <CardTitle>Pengguna Baru vs Lama</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart width={1150} height={400}>
                <Pie
                  data={userDemographicsData}
                  dataKey="value"
                  nameKey="category"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
              </PieChart>
            </CardContent>
          </Card>

          {/* Pendapatan Proyeksi */}
          <Card>
            <CardHeader>
              <CardTitle>Proyeksi Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={revenueProjectionData} width={1000} height={300}>
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

// {/* <TabsContent value="analysis">
// <Card>
//   <CardHeader>
//     <CardTitle>Analysis</CardTitle>
//   </CardHeader>
//   <CardContent>
//     {/* Konten untuk Analysis */}
//     <p>Konten Analysis</p>
//   </CardContent>
// </Card>
// </TabsContent>
// <TabsContent value="orders">
// <Card>
//   <CardHeader>
//     <CardTitle>Daftar Pesanan</CardTitle>
//   </CardHeader>
//   <CardContent>
//     <ul className="space-y-4">
//       <li className="flex items-center justify-between">
//         <span>Pesanan #12345</span>
//         <span className="text-green-600">Selesai</span>
//       </li>
//       <li className="flex items-center justify-between">
//         <span>Pesanan #12346</span>
//         <span className="text-yellow-600">Proses</span>
//       </li>
//     </ul>
//   </CardContent>
// </Card>
// </TabsContent>
// <TabsContent value="products">
// <Card>
//   <CardHeader>
//     <CardTitle>Manajemen Produk</CardTitle>
//   </CardHeader>
//   <CardContent>
//     <button className="px-4 py-2 text-white bg-primary rounded-md">
//       Tambah Produk
//     </button>
//   </CardContent>
// </Card>
// </TabsContent>
// <TabsContent value="users">
// <Card>
//   <CardHeader>
//     <CardTitle>Pengguna Baru</CardTitle>
//   </CardHeader>
//   <CardContent>
//     <ul className="space-y-4">
//       <li>Olivia Martin</li>
//       <li>Jackson Lee</li>
//     </ul>
//   </CardContent>
// </Card>
// </TabsContent> */}
