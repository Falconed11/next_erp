"use client";
import React, { useMemo, useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
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
import { useSession } from "next-auth/react";
import { highRoleCheck, renderQueryStates } from "@/app/utils/tools";
import {
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteProduk,
  MyAutocomplete,
  MyAutocompleteItem,
} from "./myautocomplete";

const api_path = getApiPath();

export default function TambahProduk({
  form,
  setForm,
  disableHargaKustom,
  disableStok,
  disableVendor,
  refHargaModal,
  customInput,
  rank = 21,
  className,
  disableCustomValue,
}) {
  const idKategori = form.id_kategori;
  const session = useSession();
  const sessUser = session.data?.user;
  const [nama, setNama] = useState("");
  const [sVendor, setSVendor] = useState("");
  const [idProduk, setIdProduk] = useState(null);
  const kategori = useClientFetch(`kategoriproduk`);
  const produk = useClientFetch(
    `produk?${idKategori ? `kategori=${idKategori}` : ""}`
  );
  const vendor = useClientFetch("vendor");
  // const pilihProduk = useClientFetch(`produk`)
  const errorsJumlah = [];
  const queryStates = renderQueryStates({ kategori, produk, vendor }, session);
  if (queryStates) return queryStates;
  const isHighRole = highRoleCheck(sessUser.rank);
  if ((form.jumlah < 1 || !form.jumlah) && form.selectProduk?.length > 0)
    errorsJumlah.push("Jumlah minimal 1");
  if (form.jumlah > form.stok && form.isSelected)
    errorsJumlah.push("Stok tidak cukup");

  // let data = produk.data;
  // const lowerNama = nama.toLowerCase();
  // data = data.filter((row) =>
  //   ["nama", "nmerek", "tipe", "id", "keterangan"].some((key) =>
  //     (row[key] ?? "").toString().toLowerCase().includes(lowerNama)
  //   )
  // );
  // data = data.slice(0, 20);

  let fvendor = vendor.data;
  fvendor = fvendor.filter((row) =>
    row.nama.toLowerCase().includes(sVendor.toLowerCase())
  );
  fvendor = fvendor.slice(0, 100);
  const selectProduk = produk.data.filter((v) => v.id == form.id_produk)[0];
  const hideComponent = isHighRole ? "" : "hidden";
  // console.log(form.selectProduk);
  // console.log({ nama });
  const dataProduk = produk.data;
  const defStyleFormWidth = "w-2/12";
  const variant = "bordered";
  const isProdukSelected = !!form.id_produk;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <AutocompleteKategoriProduk
        disableCustomValue={disableCustomValue}
        form={form}
        setForm={setForm}
        className={defStyleFormWidth}
      />
      {/* <Autocomplete
        popoverProps={{
          shouldCloseOnScroll: false,
        }}
        label="Produk"
        variant="bordered"
        defaultItems={
          idKategori
            ? dataProduk.filter((row) => row.id_kategori == idKategori)
            : dataProduk
        }
        placeholder="Cari produk"
        className="w-8/12"
        selectedKey={form.selectProduk}
        onSelectionChange={(v) => {
          const selectedProduk = dataProduk.filter((p) => p.id == v)[0];
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
      </Autocomplete> */}
      <AutocompleteProduk
        disableCustomValue={disableCustomValue}
        id_kategori={form.id_kategori}
        form={form}
        setForm={setForm}
        className="w-8/12"
      />
      <AutocompleteMerek
        disableCustomValue={disableCustomValue}
        isDisabled={isProdukSelected}
        form={form}
        setForm={setForm}
        className={defStyleFormWidth}
      />
      <Input
        variant={variant}
        type="text"
        value={form.tipe || ""}
        isDisabled={isProdukSelected}
        label="Tipe"
        placeholder="Masukkan tipe!"
        className={defStyleFormWidth}
        onValueChange={(v) =>
          setForm({
            ...form,
            tipe: v,
          })
        }
      />
      <Input
        variant={variant}
        type="text"
        value={form.id_kustom || ""}
        isDisabled={isProdukSelected}
        label="Id"
        placeholder="Masukkan id!"
        className={defStyleFormWidth}
        onValueChange={(v) =>
          setForm({
            ...form,
            id_kustom: v,
          })
        }
      />
      {!disableVendor && !form.isSelected == true && (
        <Autocomplete
          label="Vendor"
          variant={variant}
          defaultItems={fvendor}
          placeholder="Pilih vendor"
          className={defStyleFormWidth}
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
      {!disableStok && selectProduk?.stok > 0 && (
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
      )}
      {/* stok */}
      {form.id_produk && (
        <Input
          variant={variant}
          type="text"
          value={`${form.stok ? form.stok : 0} ${form.satuan ?? ""}`}
          isDisabled
          label="Stok"
          // placeholder="Masukkan jumlah!"
          className={defStyleFormWidth}
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
      )}
      {/* jumlah */}
      <NumberInput
        variant={variant}
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        isInvalid={errorsJumlah.length > 0}
        value={form.jumlah || ""}
        label="Jumlah"
        placeholder="Masukkan jumlah!"
        className={defStyleFormWidth}
        endContent={isProdukSelected && form.satuan}
        onValueChange={(v) =>
          setForm({
            ...form,
            jumlah: v,
          })
        }
      />
      {/* satuan */}
      {!form.id_produk && (
        <Input
          // isDisabled={isProdukSelected}
          variant={variant}
          value={form.satuan || ""}
          label="Satuan"
          placeholder="Masukkan satuan!"
          className={defStyleFormWidth}
          onValueChange={(v) =>
            setForm({
              ...form,
              satuan: v,
            })
          }
        />
      )}
      {/* harga modal */}
      {disableStok && (
        <NumberInput
          variant={variant}
          hideStepper
          isWheelDisabled
          formatOptions={{
            useGrouping: false,
          }}
          isDisabled={form.isSelected ? 1 : undefined}
          value={form.hargamodal || ""}
          label={<>Harga Modal (Ref: {<Harga harga={form.oldHargaModal} />})</>}
          placeholder="Masukkan harga!"
          className={`${defStyleFormWidth} ${hideComponent}`}
          onValueChange={(v) =>
            setForm({
              ...form,
              // provitmarginpersen: countProvitMarginPercent(v, form.harga),
              hargamodal: v,
            })
          }
        />
      )}
      {/* harga jual / satuan */}
      <NumberInput
        variant={variant}
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        isDisabled={form.isSelected ? true : undefined}
        value={form.harga || ""}
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
        className={`${defStyleFormWidth} ${
          !isHighRole && form.isSelected ? " hidden" : ""
        }`}
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
