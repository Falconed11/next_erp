"use client"
import { useSession } from 'next-auth/react'
import Nav from '../../components/nav'
import User from '../../components/user'

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    const session = useSession()
    const user = session.data?.user
    const links = [
        { href: "/", name: "Dashboard" },
        { href: "/produk", name: "Produk" },
        // {
        //     href: "/produk", name: "Produk", dropdown: [
        //         {
        //             key: "data",
        //             name: "Data",
        //             href: "/produk"
        //         },
        //         // {
        //         //     key: "merek",
        //         //     name: "Merek",
        //         //     href: "/produk/merek"
        //         // },
        //         // {
        //         //     key: "kategori",
        //         //     name: "Kategori",
        //         //     href: "/produk/kategori"
        //         // },
        //         // {
        //         //     key: "subkategori",
        //         //     name: "Sub Kategori",
        //         //     href: "/produk/subkategori"
        //         // },
        //     ]
        // },
        // { href: "/stok", name: "Stok" },
        {
            href: "/proyek", name: "Proyek", dropdown: [
                {
                    key: "data",
                    name: "Proyek",
                    href: ""
                },
                {
                    key: "pengeluaran",
                    name: "Pengeluaran",
                    href: "/pengeluaran"
                },
                {
                    key: "pembayaran",
                    name: "Pembayaran",
                    href: "/pembayaran"
                },
            ]
        },
        { href: "/nota", name: "Nota" },
        { href: "/kwitansi", name: "Kwitansi" },
        { href: "/operasionalkantor", name: "Operasional Kantor" },
        { href: "/customer", name: "Customer" },
        { href: "/vendor", name: "Vendor" },
        { href: "/bank", name: "Bank" },
        { href: "/karyawan", name: "Karyawan" },
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
        {
            href: "/laporan", name: "Laporan", dropdown: [
                // {
                //     key: "labarugi",
                //     name: "Laba Rugi",
                //     href: "/labarugi"
                // },
                {
                    key: "proyekbulanan",
                    name: "Proyek Bulanan",
                    href: "/proyekbulanan"
                },
            ]
        },
    ]
    if (user?.peran == "super") links.push({ href: "/user", name: "User" },)
    if (user?.peran == "super") links.push({ href: "/alat", name: "Alat" })
    links.push({ href: "/api/auth/signout", name: "Signout" })
    return (
        <section>
            <div className='pb-3'></div>
            <div className='flex flex-row py-2 mx-3 mb-3 rounded-lg bg-background'>
                <div className='basis-3/4'>
                    <div className='p-3'>ERP</div>
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