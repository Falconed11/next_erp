"use client";

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
} from "react-icons/fa";
// import { motion } from "framer-motion"; // Uncomment if using Framer Motion

// Editable: Company name and navigation links
const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#whyus" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
  { label: "ERP", href: "/dashboard" },
];

const SERVICES = [
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service One",
    desc: "Short dummy description for service one.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service Two",
    desc: "Short dummy description for service two.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service Three",
    desc: "Short dummy description for service three.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service Four",
    desc: "Short dummy description for service four.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service Five",
    desc: "Short dummy description for service five.",
  },
  {
    icon: <FaTools className="text-3xl text-primary" />,
    title: "Service Six",
    desc: "Short dummy description for service six.",
  },
];

const FEATURES = [
  {
    icon: <FaUsers className="text-xl text-primary" />,
    title: "Professional Team",
  },
  {
    icon: <FaClock className="text-xl text-primary" />,
    title: "Fast Installation",
  },
  {
    icon: <FaShieldAlt className="text-xl text-primary" />,
    title: "Warranty & Support",
  },
  {
    icon: <FaCheckCircle className="text-xl text-primary" />,
    title: "Quality Assurance",
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
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac neque nec urna.",
  },
  {
    name: "Jane Smith",
    avatar: "https://placehold.co/64x64",
    text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    name: "Alex Johnson",
    avatar: "https://placehold.co/64x64",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
  },
];

const PROCESS_STEPS = [
  { title: "Consultation", desc: "Discuss your needs with our team." },
  { title: "Planning", desc: "We design a tailored installation plan." },
  { title: "Installation", desc: "Our experts perform the installation." },
  { title: "Handover", desc: "Project completion and support." },
];

const SOCIAL_MEDIA_ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  tiktok: FaTiktok,
};

import type { User } from "./utils/user";
import { Button, Card, CardBody, Pagination, Tab, Tabs } from "@heroui/react";
import Image from "next/image";
import { highRoleCheck } from "./utils/tools";
import { IconType } from "react-icons";
type LandingPageProps = {
  user?: User | null;
};

export default function LandingPage({ user }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const carouselWidth = 900; // Adjust based on your design
  const carouselHeight = 600; // Adjust based on your design
  const colorPagination = "primary";
  const IMAGES = [
    {
      src: `https://placehold.co/${carouselWidth}x${carouselHeight}?text=1+Image`,
      alt: "Installation Service Hero",
    },
    {
      src: `https://placehold.co/${carouselWidth}x${carouselHeight}?text=2+Image`,
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
              {/* Editable: Company Logo/Name */}
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
              className="md:hidden p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            {/* Dark/Light mode toggle */}
            <button
              className="ml-4 p-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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

        {/* Hero Section */}
        <section
          id="hero"
          className="flex flex-col-reverse md:flex-row items-center justify-between- w-full px-4 py-4 gap-8"
        >
          <div className="flex-1 flex flex-col gap-6">
            {/* Editable: Headline, description, CTA */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Professional Installation Services
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque efficitur, urna eu facilisis.
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
                Get a Quote
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
                Our Services
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center h-100 relative overflow-hidden">
            {" "}
            {/* 👈 Added overflow-hidden */}
            {/* Carousel Track */}
            <div
              className="flex transition-transform duration-500 gap-2- ease-in-out w-full max-w-md"
              style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }} // 👈 Moves the track left/right
            >
              {IMAGES.map((img, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 flex justify-center"
                >
                  <Image
                    unoptimized
                    src={img.src}
                    alt={img.alt}
                    className="rounded-xl shadow-lg w-full object-cover"
                    width={carouselWidth}
                    height={carouselHeight}
                  />
                </div>
              ))}
            </div>
            {/* Controls Container */}
            <div className="flex gap-5 absolute bottom-4 opacity-50 hover:opacity-100 transition-opacity z-10">
              <div>
                <Button
                  color={colorPagination}
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setCurrentPage((prev) =>
                      prev > 1 ? prev - 1 : IMAGES_LENGTH,
                    )
                  }
                >
                  Previous
                </Button>
              </div>
              <Pagination
                color={colorPagination}
                page={currentPage}
                total={IMAGES_LENGTH}
                onChange={setCurrentPage}
              />
              <div>
                <Button
                  color={colorPagination}
                  size="sm"
                  variant="flat"
                  onPress={() =>
                    setCurrentPage((prev) =>
                      prev < IMAGES_LENGTH ? prev + 1 : 1,
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Our Services
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
            Why Choose Us
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
            Our Projects
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
                    Project {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full px-4 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Testimonials
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
            How It Works
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
                Ready to start your installation?
              </h3>
              <p className="text-white text-lg">
                Contact us today for a free consultation and quote.
              </p>
            </div>
            <a
              href="#contact"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold shadow hover:bg-primary/10 transition"
            >
              Contact Us
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
              <p className="text-gray-400 mb-2">1234 Main St, City, Country</p>
              <div className="flex items-center gap-2 mb-2">
                <FaPhone className="text-primary" /> <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaEnvelope className="text-primary" />{" "}
                <span>info@installco.com</span>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Navigation</h5>
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
              <h5 className="font-semibold mb-2">Follow Us</h5>
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
              <h5 className="font-semibold mb-2">Contact</h5>
              <form className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                />
                <textarea
                  placeholder="Your Message"
                  className="px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
                  rows={2}
                ></textarea>
                <button
                  type="submit"
                  className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-8 text-sm">
            © {new Date().getFullYear()} InstallCo. All rights reserved.
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
      {/* Animations: add to globals.css
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.7s cubic-bezier(0.4,0,0.2,1) both;
      }
      @keyframes fade-in {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 1s cubic-bezier(0.4,0,0.2,1) both;
      }
      @keyframes fade-in-down {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-down {
        animation: fade-in-down 0.5s cubic-bezier(0.4,0,0.2,1) both;
      }
      */}
    </div>
  );
}
