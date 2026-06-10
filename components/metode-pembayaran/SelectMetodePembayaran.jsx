import { Select, SelectItem } from "@heroui/react";
import {
  set2key,
  key2set,
  renderQueryStates,
  urlBuilder,
} from "@/app/utils/tools";
import { useDefaultFetch } from "@/hooks/useDefault";
import { METODE_PEMBAYARAN_ENDPOINT } from "@/services/metode-pembayaran.service";
import { useClientFetch } from "@/hooks/useClientFetch";

export default function SelectMetodePembayaran({
  id_perusahaan,
  hide,
  form,
  setForm,
  label = "Metode Pembayaran",
  fieldName = "id_metodepembayaran",
}) {
  const metodePembayaran = useClientFetch(
    urlBuilder(METODE_PEMBAYARAN_ENDPOINT, [
      { key: "id_perusahaan", val: id_perusahaan },
      { key: "hide", val: hide },
    ]),
  );
  const QueryState = renderQueryStates({ metodePembayaran });
  if (QueryState) return QueryState;
  const data = metodePembayaran.data;
  return (
    <Select
      label={label}
      placeholder="Pilih metode pembayaran!"
      className=""
      classNames={{
        popoverContent: "w-auto text-nowrap",
      }}
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
          textValue={`${item.nama} ${item.namabank} ${item.norekening} ${item.atasnama} ${item.perusahaan}`}
        >
          {item.nama} {item.namabank} {item.norekening} {item.atasnama}{" "}
          {item.perusahaan}
        </SelectItem>
      ))}
    </Select>
  );
}
