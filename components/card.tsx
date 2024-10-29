import React from "react";
import { Card as NextUICard, CardHeader, CardBody } from "@nextui-org/card";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { Divider } from "@nextui-org/divider";

interface KartuProps {
  logoSrc: string | StaticImageData;
  title: string;
  subTitle: string;
  description: string;
  fullWidth?: boolean;
  textAlign?: "justify" | "left" | "right" | "center";
  logoClassName?: string;
  height?: number;
  width?: number;
  imageRadius?: "none" | "sm" | "md" | "lg" | "full"; // New prop for image radius
}

const Kartu: React.FC<KartuProps> = ({
  logoSrc,
  title,
  subTitle,
  description,
  fullWidth = false,
  textAlign = "left",
  logoClassName = "",
  height = 40,
  width = 40,
  imageRadius = "none" // Default to no radius
}) => {
  const textAlignClass = textAlign === "justify" ? "text-justify" : `text-${textAlign}`;
  
  // Define radius classes based on the imageRadius prop
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full"
  };

  return (
    <NextUICard
      className={`max-w-[400px] ${fullWidth ? "w-full" : ""} overflow-hidden`}
    >
      <CardHeader className="flex gap-3">
        <div 
          className={`relative ${logoClassName} overflow-hidden ${radiusClasses[imageRadius]}`} 
          style={{ 
            height, 
            width,
            minWidth: width, // Ensure consistent width
          }}
        >
          <Image
            alt="logo"
            src={logoSrc}
            layout="fill"
            objectFit="cover"
            className="absolute" // Removed rounded-lg to allow control via imageRadius prop
          />
        </div>
        <div className="flex flex-col">
          {/* <p className="text-md">{title}</p> */}
          <p className="text-small text-default-500">{subTitle}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
      <h2 className={`${textAlignClass} justify-center`}>{title}</h2>
      </CardBody>
      <Divider />
    </NextUICard>
  );
};

export default Kartu;