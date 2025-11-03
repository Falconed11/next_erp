import UI from "./ui";
export default async function Produk(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const id = searchParams.id;
  return (
    <>
      <UI id_produk={id} />
    </>
  );
}
