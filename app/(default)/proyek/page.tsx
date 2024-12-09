import UI from "./ui"
export default function Produk({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id_instansi = searchParams.id_instansi
    return <>
        <UI id_instansi={id_instansi} />
    </>
}