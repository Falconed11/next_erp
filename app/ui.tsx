"use client";

// Reusable RunningText component
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaTools,
  FaUsers,
  FaClock,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaBars,
  FaTimes,
  FaCheckCircle,
  FaStar,
  FaChevronDown,
  FaTiktok,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
// import { motion } from "framer-motion"; // Uncomment if using Framer Motion
import type { User } from "./utils/user";
import { Button, Card, CardBody, Pagination, Tab, Tabs } from "@heroui/react";
import Image from "next/image";
import { highRoleCheck } from "./utils/tools";
import { IconType } from "react-icons";
type LandingPageProps = {
  user?: User | null;
};
// Editable: Company name and navigation links
const NAV_LINKS = [
  { label: "Beranda", href: "#hero" },
  { label: "Layanan", href: "#services" },
  { label: "Kenapa Kami", href: "#whyus" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Testimoni", href: "#testimonials" },
  { label: "Proses", href: "#process" },
  { label: "Kontak", href: "#contact" },
  { label: "ERP", href: "/dashboard" },
];

const SERVICES = [
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Satu",
    desc: "Deskripsi singkat untuk layanan satu.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Dua",
    desc: "Deskripsi singkat untuk layanan dua.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Tiga",
    desc: "Deskripsi singkat untuk layanan tiga.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Empat",
    desc: "Deskripsi singkat untuk layanan empat.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Lima",
    desc: "Deskripsi singkat untuk layanan lima.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Layanan Enam",
    desc: "Deskripsi singkat untuk layanan enam.",
  },
];

const FEATURES = [
  {
    icon: <FaUsers className="text-xl text-primary" />,
    title: "Tim Profesional",
  },
  {
    icon: <FaClock className="text-xl text-primary" />,
    title: "Instalasi Cepat",
  },
  {
    icon: <FaShieldAlt className="text-xl text-primary" />,
    title: "Garansi & Dukungan",
  },
  {
    icon: <FaCheckCircle className="text-xl text-primary" />,
    title: "Jaminan Kualitas",
  },
];

const PORTFOLIO_IMAGES = [
  "https://placehold.co/400x300?text=Project+1",
  "https://placehold.co/400x300?text=Project+2",
  "https://placehold.co/400x300?text=Project+3",
  "https://placehold.co/400x300?text=Project+4",
  "https://placehold.co/400x300?text=Project+5",
  "https://placehold.co/400x300?text=Project+6",
];

const TESTIMONIALS = [
  {
    name: "John Doe",
    avatar: "https://placehold.co/64x64",
    text: "Pelayanan sangat memuaskan dan profesional. Proses instalasi berjalan lancar.",
  },
  {
    name: "Jane Smith",
    avatar: "https://placehold.co/64x64",
    text: "Tim sangat responsif dan hasil pekerjaan rapi. Sangat direkomendasikan!",
  },
  {
    name: "Alex Johnson",
    avatar: "https://placehold.co/64x64",
    text: "Harga bersaing dan kualitas terbaik. Saya puas dengan hasilnya.",
  },
];

const PROCESS_STEPS = [
  { title: "Konsultasi", desc: "Diskusikan kebutuhan Anda dengan tim kami." },
  {
    title: "Perencanaan",
    desc: "Kami merancang rencana instalasi yang sesuai.",
  },
  { title: "Instalasi", desc: "Tim ahli kami melakukan instalasi." },
  { title: "Serah Terima", desc: "Penyelesaian proyek dan dukungan." },
];

const SOCIAL_MEDIA_ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  tiktok: FaTiktok,
};

export default function LandingPage({ user }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Responsive carousel width: wider on desktop
  const isClient = typeof window !== "undefined";
  const [carouselWidth, setCarouselWidth] = useState(600);
  const carouselHeight = 500;
  useEffect(() => {
    if (!isClient) return;
    function handleResize() {
      if (window.innerWidth >= 1536) {
        setCarouselWidth(1400);
      } else if (window.innerWidth >= 1280) {
        setCarouselWidth(1100);
      } else if (window.innerWidth >= 1024) {
        setCarouselWidth(900);
      } else {
        setCarouselWidth(600);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);
  const colorPagination = "primary";
  const IMAGES = [
    {
      src: "/sample-banner-2.png",
      alt: "Installation Service Hero",
    },
    {
      src: "/sample-banner.png", // Replace with your actual image path
      alt: "Installation Service Hero",
    },
    {
      src: `https://placehold.co/${carouselWidth}x${carouselHeight}?text=3+Image`,
      alt: "Installation Service Hero",
    },
  ];
  const IMAGES_LENGTH = IMAGES.length;
  const carouselInterval = 8 * 1000;
  useEffect(() => {
    // 1. Set up the interval
    const intervalId = setInterval(() => {
      // Always use the functional updater form when relying on previous state
      setCurrentPage((prev) => (prev < IMAGES_LENGTH ? prev + 1 : 1));
    }, carouselInterval);

    // 2. Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [currentPage]); // Empty dependency array ensures this runs only once on mount

  // Navigation handler: smooth scroll for hash, router for internal path
  const router = useRouter();
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setMenuOpen(false);
    if (href.startsWith("/")) {
      router.push(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const isHighRole = highRoleCheck(user?.peran);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        {/* Sticky Navbar */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all w-full">
          <nav className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Logo image, replace src with your own */}
              <span className="inline-block w-8 h-8 mr-1">
                <Image
                  src="https://placehold.co/40x40?text=Logo"
                  alt="InstallCo Logo"
                  width={40}
                  height={40}
                  className="object-contain w-8 h-8"
                  unoptimized
                />
              </span>
              <span className="font-bold text-xl text-primary">InstallCo</span>
            </div>
            <div className="hidden md:flex gap-6">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-700 dark:text-gray-200 hover:text-primary transition-colors font-medium cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <button
              className="md:hidden p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            {/* Dark/Light mode toggle */}
            <button
              className="cursor-pointer ml-4 p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              <span className="sr-only">Toggle dark mode</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12H3m15.07 6.07l-.71-.71M6.34 6.34l-.71-.71m12.02 0l-.71.71M6.34 17.66l-.71.71" />
                <circle cx="12" cy="12" r="5" />
              </svg>
            </button>
          </nav>
          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 animate-fade-in-down">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </header>

        {/* Running text after header */}
        <RunningText
          text="⚠️ Laman sedang dalam proses perbaikan ... ⚠️"
          speed={80}
          color="#eab308"
          stopOnHover={true}
        />

        {/* Hero Section */}
        <section
          id="hero"
          className="flex flex-col-reverse md:flex-row items-center justify-between- w-full px-4 py-4 gap-8-"
        >
          <div className="flex-1 flex flex-col gap-6">
            {/* Editable: Headline, description, CTA */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Jasa Instalasi Profesional
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Kami menyediakan layanan instalasi profesional untuk berbagai
              kebutuhan Anda. Kepuasan dan kualitas adalah prioritas kami.
            </p>
            <div className="flex gap-4 mt-2">
              <Button
                size="lg"
                color="primary"
                onPress={() => {
                  document.querySelector("#contact")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Dapatkan Penawaran
              </Button>
              <Button
                size="lg"
                color="primary"
                variant="bordered"
                onPress={() => {
                  document.querySelector("#services")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Layanan Kami
              </Button>
            </div>
          </div>
          <div className="flex-1 md:flex sm:flex sm:flex-col sm:gap-2 justify-center items-center h-100 relative overflow-hidden">
            {" "}
            {/* 👈 Added overflow-hidden */}
            {/* Carousel Track */}
            <div
              className="flex transition-transform duration-500 gap-2- ease-in-out w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
              style={{
                transform: `translateX(-${(currentPage - 1) * 100}%)`,
                maxWidth: carouselWidth,
              }}
            >
              {IMAGES.map((img, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  <div
                    className="rounded-xl shadow-lg w-full h-full flex items-center justify-center bg-white dark:bg-gray-900"
                    style={{
                      maxWidth: carouselWidth,
                      maxHeight: carouselHeight,
                      aspectRatio: `${carouselWidth} / ${carouselHeight}`,
                    }}
                  >
                    <Image
                      unoptimized
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-contain"
                      width={carouselWidth}
                      height={carouselHeight}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Controls Container */}
            <div className="flex items-center justify-between w-full md:absolute md:bottom-4 md:left-0 px-4 md:opacity-30 hover:opacity-100 transition-opacity z-10">
              <Button
                color={colorPagination}
                size="sm"
                variant="flat"
                onPress={() =>
                  setCurrentPage((prev) =>
                    prev > 1 ? prev - 1 : IMAGES_LENGTH,
                  )
                }
                aria-label="Sebelumnya"
                className="rounded-full"
              >
                <FaChevronLeft size={20} />
              </Button>
              <Pagination
                className="cursor-pointer"
                color={colorPagination}
                page={currentPage}
                total={IMAGES_LENGTH}
                onChange={setCurrentPage}
              />
              <Button
                color={colorPagination}
                size="sm"
                variant="flat"
                onPress={() =>
                  setCurrentPage((prev) =>
                    prev < IMAGES_LENGTH ? prev + 1 : 1,
                  )
                }
                aria-label="Berikutnya"
                className="rounded-full"
              >
                <FaChevronRight size={20} />
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Layanan Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
              >
                <div className="mb-4">{service.icon}</div>
                {/* Editable: Service title and description */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="whyus" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Kenapa Memilih Kami
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 min-w-[220px] animate-fade-in-up"
              >
                {/* {feature.icon} */}
                {/* Editable: Feature title */}
                <span className="text-lg font-medium re text-gray-900 dark:text-white">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Proyek Kami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {PORTFOLIO_IMAGES.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 animate-fade-in-up"
              >
                {/* Editable: Portfolio image */}
                <img
                  src={img}
                  alt={`Project ${i + 1}`}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-lg font-semibold">
                    Proyek {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Testimoni
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center animate-fade-in-up"
              >
                {/* Editable: Avatar and name */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {t.text}
                </p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <FaStar key={j} className="text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Cara Kerja Kami
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center relative animate-fade-in-up"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full text-xl font-bold mb-2 shadow-lg">
                  {i + 1}
                </div>
                {/* Editable: Step title and description */}
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h5>
                <p className="text-gray-600 dark:text-gray-300 mb-2 max-w-xs">
                  {step.desc}
                </p>
                {i < PROCESS_STEPS.length - 1 && (
                  <FaChevronDown className="hidden md:block absolute right-[-32px] top-1/2 -translate-y-1/2 text-primary text-2xl" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full px-4 py-16">
          <div className="bg-primary rounded-xl shadow-lg p-10 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up">
            <div className="flex-1">
              {/* Editable: CTA Banner text */}
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Siap memulai instalasi Anda?
              </h3>
              <p className="text-white text-lg">
                Hubungi kami hari ini untuk konsultasi dan penawaran gratis.
              </p>
            </div>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold shadow hover:bg-primary/10 transition"
            >
              Hubungi Kami
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="bg-gray-900 text-gray-200 py-10 mt-10 w-full"
        >
          <div className="w-full px-4 flex flex-col md:flex-row justify-between gap-8">
            <div>
              {/* Editable: Company info */}
              <h4 className="text-xl font-bold mb-2">InstallCo</h4>
              <p className="text-gray-400 mb-2">Jl. Utama 1234, Kota, Negara</p>
              <div className="flex items-center gap-2 mb-2">
                <FaPhone className="text-primary" /> <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaEnvelope className="text-primary" />{" "}
                <span>info@installco.com</span>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Navigasi</h5>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Ikuti Kami</h5>
              <div className="flex gap-4">
                {[
                  { href: "#", site: "facebook" },
                  { href: "#", site: "twitter" },
                  { href: "#", site: "instagram" },
                  { href: "#", site: "tiktok" },
                ].map(({ href, site }, i) => {
                  const Icon = SOCIAL_MEDIA_ICONS[site];
                  return (
                    <a
                      key={i}
                      href={href}
                      className="hover:text-primary transition-colors"
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Kontak</h5>
              <form className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                />
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                />
                <textarea
                  placeholder="Pesan Anda"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                  rows={2}
                ></textarea>
                <button
                  type="submit"
                  className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark transition"
                >
                  Kirim
                </button>
              </form>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-8 text-sm">
            © {new Date().getFullYear()} InstallCo. Seluruh hak cipta
            dilindungi.
          </div>
        </footer>
      </div>
      {/* Tailwind custom color example: add to tailwind.config.js
      theme: {
        extend: {
          colors: {
            primary: '#2563eb',
            'primary-dark': '#1e40af',
          },
        },
      },
      */}
    </div>
  );
}

type RunningTextProps = {
  text: string;
  speed?: number; // pixels per second
  color?: string;
  stopOnHover?: boolean;
  className?: string;
};

export function RunningText({
  text,
  speed = 80, // default 80px/s
  color = "#2563eb",
  stopOnHover = false,
  className = "",
}: RunningTextProps) {
  const [isPaused, setIsPaused] = React.useState(false);
  const textRef = React.useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = React.useState(0);

  React.useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [text]);

  // Animation duration based on text width and speed
  const duration = textWidth > 0 ? textWidth / speed : 10;

  return (
    <div
      className={`overflow-hidden w-full bg-white dark:bg-gray-900 border-b border-primary/20 ${className}`}
      style={{ height: 36 }}
      onMouseEnter={() => stopOnHover && setIsPaused(true)}
      onMouseLeave={() => stopOnHover && setIsPaused(false)}
    >
      <div
        ref={textRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          color,
          fontWeight: 600,
          fontSize: 18,
          paddingLeft: "100%",
          animationName: "running-text",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {text}
      </div>
      <style jsx>{`
        @keyframes running-text {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
