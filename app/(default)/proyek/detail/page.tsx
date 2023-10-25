import { type NextRequest } from 'next/server'
import { getApiPath } from "../../utils/apiconfig"
import UI from "./ui"

const api_path = getApiPath()

export default async function app({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id = searchParams.id
    const proyek = await getProyek(id)
    const keranjangproyek = await getKeranjangProyek(id)
    return <>
        <UI proyek={proyek[0]} id={id} />
    </>
}

async function getProyek(id: any) {
    const res = await fetch(`${api_path}proyek?id=${id}`)
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}
async function getKeranjangProyek(id: any) {
    const res = await fetch(`${api_path}keranjangproyek?id_proyek=${id}`)
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }


    return res.json()
}