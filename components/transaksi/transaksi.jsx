import { useMemo } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
} from "@heroui/react";
import DatePicker from "react-datepicker";
import { SelectPerusahaan } from "../perusahaan/perusahaan";
import { AutoCompleteCoaInJurnal, SelectDebitKredit } from "../coa/coa";
import { DefaultNumberInput } from "../default/DefaultInput";
import { AddIcon, DeleteIcon } from "../icon";
import "react-datepicker/dist/react-datepicker.css";
import Harga from "../harga";
import { key2set, set2key, updateForm } from "@/app/utils/tools";
import { getDate } from "@/app/utils/date";

export const ModalJurnal = ({
  form,
  setForm,
  onSubmit,
  isOpen,
  onOpenChange,
  isLoading,
}) => {
  const totals = useMemo(
    () =>
      (form.transaksi || []).reduce(
        ({ debit, kredit }, { tipe, amount }) => {
          if (tipe == 1) {
            debit += +amount || 0;
          } else {
            kredit += +amount || 0;
          }
          return { debit, kredit };
        },
        { debit: 0, kredit: 0 },
      ),
    [form.transaksi],
  );
  totals.difference = Math.abs(totals.debit - totals.kredit);
  totals.isBalanced = totals.difference <= 0.01;
  const handleAddTransaksi = () => {
    setForm({
      ...form,
      transaksi: [
        ...(form.transaksi || []),
        { tipe: 1, id_coa: "", coa: "", amount: 0 },
      ],
    });
  };
  const handleRemoveTransaksi = (index) => {
    const newTransaksi = form.transaksi.filter((_, i) => i !== index);
    setForm({ ...form, transaksi: newTransaksi });
  };
  const updateFormHelper = (form, setForm, label, field, index, trx, value) => {
    const { [label]: section } = form;
    section[index] = { ...trx, [field]: value };
    updateForm(setForm, { [label]: [...section] });
  };
  const getFirstDuplicate = (arr, field) => {
    const seen = new Set();
    for (const obj of arr) {
      if (seen.has(obj[field])) return obj[field];
      seen.add(obj[field]);
    }
    return null; // Return null if everything is unique
  };
  const duplicateCoa = useMemo(
    () => getFirstDuplicate(form.transaksi || [], "coa"),
    [form.transaksi],
  );
  // if (isLoading) return <Spinner />;
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {form.method == "PATCH" ? "Edit" : "Tambah"} Jurnal
            </ModalHeader>
            {isLoading ? (
              <Spinner />
            ) : (
              <ModalBody className="gap-4">
                {/* Header Form */}
                <div className="flex">
                  <div className="z-50 bg-gray-100 p-2 rounded-lg border">
                    <label className="text-sm font-medium mb-2 block">
                      Tanggal
                    </label>
                    <DatePicker
                      selected={form.tanggal ? new Date(form.tanggal) : null}
                      onChange={(date) =>
                        updateForm(setForm, {
                          tanggal: date ? getDate(date) : "",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                      placeholderText="Pilih tanggal"
                    />
                  </div>
                </div>
                <SelectPerusahaan
                  form={form}
                  setForm={setForm}
                  disallowEmptySelection
                />
                {/* Keterangan */}
                <Textarea
                  variant="bordered"
                  label={`Keterangan ( ${form.keterangan?.length || 0}/200 )`}
                  placeholder="Masukkan keterangan jurnal"
                  value={form.keterangan || ""}
                  onValueChange={(value) =>
                    setForm({ ...form, keterangan: value })
                  }
                  className="w-full"
                />
                {/* Transaksi Table */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Detail Transaksi</h3>
                    <Button
                      isIconOnly
                      className="bg-blue-500 text-white"
                      onPress={handleAddTransaksi}
                    >
                      <AddIcon />
                    </Button>
                  </div>
                  {/* Transaksi Items */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(form.transaksi || []).map((trx, index) => (
                      <div
                        key={index}
                        className="flex gap-2 p-3 bg-gray-50 rounded-lg border"
                      >
                        <SelectDebitKredit
                          disallowEmptySelection
                          selectedKeys={key2set(trx.tipe)}
                          onSelectionChange={(v) =>
                            updateFormHelper(
                              form,
                              setForm,
                              "transaksi",
                              "tipe",
                              index,
                              trx,
                              set2key(v),
                            )
                          }
                        />
                        <AutoCompleteCoaInJurnal
                          parentSetForm={setForm}
                          transaksi={form.transaksi}
                          trx={trx}
                          index={index}
                        />
                        <DefaultNumberInput
                          variant="bordered"
                          label="Jumlah"
                          placeholder="Masukkan jumlah!"
                          value={trx.amount}
                          onValueChange={(v) =>
                            updateFormHelper(
                              form,
                              setForm,
                              "transaksi",
                              "amount",
                              index,
                              trx,
                              v,
                            )
                          }
                        />
                        <div className="grid items-end content-center">
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            onPress={() => handleRemoveTransaksi(index)}
                            className="text-xl"
                          >
                            <DeleteIcon />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Summary */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {[
                        {
                          label: "Total Debit",
                          value: totals.debit,
                          color: "text-blue-600",
                        },
                        {
                          label: "Total Kredit",
                          value: totals.kredit,
                          color: "text-red-600",
                        },
                        {
                          label: "Selisih",
                          value: Math.abs(totals.debit - totals.kredit),
                          color: totals.isBalanced
                            ? "text-green-600"
                            : "text-red-600",
                        },
                      ].map((data, i) => (
                        <div key={i}>
                          <p className="text-gray-600">{data.label}</p>
                          <p className={`text-lg font-bold ${data.color}`}>
                            <Harga harga={data.value} />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {[
                    ...(form.tanggal ? [] : ["Tanggal harus diisi"]),
                    ...(form.id_perusahaan ? [] : ["Perusahaan harus dipilih"]),
                    ...(form.transaksi && form.transaksi.length > 1
                      ? []
                      : ["Minimal harus ada 2 transaksi"]),
                    ...(totals.isBalanced
                      ? []
                      : ["Debit dan Kredit harus sama (seimbang)"]),
                    ...(!(totals.debit || totals.kredit)
                      ? ["Debit atau Kredit harus diisi"]
                      : []),
                    ...(duplicateCoa
                      ? [`COA "${duplicateCoa}" tidak boleh duplikat`]
                      : []),
                  ].map((msg, i) => (
                    <div
                      key={i}
                      className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-red-700 text-sm font-semibold">
                        ⚠️ {msg}
                      </p>
                    </div>
                  ))}
                </div>
              </ModalBody>
            )}
            <ModalFooter>
              <Button color="danger" onPress={onClose}>
                Batal
              </Button>
              <Button
                color="primary"
                onPress={() => onSubmit(onClose)}
                isDisabled={
                  totals.difference > 0.01 ||
                  !form.id_perusahaan ||
                  !form.tanggal ||
                  form.transaksi.length < 2 ||
                  !(totals.debit || totals.kredit)
                }
              >
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// const reportForm = {
//   nama: "Rugi Laba",
//   from,
//   to,
//   child: [
//     {
//       nama: "Gross Profit",
//       child: [
//         {
//           nama: "Pendapatan",
//           child: [
//             { nama: "Barang", child: [{ coa: 1 }, { coa: 2 }] },
//             { nama: "Jasa", child: [{ coa: 3 }] },
//           ],
//         },
//         {
//           nama: "HPP",
//           child: [
//             { nama: "HPP", child: [{ coa: 4 }] },
//             { nama: "Penyesuaian", child: [{ coa: 5 }] },
//           ],
//         },
//       ],
//     },
//   ],
// };
