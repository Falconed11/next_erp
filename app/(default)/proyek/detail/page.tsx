import { getUser } from "@/app/utils/user";
import UI from "./ui";

export default async function app(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;
  const versi = searchParams.versi;
  const user = await getUser();
  return (
    <>
      <UI id={id} versi={versi} user={user} />
    </>
  );
}
