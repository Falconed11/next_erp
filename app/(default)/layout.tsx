import Nav from '../components/nav'
import User from '../components/user'

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <section>
            <div className='pb-3'></div>
            <div className='flex flex-row py-2 mx-3 mb-3 rounded-lg bg-background'>
                <div className='basis-3/4'>
                    <div className='p-3'>ERP</div>
                </div>
                <div className='basis-1/4 flex flex-row-reverse '>
                    <div className='px-3'>
                        <User />
                    </div>
                </div>
            </div>
            <div className='flex flex-row'>
                <div>
                    <Nav navLinks={[
                        { href: "/", name: "Dashboard" },
                        { href: "/produk", name: "Produk" },
                        { href: "/stok", name: "Stok" },
                        { href: "/proyek", name: "Proyek" },
                        {
                            href: "/karyawan", name: "Karyawan", dropdown: [
                                {
                                    key: "data",
                                    name: "Data",
                                    href: "/karyawan"
                                },
                                {
                                    key: "pengeluaran",
                                    name: "Pengeluaran",
                                    href: "/karyawan/pengeluaran"
                                },
                                {
                                    key: "lembur",
                                    name: "Lembur",
                                    href: "/karyawan/lembur"
                                },
                            ]
                        },
                        {
                            href: "/perusahaan", name: "Perusahaan", dropdown: [
                                {
                                    key: "pengeluaran",
                                    name: "Pengeluaran",
                                    href: "/perusahaan/pengeluaran"
                                },
                                {
                                    key: "pemasukan",
                                    name: "Pemasukan",
                                    href: "/perusahaan/pemasukan"
                                },
                            ]
                        },
                        { href: "/distributor", name: "Distributor" },
                        { href: "/klien", name: "Klien" },
                        { href: "/gudang", name: "Gudang" },
                        {
                            href: "/laporan", name: "Laporan", dropdown: [
                                {
                                    key: "labarugi",
                                    name: "Laba Rugi",
                                    href: "/labarugi"
                                },
                            ]
                        },
                    ]}></Nav>
                </div>
                {children}
            </div>
        </section>
    )
}