"use client";
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import grup2 from "@/public/grup2.png";
// Import Swiper styles
import NextUIButton from "@/components/button";
import Link from "next/link";
import { Icon } from "@iconify/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "../styles/globals.css";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

export default function SwiperComponent() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  const progressCircle = useRef(null);
  const progressContent = useRef(null);
  const onAutoplayTimeLeft = (s, time, progress) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };
  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        onAutoplayTimeLeft={onAutoplayTimeLeft}
        className="mySwiper"
      >
        <SwiperSlide>
          <Image src={grup2} width="100%" height="100%" />
          <div className="mt-2">
            <Link href="/katalog" passHref>
              <NextUIButton
                size="lg"
                variant="shadow"
                label="Pesan Sekarang"
                onClick={handleClick}
                isLoading={loading}
                endContent={
                  <Icon
                    icon="icon-park-outline:buy"
                    width="1.2rem"
                    height="1.2rem"
                  />
                }
              />
            </Link>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <Image src={grup2} width="100%" height="100%" />
        </SwiperSlide>
        <SwiperSlide>
          <Image src={grup2} width="100%" height="100%" />
        </SwiperSlide>
        <SwiperSlide>
          <Image src={grup2} width="100%" height="100%" />
        </SwiperSlide>
        <SwiperSlide>
          <Image src={grup2} width="100%" height="100%" />
        </SwiperSlide>

        <div className="autoplay-progress" slot="container-end">
          <svg viewBox="0 0 48 48" ref={progressCircle}>
            <circle cx="24" cy="24" r="20"></circle>
          </svg>
          <span ref={progressContent}></span>
        </div>
      </Swiper>
    </>
  );
}
