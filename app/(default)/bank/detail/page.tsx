import UI from "./ui";
import { getUser } from "@/app/utils/user";

export default async function app(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;
  const user = await getUser();
  return (
    <>
      <UI id={id} user={user} />
    </>
  );
}
