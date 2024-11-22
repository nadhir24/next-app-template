// Home.tsx
"use client";

import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import NextUIButton from "@/components/button";
import { useState } from "react";
import wkwkwk from "@/public/wkwkwk.jpg";
import wkwkwkwk from "@/public/wkwkwkwk.jpg";
import Kartu from "@/components/card";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/button";
import { Toaster, toast } from "sonner";
import jaja1 from "@/public/jaja1.png";
import Choco from "@/public/choco.jpg";
import { motion } from "framer-motion";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <div className="grid-cols-2 bg-yellow-200 rounded-xl lg:grid-cols-2 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={title({ color: "red", size: "lg", fullWidth: true })}
        >
          selamat datang di Rano Cake
        </motion.div>

        <motion.span
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="box-decoration-clone bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-2"
        >
          selangkah lebih dekat
          <br />
          Terpercaya sejak 2018
          <br />
          menerima pesanan skala besar
        </motion.span>

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
    </>
  );
}
