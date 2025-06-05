import UI from "./ui"
export default async function Produk(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id_instansi = searchParams.id_instansi
    return <>
        <UI id_instansi={id_instansi} />
    </>
}