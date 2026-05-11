import UI from "./ui";
import { getUser } from "@/app/utils/user";
export default async function Produk(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const id_instansi = searchParams.id_instansi;
  const user = await getUser();
  return (
    <>
      <UI id_instansi={id_instansi} user={user} />
    </>
  );
}
