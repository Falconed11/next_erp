import { getApiPath } from "@/app/utils/apiconfig"
import UI from "./ui"

const api_path = getApiPath()

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