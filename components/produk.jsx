import {
  countPercentProvit,
  countPriceByPercentProfit,
} from "@/app/utils/formula";
import { highRoleCheck, renderQueryStates } from "@/app/utils/tools";
import {
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteVendor,
} from "@/components/myautocomplete";
import { Input, NumberInput, Radio, RadioGroup, Textarea } from "@heroui/react";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FormProduct = ({ form, setForm }) => {
  const session = useSession();
  const queryStates = renderQueryStates(null, session);
  if (queryStates) return queryStates;
  console.log(session);
  const sessUser = session.data.user;
  const isHighRole = highRoleCheck(sessUser.rank);
  const classCompByRole = isHighRole ? "" : "hidden";
  return (
    <>
      <AutocompleteKategoriProduk form={form} setForm={setForm} />
      <Input
        variant="bordered"
        type="text"
        label="Id"
        placeholder="Masukkan id!"
        value={form.id_kustom}
        onValueChange={(val) => setForm({ ...form, id_kustom: val })}
      />
      <Input
        variant="bordered"
        type="text"
        label="Nama"
        placeholder="Masukkan nama!"
        value={form.nama}
        onValueChange={(val) => setForm({ ...form, nama: val })}
      />
      <AutocompleteMerek form={form} setForm={setForm} />
      <Input
        variant="bordered"
        type="text"
        label="Tipe"
        placeholder="Masukkan tipe!"
        value={form.tipe}
        onValueChange={(val) => setForm({ ...form, tipe: val })}
      />
      {form.modalmode == "Tambah" ? (
        <>
          <NumberInput
            variant="bordered"
            hideStepper
            isWheelDisabled
            formatOptions={{
              useGrouping: false,
            }}
            label="Stok"
            placeholder="Masukkan stok!"
            isReadOnly={form.modalmode == "Edit" ? true : undefined}
            value={form.stok}
            onValueChange={(val) => setForm({ ...form, stok: val })}
          />
          <AutocompleteVendor
            isDisabled={!form.stok}
            form={form}
            setForm={setForm}
          />
          <Textarea
            variant="bordered"
            isDisabled={
              !form.stok || !form.vendor || form.id_vendor ? true : undefined
            }
            label="alamat"
            labelPlacement="inside"
            placeholder="Masukkan alamat!"
            value={form.alamat || ""}
            onValueChange={(val) => setForm({ ...form, alamat: val })}
          />
        </>
      ) : (
        <></>
      )}
      <Input
        variant="bordered"
        type="text"
        label="Satuan"
        placeholder="Masukkan satuan!"
        value={form.satuan}
        onValueChange={(val) => setForm({ ...form, satuan: val })}
      />
      <NumberInput
        variant="bordered"
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        className={classCompByRole}
        label="Harga Modal"
        placeholder="Masukkan harga modal!"
        value={form.hargamodal}
        onValueChange={(val) => setForm({ ...form, hargamodal: val })}
      />
      <NumberInput
        variant="bordered"
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        label="Harga Jual"
        placeholder="Masukkan harga jual!"
        value={form.hargajual}
        onValueChange={(val) => setForm({ ...form, hargajual: val })}
      />
      <NumberInput
        variant="bordered"
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        className={classCompByRole}
        label="Provit"
        // label={`Provit (${
        //   Math.round(
        //     countPercentProvit(
        //       form.hargamodal || 0,
        //       form.hargajual || 0
        //     ) * 100
        //   ) / 100
        // }%)`}
        placeholder="Masukkan Provit!"
        value={form.hargajual - form.hargamodal}
        onValueChange={(v) =>
          setForm({
            ...form,
            hargajual: (+form.hargamodal || 0) + (+v || 0),
          })
        }
      />
      <NumberInput
        variant="bordered"
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        className={classCompByRole}
        label="Persen Provit (%)"
        placeholder="Masukkan persen provit!"
        value={
          Math.round(
            countPercentProvit(form.hargamodal, form.hargajual) * 100
          ) / 100
        }
        onValueChange={(v) =>
          setForm({
            ...form,
            hargajual: Math.round(
              countPriceByPercentProfit(form.hargamodal, v)
            ),
          })
        }
      />
      {/* <NumberInput
                  hideStepper
                  isWheelDisabled
                  label="Persen Provit"
                  placeholder="Masukkan Persen Provit!"
                  value={persenProvit}
                  endContent={
                    <Button
                      ref={terapkanButton}
                      size="sm"
                      color="primary"
                      type="button"
                      onPress={() => {
                        setForm({
                          ...form,
                          hargajual: Math.ceil(
                            countPriceByPercentProfit(
                              form.hargamodal,
                              persenProvit
                            )
                          ),
                        });
                      }}
                    >
                      Terapkan
                    </Button>
                  }
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      terapkanButton.current?.click();
                    }
                  }}
                  onValueChange={setPersenProvit}
                /> */}
      <div className="bg-gray-100 p-3 rounded-lg z-40">
        <div>Tanggal</div>
        <DatePicker
          className="z-40 bg-white"
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          selected={form.startdate}
          onChange={(v) =>
            setForm({ ...form, startdate: v, tanggal: getDate(v) })
          }
        />
      </div>
      {form.modalmode == "Tambah" && form.stok > 0 ? (
        <>
          <RadioGroup
            orientation="horizontal"
            defaultValue={"1"}
            value={form.lunas}
            onValueChange={(v) => setForm({ ...form, lunas: v })}
          >
            <Radio value="1">Lunas</Radio>
            <Radio value="0">Hutang</Radio>
          </RadioGroup>
          {form.lunas == "0" ? (
            <>
              <div className="bg-gray-100 p-3 rounded-lg z-40">
                <div>Jatuh Tempo</div>
                <DatePicker
                  className="z-40"
                  placeholderText="Pilih tanggal"
                  dateFormat="dd/MM/yyyy"
                  selected={form.startdateJatuhtempo}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      startdateJatuhtempo: v,
                      jatuhtempo: getDate(v),
                    })
                  }
                />
              </div>
              <Input
                variant="bordered"
                type="number"
                label="Terbayar"
                placeholder="Masukkan nominal!"
                value={form.terbayar}
                onValueChange={(val) => setForm({ ...form, terbayar: val })}
              />
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
      <Textarea
        variant="bordered"
        label="Keterangan"
        labelPlacement="inside"
        placeholder="Masukkan keterangan! (Opsional)"
        value={form.keterangan}
        onValueChange={(val) => setForm({ ...form, keterangan: val })}
      />
    </>
  );
};

export { FormProduct };
