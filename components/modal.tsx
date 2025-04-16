"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
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
import { useAuth } from "@/context/AuthContext";

interface CartItem {
  id: number;
  userId: number | null;
  guestId: string | null;
  quantity: number;
  createdAt: string;
  catalog?: { id: number; name: string; image: string } | null;
  size?: { id: number; size: string; price: string } | null;
}

export default function Modall() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, logout, isLoggedIn } = useAuth();

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
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      login(data.user);
      toast.success("Login successful!");
      closeLogin();
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    router.push("/");
  };

  const handleOpenRegister = () => {
    closeLogin();
    openRegister();
  };

  const handleSignup = async () => {
    const createUserDto = {
      fullName,
      email,
      phoneNumber: `+62${phoneNumber}`,
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
      {isLoggedIn ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="flex items-center gap-3 cursor-pointer">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                  <Spinner size="sm" />
                </div>
              ) : (
                <Avatar
                  src={user?.photoProfile || "https://i.pravatar.cc/150?u=default"}
                  size="lg"
                  isBordered
                />
              )}
              <span>{isLoading ? "" : user?.fullName}</span>
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
        <Button onPress={openLogin} color="default" isLoading={isLoading} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Login"}
        </Button>
      )}
      <Modal isOpen={loginIsOpen} onClose={closeLogin} placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isLoggedIn ? "Logout" : "Login"}
              </ModalHeader>
              <ModalBody>
                {isLoggedIn ? (
                  <p>Are you sure you want to logout?</p>
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
                <Button
                  color="primary"
                  onPress={isLoggedIn ? handleLogout : handleLogin}
                  isDisabled={isLoading}
                >
                  {isLoggedIn ? "Logout" : "Login"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
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