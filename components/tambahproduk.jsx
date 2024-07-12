"use client";
import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useFilter } from "@react-aria/i18n";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { Checkbox } from "@nextui-org/react";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";

const api_path = getApiPath();

export default function TambahProduk({
  form,
  setForm,
  disableHargaKustom,
  disableStok,
  disableVendor,
  refHargaModal,
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

  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (vendor.error) return <div>failed to load</div>;
  if (vendor.isLoading) return <div>loading...</div>;

  let data = produk.data;
  data = data.filter((animal) =>
    animal.nama.toLowerCase().includes(nama.toLowerCase())
  );
  data = data.slice(0, 100);

  let fvendor = vendor.data;
  fvendor = fvendor.filter((animal) =>
    animal.nama.toLowerCase().includes(sVendor.toLowerCase())
  );
  fvendor = fvendor.slice(0, 100);
  const selectProduk = produk.data.filter((v) => v.id == form.selectProduk)[0];
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
        label="Produk"
        variant="bordered"
        defaultItems={data}
        placeholder="Cari produk"
        className="w-8/12"
        selectedKey={form.selectProduk}
        onSelectionChange={(v) => {
          const selectedProduk = produk.data.filter((p) => p.id == v)[0];
          setForm({
            ...form,
            selectProduk: v,
            harga: refHargaModal
              ? selectedProduk?.hargamodal ?? 0
              : selectedProduk?.hargajual ?? 0,
            stok: selectedProduk?.stok,
            satuan: selectedProduk?.satuan,
            isSelected: false,
          });
        }}
        onValueChange={setNama}
      >
        {(item) => (
          <AutocompleteItem key={item.id} textValue={item.nama}>
            {item.nama} | {item.nmerek} | {item.nvendor} | {item.tipe} |{" "}
            <span className="p-1 bg-black text-white">
              {item.stok} {item.satuan}
            </span>{" "}
            | <Harga harga={item.hargamodal} /> |{" "}
            <Harga harga={item.hargajual} />
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
          placeholder="Cari produk"
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
            onValueChange={(v) => setForm({ ...form, isSelected: v })}
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
        value={`${form.stok ?? ""} ${form.satuan ?? ""}`}
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
      <Input
        type="number"
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
      <Input
        type="number"
        value={form.harga}
        label={`Harga (Ref: 
          ${
            refHargaModal
              ? selectProduk?.hargamodal ?? 0
              : selectProduk?.hargajual ?? 0
          }
        )`}
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
            harga: v,
          })
        }
      />
      {disableHargaKustom ? (
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
      )}
    </div>
  );
}
