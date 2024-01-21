import { getApiPath } from "@/app/utils/apiconfig"
import UI from "./ui"

const api_path = getApiPath()

export default async function app({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id = searchParams.id
    return <>
        <UI id={id} />
    </>
}