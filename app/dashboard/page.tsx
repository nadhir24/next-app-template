"use client";

import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import axios from "axios";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  photoProfile?: string;
  roleId?: { roleId: number }[];
  userProfile?: {
    birthDate?: string;
    gender?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

const navigationData = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Profile", url: "/dashboard/profile" },
      { title: "Settings", url: "/dashboard/settings" },
    ],
  },
];

function DashboardPage() {
  console.log("DashboardPage rendering...");
  const { user, setUserState, isLoading: isUserLoading } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      console.log("[Dashboard] User context loaded/changed:", user);
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    } else {
        setFormData({ fullName: "", email: "", phoneNumber: "" }); 
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const token = user.token || localStorage.getItem("token"); 
      
      if (!token) {
         toast.error("Authentication token not found. Please log in again.");
         return;
      }

      const roleID = user.roleId?.[0]?.roleId || 3;
      console.log("RoleID:", roleID);

      const requestPayload = {
        ...formData,
        roleID: roleID,
      };

      console.log("Making PUT request to update user data:", requestPayload);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        requestPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response:", response.data);
      const updatedUser = response.data.data;

      if (!updatedUser) {
        throw new Error("Update response did not contain user data.");
      }

      setUserState(updatedUser);
      console.log("User state updated via context after successful PUT.");
      
      setFormData({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phoneNumber: updatedUser.phoneNumber || "",
      });

      setIsEditing(false);
      toast.success("Data berhasil diperbarui");

    } catch (error) {
      console.error("Error updating user data:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
        console.error("Request payload:", JSON.parse(error.config?.data || "{}"));
      }
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Sesi Anda telah berakhir, silakan login ulang");
      } else {
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message;
        if (errorMessage?.includes("already in use")) {
            toast.error("Email sudah digunakan. Silakan gunakan email lain.");
        } else {
            toast.error(errorMessage || "Gagal memperbarui data");
        }
      }
    }
  };

  if (isUserLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar navigationData={navigationData} />
      <SidebarInset>
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard Pengguna</h1>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="orders">Pesanan</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                      <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className="flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button type="button" variant="outline" onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              fullName: user.fullName || "", 
                              email: user.email || "", 
                              phoneNumber: user.phoneNumber || ""
                            });
                          }}>
                            Batal
                          </Button>
                          <Button type="submit" variant="default">
                            Simpan
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" variant="default" onClick={(e) => { e.preventDefault(); setIsEditing(true); }}>
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Riwayat pesanan akan ditampilkan di sini</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardPage;