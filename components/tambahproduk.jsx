"use client";
import React from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useFilter } from "@react-aria/i18n";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";

const api_path = getApiPath();

export default function TambahProduk({ form, setForm }) {
  const kategori = useClientFetch(`kategoriproduk`);
  const produk = useClientFetch(
    `produk?${
      form.selectKategori.size > 0
        ? `kategori=${form.selectKategori.values().next().value}`
        : ""
    }`
  );

  const animals = produk?.data;

  const [fieldState, setFieldState] = React.useState({
    selectedKey: "",
    inputValue: "",
    items: animals,
  });
  const { startsWith } = useFilter({ sensitivity: "base" });
  const onSelectionChange = (key) => {
    setFieldState((prevState) => {
      let selectedItem = prevState.items.find((option) => option.value === key);

      return {
        inputValue: selectedItem?.label || "",
        selectedKey: key,
        items: animals.filter((item) =>
          startsWith(item.label, selectedItem?.label || "")
        ),
      };
    });
  };
  const onInputChange = (value) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: animals.filter((item) => startsWith(item.label, value)),
    }));
  };
  const onOpenChange = (isOpen, menuTrigger) => {
    if (menuTrigger === "manual" && isOpen) {
      setFieldState((prevState) => ({
        inputValue: prevState.inputValue,
        selectedKey: prevState.selectedKey,
        items: animals,
      }));
    }
  };

  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  return (
    <>
      <Autocomplete
        className="max-w-xs"
        inputValue={fieldState.inputValue}
        items={fieldState.items}
        label="Favorite Animal"
        placeholder="Search an animal"
        selectedKey={fieldState.selectedKey}
        variant="bordered"
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        onSelectionChange={onSelectionChange}
      >
        {(item) => (
          <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
        )}
      </Autocomplete>
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
      <Select
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
      </Select>
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
