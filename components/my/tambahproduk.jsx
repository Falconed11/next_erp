"use client";
import { useState } from "react";
import { Divider, Input, NumberInput } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { getApiPath } from "@/app/utils/apiconfig";
import Harga from "@/components/my/harga";
import { highRoleCheck, renderQueryStates } from "@/app/utils/tools";
import {
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteProduk,
  AutocompleteVendor,
} from "./myautocomplete";
import { useClientFetch } from "@/hooks/useClientFetch";
import { ConditionalWrapper, MyCheckBox } from "./mycomponent";

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
  user,
}) {
  const isCreateNewProduct = !!(!form.id_produk && form.produk);
  const isFilterActive = !!(form.id_kategori || form.id_merek);
  const { id_kategori: idKategori, id_merek: idMerek } = form;
  const sessUser = user;
  const [nama, setNama] = useState("");
  const [sVendor, setSVendor] = useState("");
  const [idProduk, setIdProduk] = useState(null);
  const produk = useClientFetch(
    `produk?${[...(idKategori ? [`kategori=${idKategori}`] : []), ...(idMerek ? [`merek=${idMerek}`] : [])].join("&")}`,
  );
  const vendor = useClientFetch("vendor");
  // const pilihProduk = useClientFetch(`produk`)
  const errorsJumlah = [];
  const queryStates = renderQueryStates({ produk, vendor });
  if (queryStates) return queryStates;
  const isHighRole = highRoleCheck(sessUser?.rank);
  if ((form.jumlah < 1 || !form.jumlah) && form.selectProduk?.length > 0)
    errorsJumlah.push("Jumlah minimal 1");
  if (form.jumlah > form.stok && form.isSelected)
    errorsJumlah.push("Stok tidak cukup");

  let fvendor = vendor.data;
  fvendor = fvendor.filter((row) =>
    row.nama.toLowerCase().includes(sVendor.toLowerCase()),
  );
  fvendor = fvendor.slice(0, 100);
  const selectProduk = produk.data.filter((v) => v.id == form.id_produk)[0];
  const hideComponent = isHighRole ? "" : "hidden";
  const defStyleFormWidth = "group";
  const variant = "bordered";
  const isProdukSelected = !!form.id_produk;
  // console.log(idMerek);
  return (
    <div
      // className={`flex flex-wrap gap-3 ${className}`}
      className={`flex flex-col gap-2 ${className}`}
    >
      <ConditionalWrapper
        condition={!isProdukSelected && !isCreateNewProduct}
        wrapper={(children) => (
          <div className="border border-primary flex flex-col gap-2 p-2 rounded-lg mt-3 relative">
            <div className="absolute -inset-y-3">
              <div className="text-primary bg-white px-1">Filter Produk</div>
            </div>
            {children}
          </div>
        )}
      >
        <AutocompleteKategoriProduk
          disableCustomValue={disableCustomValue}
          form={form}
          setForm={setForm}
          className={defStyleFormWidth}
          disallowEmptySelection={isCreateNewProduct}
        />
        <AutocompleteMerek
          disableCustomValue={disableCustomValue}
          isDisabled={isProdukSelected}
          form={form}
          setForm={setForm}
          className={defStyleFormWidth}
          disallowEmptySelection={isCreateNewProduct}
        />
      </ConditionalWrapper>
      <AutocompleteProduk
        disableCustomValue={disableCustomValue}
        id_kategori={idKategori}
        id_merek={idMerek}
        form={form}
        setForm={setForm}
        className={defStyleFormWidth}
        disallowEmptySelection
        listboxTopContent={
          isFilterActive ? (
            <div className="text-primary text-lg sticky top-0 text-opacity-100 opacity-100">
              * Menampilkan produk berdasarkan filter:
            </div>
          ) : null
        }
      />
      {/* tipe */}
      <Input
        isRequired={isCreateNewProduct}
        variant={variant}
        type="text"
        value={form.tipe || ""}
        isDisabled={isProdukSelected || !form.produk}
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
      {/* id */}
      <Input
        variant={variant}
        type="text"
        value={form.id_kustom || ""}
        isDisabled={isProdukSelected || !form.produk}
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
        <AutocompleteVendor
          className={defStyleFormWidth}
          disableCustomValue={true}
          form={form}
          setForm={setForm}
        />
      )}
      {!disableStok && selectProduk?.stok > 0 && (
        <Checkbox
          isSelected={form.isSelected}
          onValueChange={(v) => {
            setForm({
              ...form,
              isSelected: v,
              harga: refHargaModal
                ? (selectProduk?.hargamodal ?? 0)
                : (selectProduk?.hargajual ?? 0),
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
        isRequired
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
          isDisabled={!form.produk}
          isRequired={isCreateNewProduct}
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
                    ? (selectProduk?.hargamodal ?? 0)
                    : (selectProduk?.hargajual ?? 0)
                }
              />
            }
            )
          </>
        }
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
      {customInput ? customInput : <></>}
    </div>
  );
}
