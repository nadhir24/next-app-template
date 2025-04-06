"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { MailIcon } from "./MailIcon";
import { LockIcon } from "./LockIcon";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Spinner } from "@nextui-org/spinner";

interface User {
  photoProfile: string | null;
  fullName: string;
  email: string;
}

interface CartItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export default function Modall() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fix: Remove the recursive call to handleCart
  const handleCart = (cart: CartItem[]) => {
    saveCart(cart);
    // You might want to perform other actions here, but avoid calling handleCart again
  };

  const {
    isOpen: loginIsOpen,
    onOpen: openLogin,
    onClose: closeLogin,
  } = useDisclosure();

  const {
    isOpen: registerIsOpen,
    onOpen: openRegister,
    onClose: closeRegister,
  } = useDisclosure();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Token type updated to string | null
  const [cart, setCart] = useState<CartItem[]>([]); // cart type updated to CartItem[]
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user"); // Remove invalid data
      }
    }
  }, []);

  const getCart = (): CartItem[] => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) return [];

    try {
      return JSON.parse(storedCart);
    } catch (error) {
      console.error("Error parsing cart data from localStorage:", error);
      localStorage.removeItem("cart"); // Remove invalid data
      return [];
    }
  };

  const saveCart = (cart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  // Login handler using Axios
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );
      const { token, loginData } = response.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      setUser(loginData);
      localStorage.setItem("user", JSON.stringify(loginData));

      // Ambil cart dari localStorage dan sinkronkan dengan server
      const localCart = getCart();
      if (localCart.length > 0) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/sync`,
          { cart: localCart },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      closeLogin();
      toast.success("Login berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Login gagal. Silakan cek email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Hapus data user dan token
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Hapus semua data cart
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cart");

      // Hapus guest ID jika ada
      localStorage.removeItem("guestId");
      sessionStorage.removeItem("guestId");

      toast.success("Berhasil logout");

      // Redirect ke halaman home
      router.push("/");

      // Trigger event untuk update komponen cart
      window.dispatchEvent(new Event("cartUpdate"));
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Gagal logout. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRegister = () => {
    closeLogin();
    openRegister();
  };

  const handleSignup = async () => {
    const createUserDto = {
      fullName,
      email,
      phoneNumber: `+62${phoneNumber}`, // Tambahkan kode negara di sini
      password,
      confirmPassword,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        createUserDto
      );
      closeRegister();
      openLogin();

      // Reset form setelah sukses
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      toast.success("Registrasi berhasil! Silakan login.");
    } catch (error: any) {
      console.error("Error during sign up:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Registrasi gagal: ${error.response.data.message}`);
      } else {
        toast.error("Registrasi gagal. Silakan coba lagi.");
      }
    }
  };

  return (
    <>
      {user ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="flex items-center gap-3 cursor-pointer">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                  <Spinner size="sm" />
                </div>
              ) : (
                <Avatar
                  src={
                    user.photoProfile || "https://i.pravatar.cc/150?u=default"
                  }
                  size="lg"
                  isBordered
                />
              )}
              <span>{isLoading ? "" : user.fullName}</span>
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile">
              <p className="font-bold">Profile</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button
          onPress={openLogin}
          color="default"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : "Login"}
        </Button>
      )}
      {/* Login Modal */}
      <Modal isOpen={loginIsOpen} onClose={closeLogin} placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <>
                    <Input
                      autoFocus
                      label="Email"
                      placeholder="Enter your email"
                      variant="bordered"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      endContent={
                        <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                    />

                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                      variant="bordered"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      endContent={
                        <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                    />

                    <div className="flex py-2 px-1 justify-between">
                      <Checkbox
                        isSelected={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        classNames={{ label: "text-small" }}
                      >
                        Remember me
                      </Checkbox>

                      <Link
                        color="primary"
                        onPress={handleOpenRegister}
                        size="sm"
                      >
                        Don't have an account? Sign up
                      </Link>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={closeLogin}
                  isDisabled={isLoading}
                >
                  Close
                </Button>
                {/* Fix: Use the Button component directly with the handleLogin function */}
                <Button
                  color="primary"
                  onPress={handleLogin}
                  isDisabled={isLoading}
                >
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Register Modal */}
      <Modal
        isOpen={registerIsOpen}
        onClose={closeRegister}
        placement="top-center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Register
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  variant="bordered"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex items-center">
                  <span className="px-2 py-2 bg-gray-200 rounded-l-md border border-gray-300 text-gray-700">
                    +62
                  </span>

                  <Input
                    placeholder="8xxxxxxxxxx"
                    variant="bordered"
                    value={phoneNumber}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/[^0-9]/g, "");
                      setPhoneNumber(inputValue);
                    }}
                  />
                </div>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  variant="bordered"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  variant="bordered"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={closeRegister}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSignup}>
                  Sign up
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}