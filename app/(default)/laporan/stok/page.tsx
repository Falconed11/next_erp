import UI from "./ui";
import { getUser } from "@/app/utils/user";

export default async function app(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const id_produk = searchParams.id_produk;
  const user = await getUser();
  return <UI id_produk={id_produk} user={user} />;
}
