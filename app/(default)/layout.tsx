"use client"
import { usePathname } from "next/navigation";
import { useSession } from 'next-auth/react'
import Nav from '../../components/nav'
import User from '../../components/user'

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    const session = useSession()
    const user = session.data?.user
    const pathname = usePathname();
    const proyek = [{
        key: "data",
        name: "Proyek",
        href: ""
    },
        // {
        //     key: "kategori",
        //     name: "Kategori",
        //     href: "/kategori"
        // },
    ];
    if (user?.peran == 'admin' || user?.peran == 'super') proyek.push({
        key: "pengeluaran",
        name: "Pengeluaran",
        href: "/pengeluaran"
    },
        {
            key: "pembayaran",
            name: "Pembayaran",
            href: "/pembayaran"
        },)
    const links = [
        { href: "/", name: "Dashboard" },
        // { href: "/produk", name: "Produk" },
        {
            href: "/produk", name: "Produk", dropdown: [
                {
                    key: "data",
                    name: "Produk",
                    href: "/produk"
                },
                {
                    key: "merek",
                    name: "Merek",
                    href: "/produk/merek"
                },
                {
                    key: "kategori",
                    name: "Kategori",
                    href: "/produk/kategori"
                },
                // {
                //     key: "subkategori",
                //     name: "Sub Kategori",
                //     href: "/produk/subkategori"
                // },
            ]
        },
        // { href: "/stok", name: "Stok" },
        // {
        //     href: "/proyek", name: "Proyek", dropdown: proyek
        // },
        // {
        //     href: "/karyawan", name: "Karyawan", dropdown: [
        //         {
        //             key: "data",
        //             name: "Data",
        //             href: "/karyawan"
        //         },
        //         {
        //             key: "neraca",
        //             name: "Neraca",
        //             href: "/karyawan/neraca"
        //         },
        //         {
        //             key: "pengeluaran",
        //             name: "Pengeluaran",
        //             href: "/karyawan/pengeluaran"
        //         },
        //         {
        //             key: "lembur",
        //             name: "Lembur",
        //             href: "/karyawan/lembur"
        //         },
        //     ]
        // },
        // {
        //     href: "/perusahaan", name: "Perusahaan", dropdown: [
        //         {
        //             key: "pengeluaran",
        //             name: "Pengeluaran",
        //             href: "/perusahaan/pengeluaran"
        //         },
        //         {
        //             key: "pemasukan",
        //             name: "Pemasukan",
        //             href: "/perusahaan/pemasukan"
        //         },
        //     ]
        // },
        // { href: "/distributor", name: "Distributor" },
        // { href: "/klien", name: "Klien" },
        // { href: "/gudang", name: "Gudang" },
    ]
    if (user?.peran == 'sales') links.push({ href: "/proyek", name: "Proyek" })
    if (user?.peran == 'admin' || user?.peran == 'super') links.push({ href: "/proyek", name: "Proyek", dropdown: proyek })
    if (user?.peran == "admin" || user?.peran == "super") links.push({ href: "/nota", name: "Nota" },
        { href: "/kwitansi", name: "Kwitansi" },
        { href: "/operasionalkantor", name: "Operasional Kantor" },)
    links.push({ href: "/customer", name: "Customer" },)
    if (user?.peran == "admin" || user?.peran == "super") links.push(
        { href: "/vendor", name: "Vendor" },
        { href: "/bank", name: "Bank" },
        { href: "/karyawan", name: "Karyawan" },
        {
            href: "/laporan", name: "Laporan", dropdown: [
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
                    href: "/omset"
                },
                {
                    key: "produkmasuk",
                    name: "Produk Masuk",
                    href: "/produkmasuk"
                },
            ]
        },)
    if (user?.peran == "super") links.push({ href: "/user", name: "User" },)
    if (user?.peran == "super") links.push({ href: "/alat", name: "Alat" },)
    links.push({ href: "/api/auth/signout", name: "Signout" })
    return (
        <section>
            <div className='pb-3'></div>
            <div className='flex flex-row py-2 mx-3 mb-3 rounded-lg bg-background'>
                <div className='basis-3/4'>
                    <div className='p-3'>ERP{pathname}</div>
                </div>
                <div className='basis-1/4 flex flex-row-reverse '>
                    <div className='px-3'>
                        <User user={session} />
                    </div>
                </div>
            </div>
            <div className='flex flex-row'>
                <div>
                    <Nav navLinks={links}></Nav>
                </div>
                {children}
            </div>
        </section>
    )
}