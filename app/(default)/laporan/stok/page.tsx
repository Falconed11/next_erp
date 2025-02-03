import UI from "./ui"
export default async function app({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id_produk = searchParams.id_produk
    return (
        <UI id_produk={id_produk} />
    )
}