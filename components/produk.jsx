import {
  highRoleCheck,
  renderQueryStates,
  updateForm,
} from "@/app/utils/tools";
import {
  countPercentProvit,
  countPriceByPercentProfit,
} from "@/app/utils/formula";
import {
  AutocompleteKategoriProduk,
  AutocompleteMerek,
  AutocompleteVendor,
} from "@/components/myautocomplete";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  dateHeroUIToMysql,
  dateMysqlToHeroUI,
  getDate,
} from "@/app/utils/date";
import { MyCheckBox, MyDatePicker } from "./mycomponent";
import { number2Nominal } from "@/app/utils/number";
import { API_PATH } from "@/app/utils/apiconfig";

const FormProduct = ({ form, setForm }) => {
  const session = useSession();

  // const [inputId, setInputId] = useState(form.id_kustom);
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setForm((prev) => ({ ...prev, id_kustom: inputId }));
  //   }, 1000); // delay (1 second)

  //   return () => {
  //     clearTimeout(handler); // cancel previous timeout
  //   };
  // }, [inputId]);

  const queryStates = renderQueryStates(null, session);
  if (queryStates) return queryStates;
  const sessUser = session.data.user;
  const isHighRole = highRoleCheck(sessUser.rank);
  const classCompByRole = isHighRole ? "" : "hidden";
  const isStock = form?.stok || false;
  return (
    <>
      <AutocompleteKategoriProduk form={form} setForm={setForm} />
      <Input
        variant="bordered"
        type="text"
        label="Id"
        placeholder="Masukkan id!"
        value={form.id_kustom}
        onValueChange={(v) => updateForm(setForm, { id_kustom: v })}
      />
      <Input
        variant="bordered"
        type="text"
        label="Nama"
        placeholder="Masukkan nama!"
        value={form.nama}
        onValueChange={(val) => updateForm(setForm, { nama: val })}
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
      {form.modalmode == "Tambah" && (
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
          {isStock && (
            <>
              <MyDatePicker
                form={form}
                setForm={setForm}
                field="tanggalMasuk"
                label="Tanggal Masuk"
              />
              <AutocompleteVendor form={form} setForm={setForm} />
              <Textarea
                variant="bordered"
                isDisabled={
                  !form.stok || !form.vendor || form.id_vendor
                    ? true
                    : undefined
                }
                label="alamat"
                labelPlacement="inside"
                placeholder="Masukkan alamat!"
                value={form.alamat || ""}
                onValueChange={(val) => setForm({ ...form, alamat: val })}
              />
            </>
          )}
        </>
      )}
      <Input
        variant="bordered"
        type="text"
        label="Satuan"
        placeholder="Masukkan satuan!"
        value={form.satuan}
        onValueChange={(val) => setForm({ ...form, satuan: val })}
      />
      <HargaGenerator
        form={form}
        setForm={setForm}
        className={classCompByRole}
      />
      <MyDatePicker
        form={form}
        setForm={setForm}
        field="tanggalHarga"
        label="Tanggal Harga"
      />
      {form.modalmode == "Tambah" && form.stok > 0 && (
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
          {form.lunas == "0" && (
            <>
              <Input
                variant="bordered"
                type="number"
                label="Terbayar"
                placeholder="Masukkan nominal!"
                value={form.terbayar}
                onValueChange={(val) => setForm({ ...form, terbayar: val })}
              />
              <MyDatePicker
                form={form}
                setForm={setForm}
                field="jatuhTempo"
                label="Jatuh Tempo"
              />
            </>
          )}
        </>
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

export const HargaGenerator = ({
  className,
  form,
  setForm,
  hideJual = false,
  extraLabelHargaModal = "",
}) => {
  return (
    <>
      <NumberInput
        variant="bordered"
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        className={className}
        label={`Harga Modal${extraLabelHargaModal}`}
        placeholder="Masukkan harga modal!"
        value={form.hargamodal}
        onValueChange={(val) => updateForm(setForm, { hargamodal: val })}
      />
      {!hideJual && (
        <>
          <NumberInput
            variant="bordered"
            hideStepper
            isWheelDisabled
            formatOptions={{
              useGrouping: false,
            }}
            className={className}
            label="Harga Jual"
            placeholder="Masukkan harga jual!"
            value={form.hargajual}
            onValueChange={(val) => updateForm(setForm, { hargajual: val })}
          />
          <NumberInput
            variant="bordered"
            hideStepper
            isWheelDisabled
            formatOptions={{
              useGrouping: false,
            }}
            className={className}
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
              updateForm(setForm, {
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
            className={className}
            label="Persen Provit (%)"
            placeholder="Masukkan persen provit!"
            value={
              Math.round(
                countPercentProvit(form.hargamodal, form.hargajual) * 100,
              ) / 100
            }
            onValueChange={(v) =>
              updateForm(setForm, {
                hargajual: Math.round(
                  countPriceByPercentProfit(form.hargamodal, v),
                ),
              })
            }
          />
        </>
      )}
    </>
  );
};
export const ModalProdukMasuk = ({
  form,
  setForm,
  mutate = () => {},
  isOpen,
  onOpenChange,
}) => {
  const onSimpanClick = async (onClose) => {
    const { method } = form;
    if (!method) return alert("Method tidak boleh kosong!");
    // if (form.jumlah <= 0 || form.harga < 0 || !form.harga)
    //   return alert("Jumlah, dan Harga wajib diisi!");
    const { jatuhTempo } = form;
    const res = await fetch(`${API_PATH}produkmasuk`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        harga: form.hargamodal,
        tanggal: dateHeroUIToMysql(form.tanggal),
        tanggalHarga: dateHeroUIToMysql(form.tanggalHarga),
        jatuhTempo: jatuhTempo ? dateHeroUIToMysql(jatuhTempo) : null,
      }),
    });
    const json = await res.json();
    if (!res.ok) return alert(json.message);
    mutate();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {method == "POST" ? "Tambah" : "Ubah"} Produk Masuk
            </ModalHeader>
            <ModalBody>
              <div>
                {form.id_kustom} | {form.nama} | {form.nmerek} | {form.tipe} |
                Stok: {form.stok}
              </div>
              <AutocompleteVendor form={form} setForm={setForm} />
              <NumberInput
                hideStepper
                isWheelDisabled
                formatOptions={{
                  useGrouping: false,
                }}
                label="Jumlah"
                placeholder="Masukkan jumlah!"
                value={form.jumlah}
                onValueChange={(val) => setForm({ ...form, jumlah: val })}
              />
              <MyDatePicker
                form={form}
                setForm={setForm}
                field="tanggal"
                label="Tanggal Masuk"
              />
              <MyCheckBox field="isUpdateHarga" form={form} setForm={setForm}>
                Update Harga
              </MyCheckBox>
              {form.isUpdateHarga && (
                <MyDatePicker
                  form={form}
                  setForm={setForm}
                  field="tanggalHarga"
                  label="Tanggal Harga"
                />
              )}
              {/* <NumberInput
                    hideStepper
                    isWheelDisabled
                    formatOptions={{
                      useGrouping: false,
                    }}
                    className={classCompByRole}
                    label={
                      <>
                        Harga Modal (Ref: <Harga harga={form.hargamodal} />)
                      </>
                    }
                    placeholder="Masukkan harga modal!"
                    value={form.harga}
                    onValueChange={(val) =>
                      updateForm(setForm, {
                        harga: val,
                        ...(form.hargamodal == val
                          ? { isUpdateHarga: false }
                          : {}),
                      })
                    }
                  /> */}
              <HargaGenerator
                // className={classCompByRole}
                form={form}
                setForm={setForm}
                hideJual={!form.isUpdateHarga}
                extraLabelHargaModal={` (Ref: ${number2Nominal(form.refHargaModal)})`}
              />
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
                  <MyDatePicker
                    form={form}
                    setForm={setForm}
                    field="jatuhTempo"
                    label="Jatuh Tempo"
                  />
                  <Input
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button color="primary" onPress={() => onSimpanClick(onClose)}>
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
export { FormProduct };
