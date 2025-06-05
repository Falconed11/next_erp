import { getApiPath } from "../../../utils/apiconfig"
import DetailNota from "./detailnota"

const api_path = getApiPath()

export default async function app(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }
) {
    const searchParams = await props.searchParams;
    const id = searchParams.id
    return <>
        <DetailNota id={id} />
    </>
}