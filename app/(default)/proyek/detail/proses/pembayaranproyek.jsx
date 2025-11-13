import DatePicker from "react-datepicker";
import {
  Input,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { getDate } from "@/app/utils/date";
import Harga from "@/components/harga";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { key2set, set2key } from "@/app/utils/tools";
const apiPath = getApiPath();

export default function PembayaranProyek({
  isCreate,
  form,
  setForm,
  metodepembayaran,
  rekap,
  totalPenagihan,
}) {
  const karyawan = useClientFetch(`karyawan?id_statuskaryawan=1`);
  const queries = { karyawan };
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  const nilaiProyek = rekap.hargaPajak;
  const piutang =
    nilaiProyek - (totalPenagihan - (isCreate ? 0 : form.tempNominal));
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
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        label={
          <>
            Nominal (Piutang : <Harga harga={piutang} /> )
          </>
        }
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
          <SelectItem
            key={item.id}
            value={item.id}
            textValue={`${item.nama} ${item.namabank} ${item.norekening} ${item.atasnama}`}
          >
            {item.nama} {item.namabank} {item.norekening} {item.atasnama}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Invoice"
        placeholder="Pilih karyawan!"
        className=""
        selectedKeys={key2set(form.id_karyawaninvoice)}
        onSelectionChange={(v) => {
          setForm({
            ...form,
            id_karyawaninvoice: set2key(v),
          });
        }}
      >
        {karyawan.data.map((item) => (
          <SelectItem key={item.id} value={item.id} textValue={item.nama}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Kwitansi"
        placeholder="Pilih karyawan!"
        className=""
        selectedKeys={key2set(form.id_karyawankwitansi)}
        onSelectionChange={(v) => {
          setForm({
            ...form,
            id_karyawankwitansi: set2key(v),
          });
        }}
      >
        {karyawan.data.map((item) => (
          <SelectItem key={item.id} value={item.id} textValue={item.nama}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      {isCreate ? (
        <></>
      ) : (
        <Select
          label="Status Pembayaran"
          placeholder="Pilih status pembayaran!"
          className=""
          selectedKeys={new Set([String(form.status)])}
          onSelectionChange={(v) => {
            setForm({
              ...form,
              status: v.values().next().value,
            });
          }}
        >
          {[
            { key: 0, label: "Menunggu" },
            { key: 1, label: "Lunas" },
          ].map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>
      )}
      <Input
        type="text"
        label="Telah terima dari"
        placeholder="Masukkan pembayar!"
        value={form.pembayar}
        className=""
        onValueChange={(v) =>
          setForm({
            ...form,
            pembayar: v,
          })
        }
      />
      <Textarea
        type="text"
        label={`Untuk pembayaran (${form.untukpembayaran?.length})`}
        placeholder="Masukkan tujuan pembayaran!"
        value={form.untukpembayaran}
        className=""
        onValueChange={(v) =>
          setForm({
            ...form,
            untukpembayaran: v,
          })
        }
      />
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
