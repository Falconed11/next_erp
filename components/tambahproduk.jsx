"use client";
import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useFilter } from "@react-aria/i18n";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";

const api_path = getApiPath();

export default function TambahProduk({ form, setForm }) {
  const [nama, setNama] = useState("");
  const kategori = useClientFetch(`kategoriproduk`);
  const produk = useClientFetch(
    `produk?${
      form.selectKategori?.size > 0
        ? `kategori=${form.selectKategori.values().next().value}`
        : ""
    }`
  );

  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;

  let data = produk.data;
  data = data.filter((animal) =>
    animal.nama.toLowerCase().includes(nama.toLowerCase())
  );
  data = data.slice(0, 100);
  return (
    <>
      <Select
        label="Kategori"
        placeholder="Pilih kategori!"
        className="w-2/12"
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
      {/* <Select
        label="Produk"
        placeholder="Pilih produk!"
        className="w-5/12 pl-2"
        selectedKeys={form.selectProduk}
        onSelectionChange={(v) => setForm({ ...form, selectProduk: v })}
      >
        {produk.data.map((item) => (
          <SelectItem
            key={item.id}
            value={item.id}
            textValue={`${item.nama} | ${item.nmerek} | ${item.nvendor} | ${item.tipe} | ${item.stok} ${item.satuan} | ${item.hargamodal} | ${item.hargajual}`}
          >
            {item.nama} | {item.nmerek} | {item.nvendor} | {item.tipe} |{" "}
            <span className="p-1 bg-black text-white">
              {item.stok} {item.satuan}
            </span>{" "}
            | <Harga harga={item.hargamodal} /> |{" "}
            <Harga harga={item.hargajual} />
          </SelectItem>
        ))}
      </Select> */}
      <Autocomplete
        label="Produk"
        variant="bordered"
        defaultItems={data}
        placeholder="Cari produk"
        className="w-6/12"
        selectedKey={form.selectProduk}
        onSelectionChange={(v) => setForm({ ...form, selectProduk: v })}
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
      <Input
        type="number"
        value={form.jumlah}
        label="Jumlah"
        placeholder="Masukkan jumlah!"
        className="w-2/12 pl-2"
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
        label="Harga Kustom"
        placeholder="Masukkan harga!"
        className="w-2/12 pl-2"
        onValueChange={(v) =>
          setForm({
            ...form,
            harga: v,
          })
        }
      />
    </>
  );
}
