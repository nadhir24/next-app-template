// Home.tsx
"use client";

import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import NextUIButton from "@/components/button";
import React, { useRef, useState } from "react";
import wkwkwk from "@/public/wkwkwk.jpg";
import wkwkwkwk from "@/public/wkwkwkwk.jpg";
import Kartu from "@/components/card";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Toaster, toast } from "sonner";
import jaja1 from "@/public/jaja1.png";
import Choco from "@/public/choco.jpg";
import { motion } from "framer-motion";
import { Card, CardBody } from "@heroui/card";
import CountUp from "react-countup";
import { Accordion, AccordionItem } from "@heroui/accordion";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "../styles/globals.css";
import SwiperComponent from "@/components/swiper-autoprogress";
import AvatarDropdown from "@/components/avatar";
export default function Home() {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const progressContent = useRef<HTMLSpanElement | null>(null);

  // Handle autoplay time left
  const onAutoplayTimeLeft = (s: any, time: number, progress: number) => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty("--progress", `${1 - progress}`);
    }
    if (progressContent.current) {
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    }
  };

  const faqs = [
    {
      question: "Apakah Rano Cake menerima pesanan custom?",
      answer:
        "Ya, kami menerima pesanan custom untuk berbagai jenis acara seperti ulang tahun, pernikahan, dan lainnya.",
    },
    {
      question: "Berapa lama waktu yang dibutuhkan untuk memproses pesanan?",
      answer:
        "Waktu pemrosesan tergantung jenis pesanan. Untuk pesanan biasa, rata-rata 1-2 hari kerja.",
    },
    {
      question: "Apakah tersedia pengiriman ke luar kota?",
      answer:
        "Saat ini kami melayani pengiriman dalam kota. Namun, Anda bisa menghubungi kami untuk diskusi lebih lanjut.",
    },
    {
      question: "Apakah bahan-bahan yang digunakan halal?",
      answer:
        "Ya, kami hanya menggunakan bahan-bahan yang 100% halal dan berkualitas tinggi.",
    },
  ];

  const stats = [
    { value: 5000, label: "Kue Terjual" },
    { value: 2000, label: "Pelanggan Puas" },
    { value: 6, label: "Tahun Pengalaman" },
  ];
  return (
    <>
      <div>
        <SwiperComponent />
      </div>

      <div className="my-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Rano Cake dalam Angka
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              shadow="lg"
              className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100"
            >
              <CardBody>
                <CountUp
                  end={stat.value}
                  duration={5}
                  className="text-4xl font-extrabold text-blue-500"
                />
                <p className="mt-2 text-lg font-medium">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className={`${title({ color: "blue" })} pt-8`}>
          Koleksi Rano Cake
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-8 gap-4 pb-8 my-2">
        <Link href="/katalog" passHref>
          <Kartu
            logoSrc={Choco}
            title={" "}
            subTitle={""}
            description={"kue ulang tahun"}
            logoClassName="justify-center"
            height={350}
            width={350}
            imageRadius="lg"
            fullWidth={true}
            textAlign="center"
            titleColor="violet"
            titleSize="lg"
          />
        </Link>

        <Link href="/katalog" passHref>
          <Kartu
            logoSrc={Choco}
            title={" "}
            subTitle={""}
            description={"kue kering"}
            logoClassName="justify-center"
            height={350}
            width={350}
            imageRadius="lg"
            fullWidth={true}
            textAlign="center"
            titleColor="violet"
            titleSize="lg"
          />
        </Link>

        <Link href="/katalog" passHref>
          <Kartu
            logoSrc={wkwkwkwk}
            title={" "}
            subTitle={""}
            description={"nasi dan asinan"}
            logoClassName="justify-center"
            height={350}
            width={350}
            imageRadius="lg"
            fullWidth={true}
            textAlign="center"
            titleColor="violet"
            titleSize="lg"
          />
        </Link>
      </div>
      <div className="my-16 max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          Informasi Seputar Rano Cake
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accordion Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Pertanyaan Seputar Rano Cake
            </h3>
            <Accordion className="pt-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  title={faq.question}
                  className="text-lg font-medium"
                >
                  <p className="text-gray-700">{faq.answer}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Map Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Alamat Kami</h3>
            <div className="w-full h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.540089412422!2d106.7894077!3d-6.1922350999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f7a9a67506cd%3A0xc1c3905fcbba6d0c!2sRano%20Cake!5e0!3m2!1sid!2sid!4v1732416949761!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-64 relative flex items-center justify-center">
        <Image
          src={jaja1}
          alt="jaja1"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            className={title({ color: "green" })}
            initial={{ opacity: 0, y: -50 }} // Initial state: invisible and above
            animate={{ opacity: 1, y: 0 }} // Animate to visible and normal position
            transition={{ duration: 0.5 }} // Duration of the animation
          >
            Apa Kata Mereka?
          </motion.h1>
        </div>
      </div>

      <div className="relative -mt-28 z-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
        <Kartu
          logoSrc="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          title="Nauval"
          subTitle="Pelanggan Setia Rano Cake"
          description="Saya merupakan pelanggan yang cukup sering memesan kue disini karena permintaan para tamu yang bilang kue nya lezat saya ingin merekomendasikan Rano cake pada semua orang karena memang enak dan bergizi"
          textAlign="justify"
          titleColor="black"
          titleSize="sm"
          fullWidth={true}
        />
        <Kartu
          logoSrc="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          title="Tina Salsabila"
          subTitle="Pelanggan Setia Rano Cake"
          description="Kue-kue dari Rano Cake selalu lezat dan finishingnya menawan. Pelayanan yang ramah dan responsif membuat saya selalu kembali untuk memesan kue di sini! oh iya pacakging nya juga bagus sekali"
          textAlign="justify"
          titleColor="black"
          titleSize="sm"
          fullWidth={true}
        />
        <Kartu
          logoSrc="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          title={"budi"}
          subTitle="Pelanggan Setia Rano Cake"
          description="Rano Cake benar-benar memahami kebutuhan pelanggannya. Setiap pesanan saya selalu tepat waktu dan sesuai dengan harapan. Terima kasih Rano Cake!"
          textAlign="justify"
          titleColor="black"
          fullWidth={true}
          titleSize="sm"
        />
      </div>
      <AvatarDropdown />
    </>
  );
}
