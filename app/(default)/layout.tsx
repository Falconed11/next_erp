"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Nav from "@/components/nav";
import User from "@/components/user";
import {
  highRoleCheck,
  renderQueryStates,
  rolesCheck,
} from "@/app/utils/tools";
import { highRoles } from "@/app/utils/roles";
import { RiDashboard2Line } from "react-icons/ri";
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
import { Spinner } from "@heroui/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const sessUser = session?.data?.user;
  const pathname = usePathname();

  const queryState = renderQueryStates({}, session);
  if (queryState) return <div className="p-3 w-screen">{queryState}</div>;
  const isHighRole = highRoleCheck(sessUser?.rank);
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
        },
        {
          key: "merek",
          name: "Merek",
        },
        {
          key: "kategori",
          name: "Kategori",
        },
      ],
    },
    {
      href: "/proyek",
      name: "Proyek",
      ...(isHighRole
        ? {
            dropdown: [
              {
                key: "data",
                name: "Proyek",
                href: "",
              },
              ...(rolesCheck(["admin", "super"], sessUser?.peran)
                ? [
                    {
                      key: "jenisproyek",
                      name: "Jenis Proyek",
                      href: "/jenisproyek",
                    },
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
            ],
          }
        : {}),
      icon: <VscGithubProject />,
    },
    ...(rolesCheck(highRoles, sessUser?.peran)
      ? [
          {
            href: "/operasionalkantor",
            name: "Operasional Kantor",
            icon: <BsHouseGear />,
          },
        ]
      : []),
    {
      href: "/customer",
      name: "Customer",
      icon: <LuBookUser />,
      ...(isHighRole
        ? {
            dropdown: [
              {
                key: "data",
                name: "Customer",
              },
              {
                key: "jenis-instansi",
                name: "Jenis Instansi",
              },
              {
                key: "golongan-instansi",
                name: "Golongan Instansi",
              },
            ],
          }
        : {}),
    },
    ...(rolesCheck([...highRoles, "admin"], sessUser?.peran)
      ? [
          {
            href: "/vendor",
            name: "Vendor",
            icon: <MdOutlineFactory />,
          },
          {
            href: "/bank",
            name: "Bank",
            icon: <BsBank />,
            ...(isHighRole
              ? {
                  dropdown: [
                    { key: "data", name: "Bank" },
                    { key: "transfer-bank", name: "Transfer Bank" },
                  ],
                }
              : {}),
          },
          {
            href: "/karyawan",
            name: "Karyawan",
            icon: <HiOutlineUserGroup />,
            dropdown: [
              {
                key: "data",
                name: "Data",
              },
              {
                key: "status",
                name: "Status",
              },
            ],
          },
          {
            href: "/coa",
            name: "COA",
            icon: <TbDeviceDesktopAnalytics />,
            dropdown: [
              {
                key: "data",
                name: "COA",
              },
              {
                key: "coa-type",
                name: "COA Type",
              },
              {
                key: "coa-filter",
                name: "COA Filter",
              },
              {
                key: "coa-subtype",
                name: "COA Sub Type",
              },
              {
                key: "peristiwa",
                name: "Peristiwa",
              },
              {
                key: "peristiwa-coa-map",
                name: "Peristiwa COA Map",
              },
            ],
          },
          {
            href: "/transaksi",
            name: "Transaksi",
            icon: <TbDeviceDesktopAnalytics />,
          },
          {
            href: "/laporan",
            name: "Laporan",
            icon: <TbDeviceDesktopAnalytics />,
            dropdown: [
              {
                key: "data",
                name: "Laporan",
              },
              {
                key: "laporan",
                name: "Template",
              },
              {
                key: "biaya-produksi",
                name: "Biaya Produksi",
              },
              {
                key: "proyek",
                name: "Proyek",
              },
              {
                key: "operasional-kantor",
                name: "Operasional Kantor",
              },
              {
                key: "labarugi",
                name: "Laba Rugi",
              },
              {
                key: "perubahan-modal",
                name: "Perubahan Modal",
              },
              {
                key: "omset",
                name: "Omset",
              },
              {
                key: "stok",
                name: "Stok",
              },
              {
                key: "penawaran",
                name: "Penawaran",
              },
            ],
          },
          {
            href: "/perusahaan",
            name: "Perusahaan",
            icon: <HiOutlineOfficeBuilding />,
          },
        ]
      : []),
    ...(rolesCheck(["super"], sessUser?.peran)
      ? [
          { href: "/user", name: "User", icon: <FaRegUser /> },
          { href: "/alat", name: "Alat", icon: <LiaToolsSolid /> },
        ]
      : []),
  ];
  return (
    <section className="inline-flex- flex flex-col gap-3">
      <div></div>
      <div className="bg-black- w-screen sticky left-0">
        <div className="bg-red-500- mx-3">
          <div className="grid grid-cols-2 py-2 mr-3 rounded-lg bg-background ">
            <div className="basis-3/4-">
              <div className="p-3 font-bold text-xl">
                ERP{pathname != "/" && pathname}
              </div>
            </div>
            {/* <div className="basis-1/4- flex flex-row-reverse"> */}
            <div className="text-right">
              <div className="px-3">
                <User user={session} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div></div>
        <div className={"sticky top-3"}>
          <Nav navLinks={links} className="" />
        </div>
        <div className="w-8/9- shrink-0-">
          {session.status == "loading" ? (
            <Spinner />
          ) : session ? (
            children
          ) : (
            "Login Needed!"
          )}
        </div>
        <div></div>
      </div>
    </section>
  );
}
