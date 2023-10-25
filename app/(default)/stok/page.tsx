import UI from "./ui"
export default function Produk({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id_proyek = searchParams.id_proyek
    console.log(id_proyek)
    return (
        <UI id_proyek={id_proyek} />
    )
}