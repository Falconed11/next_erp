import { useClientFetch } from "@/app/utils/apiconfig";
export default function DetailProyek({ id_proyek }) {
  const proyek = useClientFetch(`proyek?id=${id_proyek}`);
  const queries = {
    proyek,
  };
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  const selectedProyek = proyek.data[0];
  return (
    <div className="p-2 bg-white rounded-lg">
      <div>Detail Proyek</div>
      {[
        { key: "Nama", val: selectedProyek.nama },
        { key: "Instansi", val: selectedProyek.instansi },
        { key: "Klien", val: selectedProyek.klien },
        { key: "Keterangan", val: selectedProyek.keterangan },
      ].map((v, i) => (
        <div key={i} className="grid grid-cols-2 leading-[1.1]-">
          <div className={`${v.classNames}`}>{v.key}</div>
          <div className={`${v.classNames}`}>{v.val}</div>
        </div>
      ))}
    </div>
  );
}
