"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Nav from "@/components/nav";
import User from "@/components/user";
import { rolesCheck } from "@/app/utils/tools";
import { RiDashboard2Fill, RiDashboard2Line } from "react-icons/ri";
import { AiOutlineProduct } from "react-icons/ai";
import { BusinessProgressBarIcon } from "@/components/icon";
import { VscGithubProject } from "react-icons/vsc";
import { BsBank, BsHouseGear } from "react-icons/bs";
import { LuBookUser } from "react-icons/lu";
import { MdOutlineFactory } from "react-icons/md";
import { HiOutlineOfficeBuilding, HiOutlineUserGroup } from "react-icons/hi";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { LiaToolsSolid } from "react-icons/lia";
import { GoSignOut } from "react-icons/go";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const user = session.data?.user;
  const pathname = usePathname();
  const proyek = [
    {
      key: "data",
      name: "Proyek",
      href: "",
    },
    ...(rolesCheck(["admin", "super"], user?.peran)
      ? [
          {
            key: "pengeluaran",
            name: "Pengeluaran",
            href: "/pengeluaran",
          },
          {
            key: "pembayaran",
            name: "Pembayaran",
            href: "/pembayaran",
          },
        ]
      : []),
    // {
    //     key: "kategori",
    //     name: "Kategori",
    //     href: "/kategori"
    // },
  ];
  // if (user?.peran == "admin" || user?.peran == "super")
  //   proyek.push(
  //     {
  //       key: "pengeluaran",
  //       name: "Pengeluaran",
  //       href: "/pengeluaran",
  //     },
  //     {
  //       key: "pembayaran",
  //       name: "Pembayaran",
  //       href: "/pembayaran",
  //     }
  //   );
  const links = [
    { href: "/", name: "Dashboard", icon: <RiDashboard2Line /> },
    {
      href: "/aktivitas",
      name: "Aktivitas",
      icon: <BusinessProgressBarIcon />,
    },
    {
      href: "/produk",
      name: "Produk",
      icon: <AiOutlineProduct />,
      dropdown: [
        {
          key: "data",
          name: "Produk",
          href: "/produk",
        },
        {
          key: "merek",
          name: "Merek",
          href: "/produk/merek",
        },
        {
          key: "kategori",
          name: "Kategori",
          href: "/produk/kategori",
        },
      ],
    },
  ];
  // if (rolesCheck(["head-sales", "sales"], user?.peran))
  //   links.push({ href: "/proyek", name: "Proyek", dropdown: proyek });
  // if (rolesCheck(["admin", "super"], user?.peran))
  links.push({
    href: "/proyek",
    name: "Proyek",
    dropdown: proyek,
    icon: <VscGithubProject />,
  });
  if (user?.peran == "admin" || user?.peran == "super")
    links.push(
      // { href: "/nota", name: "Nota" },
      // { href: "/kwitansi", name: "Kwitansi" },
      {
        href: "/operasionalkantor",
        name: "Operasional Kantor",
        icon: <BsHouseGear />,
      }
    );
  links.push({ href: "/customer", name: "Customer", icon: <LuBookUser /> });
  if (rolesCheck(["admin", "super"], user?.peran))
    links.push(
      { href: "/vendor", name: "Vendor", icon: <MdOutlineFactory /> },
      { href: "/bank", name: "Bank", icon: <BsBank /> },
      {
        href: "/karyawan",
        name: "Karyawan",
        icon: <HiOutlineUserGroup />,
        dropdown: [
          {
            key: "data",
            name: "Data",
            href: "/karyawan",
          },
          {
            key: "status",
            name: "Status",
            href: "/karyawan/status",
          },
        ],
      },
      {
        href: "/laporan",
        name: "Laporan",
        icon: <TbDeviceDesktopAnalytics />,
        dropdown: [
          // {
          //     key: "labarugi",
          //     name: "Laba Rugi",
          //     href: "/labarugi"
          // },
          // {
          //     key: "proyekbulanan",
          //     name: "Proyek Bulanan",
          //     href: "/proyekbulanan"
          // },
          {
            key: "omset",
            name: "Omset",
            href: "/omset",
          },
          {
            key: "stok",
            name: "Stok",
            href: "/stok",
          },
          {
            key: "penawaran",
            name: "Penawaran",
            href: "/penawaran",
          },
        ],
      },
      {
        href: "/perusahaan",
        name: "Perusahaan",
        icon: <HiOutlineOfficeBuilding />,
      }
    );
  if (user?.peran == "super" || true)
    links.push({ href: "/user", name: "User", icon: <FaRegUser /> });
  if (user?.peran == "super")
    links.push({ href: "/alat", name: "Alat", icon: <LiaToolsSolid /> });
  links.push({
    href: "/api/auth/signout",
    name: "Signout",
    icon: <GoSignOut />,
  });
  return (
    <section className="flex flex-col gap-3 shrink-0">
      <div></div>
      <div className="grid grid-cols-2 py-2 mx-3 rounded-lg bg-background">
        <div className="basis-3/4-">
          <div className="p-3">ERP{pathname}</div>
        </div>
        {/* <div className="basis-1/4- flex flex-row-reverse"> */}
        <div className="text-right">
          <div className="px-3">
            <User user={session} />
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div></div>
        <div className="w-1/9-">
          <Nav navLinks={links} className={""} />
        </div>
        <div className="w-8/9- shrink-0-">{children}</div>
        <div></div>
      </div>
    </section>
  );
}
