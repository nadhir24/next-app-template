"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { MailIcon } from "./MailIcon";
import { LockIcon } from "./Lockicon";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";

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

  const handleOpenRegister = () => {
    closeLogin(); // Tutup modal login
    openRegister(); // Buka modal pendaftaran
  };

  return (
    <>
      <Button onClick={openLogin} color="default">
        Login
      </Button>
      <Modal isOpen={loginIsOpen} onClose={closeLogin} placement="top-center">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  endContent={
                    <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                />
                <Input
                  endContent={
                    <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
                />
                <div className="flex py-2 px-1 justify-between">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                  >
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
                <Button color="primary" onClick={closeLogin}>
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal pendaftaran */}
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
