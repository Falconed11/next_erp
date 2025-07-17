import DatePicker from "react-datepicker";
import { Input, Select, SelectItem } from "@heroui/react";
import { getDate } from "@/app/utils/date";

export default function PembayaranProyek({ form, setForm, metodepembayaran }) {
  return (
    <>
      <div className="bg-gray-100 p-3 rounded-lg z-50">
        <div>Tanggal</div>
        <DatePicker
          popperPlacement="bottom-start"
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          selected={form.startdate}
          onChange={(v) => {
            setForm({
              ...form,
              startdate: v,
              tanggal: getDate(v),
            });
          }}
        />
      </div>
      <Input
        type="number"
        label="Nominal"
        value={form.nominal}
        placeholder="Masukkan nominal!"
        className=""
        onValueChange={(v) =>
          setForm({
            ...form,
            nominal: v,
          })
        }
      />
      <Select
        label="Metode Pembayaran"
        placeholder="Pilih metode pembayaran!"
        className=""
        selectedKeys={form.selectMetodePembayaran}
        onSelectionChange={(v) => {
          setForm({
            ...form,
            selectMetodePembayaran: v,
            id_metodepembayaran: new Set(v).values().next().value,
          });
        }}
      >
        {metodepembayaran.data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <Input
        type="text"
        label="Keterangan"
        placeholder="Masukkan keterangan!"
        value={form.keterangan}
        className=""
        onValueChange={(v) =>
          setForm({
            ...form,
            keterangan: v,
          })
        }
      />
    </>
  );
}
