"use client";
import React from "react";
import { Button as NextUIButton } from "@heroui/button";
import { motion } from "framer-motion"; // Import framer-motion

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
  variant = "ghost",
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

  // Define style for the button
  const buttonStyle = {
    backgroundColor: "#0072f5", // Primary color
    color: "#fff", // White text for contrast
    // Add other style properties as needed
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Start from invisible and below
      animate={{ opacity: 1, y: 0 }}    // Fade in and slide to original position
      transition={{ duration: 0.5 }}     // Animation duration
    >
      <NextUIButton
        size={size}
        variant={variant}
        isLoading={isLoading}
        onClick={onClick}
        style={{ ...buttonStyle, ...style }} // Combine button style and additional styles
        endContent={endContent}
      >
        {label || labels[size]}
      </NextUIButton>
    </motion.div>
  );
};

export default Tombol;
