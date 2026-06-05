import { highRoles } from "@/app/utils/roles";
import { RiDashboard2Line } from "react-icons/ri";
import { AiOutlineProduct } from "react-icons/ai";
import { BusinessProgressBarIcon } from "@/components/icon";
import { VscGithubProject } from "react-icons/vsc";
import { BsBank, BsHouseGear, BsJournal } from "react-icons/bs";
import { LuBookUser } from "react-icons/lu";
import { MdOutlineAccountTree, MdOutlineFactory } from "react-icons/md";
import { HiOutlineOfficeBuilding, HiOutlineUserGroup } from "react-icons/hi";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { LiaToolsSolid } from "react-icons/lia";
import { getUser } from "../utils/user";
import MainNav from "./main-nav";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    // Redirect to login or show loading
    return <div>Please log in</div>;
  }
  const isHighRole = highRoles.includes(user.peran);
  const links = [
    { href: "/dashboard", name: "Dashboard", icon: <RiDashboard2Line /> },
    // aktivitas
    {
      href: "/aktivitas",
      name: "Aktivitas",
      icon: <BusinessProgressBarIcon />,
    },
    // produk
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
    // proyek
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
              ...(highRoles.includes(user.peran)
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
    // operasional kantor
    ...(highRoles.includes(user.peran)
      ? [
          {
            href: "/operasionalkantor",
            name: "Operasional Kantor",
            icon: <BsHouseGear />,
          },
        ]
      : []),
    // customer
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
    // vendor, bank, karyawan, coa, transaksi, laporan, perusahaan
    ...([...highRoles, "admin"].includes(user.peran)
      ? [
          // vendor
          {
            href: "/vendor",
            name: "Vendor",
            icon: <MdOutlineFactory />,
            dropdown: [
              { key: "data", name: "Vendor" },
              { key: "vendor-jenis", name: "Vendor Jenis" },
            ],
          },
          // bank
          {
            href: "/bank",
            name: "Bank",
            icon: <BsBank />,
            ...(["super", "owner", "admin"].includes(user.peran)
              ? {
                  dropdown: [
                    { key: "data", name: "Bank" },
                    { key: "transfer-bank", name: "Transfer Bank" },
                  ],
                }
              : {}),
          },
          // karyawan
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
          // coa
          {
            href: "/coa",
            name: "COA",
            icon: <MdOutlineAccountTree />,
            dropdown: [
              {
                key: "coa-type",
                name: "COA Type",
              },
              {
                key: "coa-subtype",
                name: "COA Sub Type",
              },
              {
                key: "data",
                name: "COA",
              },
              {
                key: "coa-filter",
                name: "COA Filter",
              },
              {
                key: "laporan-relation",
                name: "Laporan Relation",
              },
              ...(user.peran == "super"
                ? [
                    {
                      key: "peristiwa",
                      name: "Peristiwa",
                    },
                    {
                      key: "peristiwa-coa-map",
                      name: "Peristiwa COA Map",
                    },
                  ]
                : []),
            ],
          },
          // transaksi
          {
            href: "/transaksi",
            name: "Transaksi",
            icon: <BsJournal />,
          },
          // laporan
          {
            href: "/laporan",
            name: "Laporan",
            icon: <TbDeviceDesktopAnalytics />,
            dropdown: [
              {
                key: "data",
                name: "Laporan Keuangan",
              },
              {
                key: "laporan",
                name: "Template Laporan Keuangan",
              },
              ...([...highRoles, "admin"].includes(user.peran)
                ? [
                    {
                      key: "biaya-produksi",
                      name: "Biaya Produksi",
                    },
                    {
                      key: "proyek",
                      name: "Proyek",
                    },
                    // {
                    //   key: "operasional-kantor",
                    //   name: "Operasional Kantor",
                    // },
                    // {
                    //   key: "labarugi",
                    //   name: "Laba Rugi",
                    // },
                    // {
                    //   key: "perubahan-modal",
                    //   name: "Perubahan Modal",
                    // },
                  ]
                : []),
              // {
              //   key: "omset",
              //   name: "Omset",
              // },
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
          // perusahaan
          {
            href: "/perusahaan",
            name: "Perusahaan",
            icon: <HiOutlineOfficeBuilding />,
          },
        ]
      : []),
    // user, alat
    ...(user.peran == "super"
      ? [
          { href: "/user", name: "User", icon: <FaRegUser /> },
          { href: "/alat", name: "Alat", icon: <LiaToolsSolid /> },
        ]
      : []),
  ];
  return (
    <MainNav links={links} user={user}>
      {children}
    </MainNav>
  );
}
