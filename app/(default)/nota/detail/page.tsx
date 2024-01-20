import { getApiPath } from "../../../utils/apiconfig"
import DetailNota from "./detailnota"

const api_path = getApiPath()

export default async function app({ searchParams }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const id = searchParams.id
    return <>
        <DetailNota id={id} />
    </>
}