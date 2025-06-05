import UI from "./ui"
export default async function app(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id_produk = searchParams.id_produk
    return (
        <UI id_produk={id_produk} />
    )
}