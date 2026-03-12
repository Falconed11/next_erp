import UI from "./ui";
export default async function Produk(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const idProyek = searchParams.id_proyek;
  const id_instansi = searchParams.id_instansi;
  const id_karyawan = searchParams.id_karyawan;
  const id_produk = searchParams.id_produk;
  const start = searchParams.start;
  const end = searchParams.end;
  return (
    <>
      <UI
        idProyek={idProyek}
        id_instansi={id_instansi}
        id_karyawan={id_karyawan}
        id_produk={id_produk}
        startDate={start}
        endDate={end}
      />
    </>
  );
}
