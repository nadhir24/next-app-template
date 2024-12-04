"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { MailIcon } from "./MailIcon";
import { LockIcon } from "./LockIcon";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

interface User {
  photoProfile: string | null;
  fullName: string;
  email: string;
}

export default function Modall() {
  const router = useRouter();

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
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login handler using Axios
  const handleLogin = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/auth/login`, {
        email,
        password,
      });
      const { data } = response;
      setUser(data.loginData); // Store user data in state
      localStorage.setItem("user", JSON.stringify(data.loginData)); // Save to local storage
      closeLogin();
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/"); // Redirect to home page
  };

  const handleOpenRegister = () => {
    closeLogin();
    openRegister();
  };

  const handleSubmit = async () => {
    const createUserDto = {
      fullName,
      email,
      phoneNumber,
      password,
    };

    try {
      await axios.post(`http://localhost:5000/auth/signup`, createUserDto);
      closeRegister();
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  return (
    <>
      {user ? (
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar
                src={user.photoProfile || "https://i.pravatar.cc/150?u=default"}
                size="lg"
                isBordered
              />
              <span>{user.fullName}</span>
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile">
              <p className="font-bold">Profile</p>
            </DropdownItem>
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button onClick={openLogin} color="default">
          Login
        </Button>
      )}

      {/* Login Modal */}
      <Modal isOpen={loginIsOpen} onClose={closeLogin} placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
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
                  <Checkbox classNames={{ label: "text-small" }}>
                    Remember me
                  </Checkbox>
                  <Link color="primary" onClick={handleOpenRegister} size="sm">
                    Don't have an account? Sign up
                  </Link>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={closeLogin}>
                  Close
                </Button>
                <Button color="primary" onClick={handleLogin}>
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Register Modal */}
      <Modal isOpen={registerIsOpen} onClose={closeRegister} placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Register</ModalHeader>
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
                <Input
                  label="Phone Number"
                  placeholder="+62 Enter your phone number"
                  variant="bordered"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  variant="bordered"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={closeRegister}>
                  Close
                </Button>
                <Button color="primary" onClick={handleSubmit}>
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
