// Home.tsx
"use client";

import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import wkwkwkwk from "@/public/wkwkwkwk.jpg";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import { Button } from "@heroui/button";
import {
  ArrowUp,
  Star,
  Cake,
  Users,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jaja1 from "@/public/jaja1.png";
import Choco from "@/public/choco.jpg";
import { Card, CardBody } from "@nextui-org/card";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../styles/globals.css";
import SwiperComponent from "@/components/swiper-autoprogress";
import { Badge } from "@nextui-org/badge";
import { Skeleton } from "@nextui-org/skeleton";
import { Icon } from "@iconify/react";
import Tombol from "@/components/button";
export default function Home() {
  const progressCircle = useRef<SVGSVGElement | null>(null);
  const progressContent = useRef<HTMLSpanElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false); // State untuk tombol
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Simulasi loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const products = [
    {
      image: Choco,
      title: "Kue Ulang Tahun",
      subTitle: "Spesial",
      description:
        "Kue ulang tahun custom dengan desain menarik dan rasa yang lezat",
      badge: "Best Seller",
      badgeColor: "success" as const,
    },
    {
      image: Choco,
      title: "Kue Kering",
      subTitle: "Homemade",
      description: "Kue kering renyah dan lezat, perfect untuk oleh-oleh",
      badge: "New",
      badgeColor: "warning" as const,
    },
    {
      image: wkwkwkwk,
      title: "Nasi & Asinan",
      subTitle: "Fresh",
      description: "Menu nasi dan asinan segar untuk acara Anda",
      badge: "Popular",
      badgeColor: "primary" as const,
    },
  ];
  const router = useRouter();
  const handleClick = () => {
    setIsButtonLoading(true);
    setTimeout(() => {
      router.push("/katalog");
      setIsButtonLoading(false);
    }, 1000);
  };

  return (
    <>
  <div className="justify-center items-center">
        <div className="text-center shadow-2xl p-8 rounded-xl">
          {isLoading ? (
            // Skeleton untuk hero section
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 mx-auto rounded-lg" />
              <Skeleton className="h-8 w-2/4 mx-auto rounded-lg" />
              <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
            </div>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-6xl font-bold mb-4"
              >
                Rano Cake
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl mb-8"
              >
                Kue Lezat untuk Setiap Momen Spesial
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center"
              >
                {/* Tombol dengan loading state terpisah */}
                <Tombol
                  size="lg"
                  color="default"
                  variant="ghost"
                  radius="lg"
                  startContent={<ShoppingCart size={20} />}
                  label={isButtonLoading ? "Loading..." : "Pesan Sekarang"}
                  isLoading={isButtonLoading}
                  onPress={handleClick}
                />
              </motion.div>
            </>
          )}
        </div>
      </div>
      <SwiperComponent />
      <div className="my-16 bg-gradient-to-b from-pink-50 via-purple-50 to-white py-12 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-900 font-serif">
          Rano Cake dalam Angka
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 rounded-xl">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="p-8 text-center">
                    <CardBody>
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-32 rounded-lg mx-auto" />
                        <Skeleton className="h-6 w-24 rounded-lg mx-auto" />
                      </div>
                    </CardBody>
                  </Card>
                ))
            : stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    shadow="lg"
                    className="p-8 text-center bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 rounded-xl"
                  >
                    <CardBody>
                      <div className="flex justify-center mb-4">
                        {index === 0 && (
                          <Cake className="w-12 h-12 text-purple-500" />
                        )}
                        {index === 1 && (
                          <Users className="w-12 h-12 text-purple-500" />
                        )}
                        {index === 2 && (
                          <Calendar className="w-12 h-12 text-purple-500" />
                        )}
                      </div>
                      {isLoading ? (
                        <Skeleton className="w-32 h-12 mx-auto" />
                      ) : (
                        <CountUp
                          end={stat.value}
                          duration={5}
                          className="text-5xl font-extrabold text-purple-600"
                        />
                      )}
                      <p className="mt-4 text-xl font-medium text-gray-700">
                        {stat.label}
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 py-16 rounded-xl shadow-lg">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <h1 className={`${title({ color: "pink" })} pt-8 font-serif`}>
            Koleksi Rano Cake
          </h1>
          <p className={`${subtitle()} mt-2 text-gray-600`}>
            Temukan berbagai pilihan kue lezat untuk setiap momen spesial Anda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-8 gap-8 pb-8 my-8 rounded-xl">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="w-full">
                    <CardBody className="p-0">
                      <Skeleton className="rounded-lg w-full h-[350px]" />
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                    </CardBody>
                  </Card>
                ))
            : products.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    shadow="lg"
                    className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 bg-white/90 backdrop-blur-sm rounded-xl"
                  >
                    <CardBody className="p-0">
                      <div className="relative">
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={350}
                          height={350}
                          className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge
                          color={product.badgeColor}
                          className="absolute top-4 right-4"
                        >
                          {product.badge}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.subTitle}
                        </p>
                        <p className="text-gray-700 mb-4">
                          {product.description}
                        </p>
                        <Button
                          color="primary"
                          variant="shadow"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Tambah ke Keranjang
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
        </div>
      </div>

      <div className="my-16 max-w-7xl mx-auto px-4 bg-gradient-to-b from-purple-50 to-pink-50 py-12 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-900 font-serif">
          Informasi Seputar Rano Cake
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h3 className="text-2xl font-semibold mb-6 text-purple-800">
              Pertanyaan Seputar Rano Cake
            </h3>
            <Accordion
              className="pt-4"
              variant="bordered"
              itemClasses={{
                title: "text-lg font-medium text-purple-900",
                content: "text-gray-700",
                trigger: "px-4 py-3 hover:bg-purple-50",
                indicator: "text-purple-600",
              }}
            >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <h3 className="text-2xl font-semibold mb-6 text-purple-800">
              Alamat Kami
            </h3>
            <div className="w-full h-full duration-300">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.540089412422!2d106.7894077!3d-6.1922350999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f7a9a67506cd%3A0xc1c3905fcbba6d0c!2sRano%20Cake!5e0!3m2!1sid!2sid!4v1732416949761!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full h-80 relative flex items-center justify-center rounded-xl overflow-hidden">
        <Image src={jaja1} alt="jaja1" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            className={title({ color: "pink" })}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Apa Kata Mereka?
          </motion.h1>
        </div>
      </div>

      <div className="relative -mt-28 z-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 px-4">
        {[
          {
            name: "Nauval",
            role: "Pelanggan Setia Rano Cake",
            image: "https://avatars.githubusercontent.com/u/86160567?s=200&v=4",
            rating: 5,
            text: "Saya merupakan pelanggan yang cukup sering memesan kue disini karena permintaan para tamu yang bilang kue nya lezat saya ingin merekomendasikan Rano cake pada semua orang karena memang enak dan bergizi",
          },
          {
            name: "Tina Salsabila",
            role: "Pelanggan Setia Rano Cake",
            image: "https://avatars.githubusercontent.com/u/86160567?s=200&v=4",
            rating: 5,
            text: "Kue-kue dari Rano Cake selalu lezat dan finishingnya menawan. Pelayanan yang ramah dan responsif membuat saya selalu kembali untuk memesan kue di sini! oh iya pacakging nya juga bagus sekali",
          },
          {
            name: "Budi",
            role: "Pelanggan Setia Rano Cake",
            image: "https://avatars.githubusercontent.com/u/86160567?s=200&v=4",
            rating: 5,
            text: "Rano Cake benar-benar memahami kebutuhan pelanggannya. Setiap pesanan saya selalu tepat waktu dan sesuai dengan harapan. Terima kasih Rano Cake!",
          },
        ].map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card
              shadow="lg"
              className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 rounded-xl"
            >
              <CardBody>
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-purple-900">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm">{testimonial.text}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              isIconOnly
              color="primary"
              variant="shadow"
              className="rounded-full w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onPress={scrollToTop}
            >
              <ArrowUp className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
