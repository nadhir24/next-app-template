"use client";
import React from "react";
import { Button as NextUIButton } from "@nextui-org/button";

interface TombolProps {
  size: "sm" | "md" | "lg";
  label?: string;
  variant?:
    | "solid"
    | "faded"
    | "bordered"
    | "light"
    | "flat"
    | "ghost"
    | "shadow";
  isLoading?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  endContent?: React.ReactNode;
}

const Tombol: React.FC<TombolProps> = ({
  size,
  label,
  variant = "ghost", // Menggunakan variant "ghost" agar tombol terlihat seperti ghost button
  isLoading = false,
  onClick,
  style,
  endContent,
}) => {
  const labels: { [key: string]: string } = {
    sm: "Get Started",
    md: "Get Started",
    lg: "Get Started",
  };

  // Mendefinisikan style untuk tombol
  const buttonStyle = {
    backgroundColor: "#0072f5", // Menggunakan warna primer yang Anda tentukan
    color: "#fff", // Warna teks diatur menjadi putih untuk kontras dengan latar belakang
    // Tambahkan properti style lain sesuai kebutuhan
  };

  return (
    <NextUIButton
      size={size}
      variant={variant}
      isLoading={isLoading}
      onClick={onClick}
      style={style} // Menambahkan properti style untuk menentukan warna latar belakang
      endContent={endContent}
    >
      {label || labels[size]}
    </NextUIButton>
  );
};

export default Tombol;
