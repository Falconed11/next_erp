import { getUser } from "@/app/utils/user";
import UI from "./ui";
export default async function Produk(props: {
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
