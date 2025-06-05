import UI from "./ui"
export default async function Produk(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id_instansi = searchParams.id_instansi
    const id_karyawan = searchParams.id_karyawan
    const start = searchParams.start
    const end = searchParams.end
    return <>
        <UI id_instansi={id_instansi} id_karyawan={id_karyawan} startDate={start} endDate={end} />
    </>
}