"use client";

import React, { useState } from "react";
import axios from "axios"; // Import Axios
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
import {Avatar} from "@nextui-org/avatar";
interface User {
  photoProfile: string | null;
  fullName: string;
  email: string;
}
export default function Modall() {
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

  // Login handler menggunakan Axios
  const handleLogin = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/auth/login`, {
        email,
        password,
      });
      const { data } = response;
      setUser(data.loginData); // Simpan data user
      closeLogin();
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const handleOpenRegister = () => {
    closeLogin();
    openRegister();
  };

  return (
    <>
     {user ? (
        <div className="flex items-center gap-3">
          <Avatar
            src={user.photoProfile || "https://i.pravatar.cc/150?u=default"}
            size="lg"
          />
          <span>{user.fullName}</span>
        </div>
      ) : (
        <Button onClick={openLogin} color="default">
          Login
        </Button>
      )}

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
                  label="Phone Number"
                  placeholder="+62 Enter your phone number"
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={closeRegister}>
                  Close
                </Button>
                <Button color="primary" onClick={closeRegister}>
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
