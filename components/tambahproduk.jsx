"use client";
import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useFilter } from "@react-aria/i18n";
import { Input, NumberInput } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import {
  countPercentProvit,
  countProvitMarginPercent,
} from "@/app/utils/formula";
import { getDateF, getDateFId } from "@/app/utils/date";
import Harga from "@/components/harga";

const api_path = getApiPath();

export default function TambahProduk({
  form,
  setForm,
  disableHargaKustom,
  disableStok,
  disableVendor,
  refHargaModal,
  customInput,
}) {
  const [nama, setNama] = useState("");
  const [sVendor, setSVendor] = useState("");
  const kategori = useClientFetch(`kategoriproduk`);
  const produk = useClientFetch(
    `produk?${
      form.selectKategori?.size > 0
        ? `kategori=${form.selectKategori.values().next().value}`
        : ""
    }`
  );
  const vendor = useClientFetch("vendor");
  // const pilihProduk = useClientFetch(`produk`)
  const errorsJumlah = [];

  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (vendor.error) return <div>failed to load</div>;
  if (vendor.isLoading) return <div>loading...</div>;

  if ((form.jumlah < 1 || !form.jumlah) && form.selectProduk?.length > 0)
    errorsJumlah.push("Jumlah minimal 1");
  if (form.jumlah > form.stok && form.isSelected)
    errorsJumlah.push("Stok tidak cukup");

  let data = produk.data;
  data = data.filter(
    (animal) =>
      animal.nama.toLowerCase().includes(nama.toLowerCase()) ||
      (animal.nmerek || "").toLowerCase().includes(nama.toLowerCase()) ||
      animal.tipe.toLowerCase().includes(nama.toLowerCase()) ||
      animal.id.toString().includes(nama.toLowerCase()) ||
      animal.keterangan.toLowerCase().includes(nama.toLowerCase())
  );
  data = data.slice(0, 20);

  let fvendor = vendor.data;
  fvendor = fvendor.filter((animal) =>
    animal.nama.toLowerCase().includes(sVendor.toLowerCase())
  );
  fvendor = fvendor.slice(0, 100);
  const selectProduk = produk.data.filter((v) => v.id == form.selectProduk)[0];
  console.log(form.selectProduk);
  console.log({ nama });
  return (
    <div className="w-max flex flex-wrap gap-3">
      <Select
        label="Kategori"
        placeholder="Pilih kategori!"
        className="w-3/12"
        selectedKeys={form.selectKategori}
        onSelectionChange={(v) => {
          setForm({
            ...form,
            selectProduk: new Set([]),
            selectKategori: v,
          });
          //   setSelectProduk(new Set([]));
          //   setSelectKategori(v);
        }}
      >
        {kategori.data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <Autocomplete
        popoverProps={{
          shouldCloseOnScroll: false,
        }}
        label="Produk"
        variant="bordered"
        defaultItems={data}
        placeholder="Cari produk"
        className="w-8/12"
        selectedKey={form.selectProduk}
        onSelectionChange={(v) => {
          const selectedProduk = produk.data.filter((p) => p.id == v)[0];
          const harga = refHargaModal
            ? selectedProduk?.hargamodal ?? 0
            : selectedProduk?.hargajual ?? 0;
          const hargamodal = selectedProduk?.hargamodal;
          setForm({
            ...form,
            selectProduk: v,
            oldHargaModal: hargamodal,
            hargamodal,
            harga,
            // provitmarginpersen: countProvitMarginPercent(hargamodal, harga),
            stok: selectedProduk?.stok,
            satuan: selectedProduk?.satuan,
            isSelected: false,
          });
        }}
        onValueChange={setNama}
      >
        {(item) => (
          <AutocompleteItem
            key={item.id}
            textValue={`${item.nama} ${item.nmerek} ${item.tipe} ${item.keterangan}`}
          >
            {item.nama} | {item.nmerek} | {item.tipe} |{" "}
            <span className="p-1 bg-black text-white">
              {item.stok} {item.satuan}
            </span>{" "}
            | <Harga harga={item.hargamodal} /> |{" "}
            <Harga harga={item.hargajual} /> | {item.keterangan} |{" "}
            {getDateFId(item.tanggal)}
          </AutocompleteItem>
        )}
      </Autocomplete>
      {disableVendor ? (
        <></>
      ) : form.isSelected == true ? (
        <></>
      ) : (
        <Autocomplete
          label="Vendor"
          variant="bordered"
          defaultItems={fvendor}
          placeholder="Pilih vendor"
          className="w-3/12"
          selectedKey={form.selectVendor}
          onSelectionChange={(v) => {
            setForm({
              ...form,
              selectVendor: v,
            });
          }}
          onValueChange={setSVendor}
        >
          {(item) => (
            <AutocompleteItem key={item.id} textValue={item.nama}>
              {item.nama}
            </AutocompleteItem>
          )}
        </Autocomplete>
      )}
      {!disableStok ? (
        selectProduk?.stok > 0 ? (
          <Checkbox
            isSelected={form.isSelected}
            onValueChange={(v) => {
              setForm({
                ...form,
                isSelected: v,
                harga: refHargaModal
                  ? selectProduk?.hargamodal ?? 0
                  : selectProduk?.hargajual ?? 0,
              });
            }}
          >
            Pakai Stok
          </Checkbox>
        ) : (
          <></>
        )
      ) : (
        <></>
      )}
      <Input
        type="text"
        value={`${form.stok ? form.stok : 0} ${form.satuan ?? ""}`}
        disabled
        label="Stok"
        // placeholder="Masukkan jumlah!"
        className="w-3/12"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small"></span>
          </div>
        }
        onValueChange={(v) =>
          setForm({
            ...form,
            jumlah: v,
          })
        }
      />
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        errorMessage={
          <ul>
            {errorsJumlah.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        }
        isInvalid={errorsJumlah.length > 0}
        value={form.jumlah}
        label="Jumlah"
        placeholder="Masukkan jumlah!"
        className="w-3/12"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small"></span>
          </div>
        }
        onValueChange={(v) =>
          setForm({
            ...form,
            jumlah: v,
          })
        }
      />
      {disableStok ? (
        <NumberInput
          hideStepper
          isWheelDisabled
          formatOptions={{
            useGrouping: false,
          }}
          isDisabled={form.isSelected ? 1 : undefined}
          value={form.hargamodal}
          label={<>Harga Modal (Ref: {<Harga harga={form.oldHargaModal} />})</>}
          placeholder="Masukkan harga!"
          className="w-3/12"
          onValueChange={(v) =>
            setForm({
              ...form,
              // provitmarginpersen: countProvitMarginPercent(v, form.harga),
              hargamodal: v,
            })
          }
        />
      ) : (
        <></>
      )}
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        isDisabled={form.isSelected ? 1 : undefined}
        value={form.harga}
        label={
          <>
            Harga {disableStok ? "Jual" : "Satuan"} (Ref:{" "}
            {
              <Harga
                harga={
                  refHargaModal
                    ? selectProduk?.hargamodal ?? 0
                    : selectProduk?.hargajual ?? 0
                }
              />
            }
            )
          </>
        }
        // endContent={
        //   disableStok ? (
        //     `(${
        //       Math.round(
        //         countPercentProvit(form.hargamodal, form.harga) * 100
        //       ) / 100
        //     }%)`
        //   ) : (
        //     <></>
        //   )
        // }
        // label={`Harga (Ref:
        //   ${
        //     produk.data.filter((v) => v.id == form.selectProduk)[0]
        //       ?.hargajual ?? 0
        //   }
        // )`}
        placeholder="Masukkan harga!"
        className="w-3/12"
        onValueChange={(v) =>
          setForm({
            ...form,
            // provitmarginpersen: countProvitMarginPercent(form.hargamodal, v),
            harga: v,
          })
        }
      />
      {/* {disableHargaKustom ? (
        <></>
      ) : (
        <Input
          type="number"
          value={form.hargakustom}
          label={`Harga Kustom`}
          placeholder="Hanya ditampilkan pada penawaran!"
          className="w-3/12"
          onValueChange={(v) =>
            setForm({
              ...form,
              hargakustom: v,
            })
          }
        />
      )} */}
      {customInput ? customInput : <></>}
    </div>
  );
}
