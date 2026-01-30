import { Select, SelectItem } from "@heroui/react";
import { set2key, key2set, renderQueryStates } from "@/app/utils/tools";
import { useDefaultFetch } from "@/hooks/useDefault";
import { METODE_PEMBAYARAN_ENDPOINT } from "@/services/metode-pembayaran.service";

export default function SelectMetodePembayaran({
  form,
  setForm,
  label = "Metode Pembayaran",
  fieldName = "id_metodepembayaran",
}) {
  const metodePembayaran = useDefaultFetch({
    endPoint: METODE_PEMBAYARAN_ENDPOINT,
  });
  const QueryState = renderQueryStates({ metodePembayaran });
  if (QueryState) return QueryState;
  const data = metodePembayaran.data;
  return (
    <Select
      label={label}
      placeholder="Pilih metode pembayaran!"
      className=""
      selectedKeys={key2set(form[fieldName])}
      onSelectionChange={(v) => {
        setForm({
          ...form,
          [fieldName]: set2key(v),
        });
      }}
    >
      {data.map((item) => (
        <SelectItem
          key={item.id}
          value={item.id}
          textValue={`${item.nama} ${item.namabank} ${item.norekening} ${item.atasnama}`}
        >
          {item.nama} {item.namabank} {item.norekening} {item.atasnama}
        </SelectItem>
      ))}
    </Select>
  );
}
