import UI from "./ui"

export default async function app(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id = searchParams.id
    return <>
        <UI id={id} />
    </>
}

// async function getProyek(id: any) {
//     const res = await fetch(`${api_path}proyek?id=${id}`)
//     // The return value is *not* serialized
//     // You can return Date, Map, Set, etc.

//     if (!res.ok) {
//         // This will activate the closest `error.js` Error Boundary
//         throw new Error('Failed to fetch data')
//     }

//     return res.json()
// }