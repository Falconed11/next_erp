import UI from "./ui"
export default async function Produk(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id_proyek = searchParams.id_proyek
    console.log(id_proyek)
    return (
        <UI id_proyek={id_proyek} />
    )
}