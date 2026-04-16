"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Tooltip,
  Pagination,
  Spinner,
  Autocomplete,
  AutocompleteItem,
  Select,
} from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AddIcon, DeleteIcon } from "@/components/icon";
import { SelectPerusahaan } from "@/components/perusahaan/perusahaan";
import { useClientFetch } from "@/hooks/useClientFetch";
import { getDateFId, getDate } from "@/app/utils/date";
import {
  TRANSAKSI_ENDPOINT,
  saveTransaksi,
  deleteTransaksi,
} from "@/services/transaksi.service";
import {
  highRoleCheck,
  key2set,
  renderQueryStates,
  set2key,
  updateForm,
} from "@/app/utils/tools";
import { TableHeaderWithAddButton } from "@/components/mycomponent";
import { useSession } from "next-auth/react";
import { AutocompleteCoa, SelectDebitKredit } from "@/components/coa/coa";
import { DefaultNumberInput } from "@/components/default/DefaultInput";
import { renderDefaultTableCell } from "@/components/default/DefaultTable";
import Harga, { NumberComp } from "@/components/harga";
import { API_PATH } from "@/app/utils/apiconfig";

const TransaksiForm = ({ form, setForm, onSubmit, isOpen, onOpenChange }) => {
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
              Tambah Jurnal
            </ModalHeader>
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
                      <AutoCompleteCoaInTransaksi
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
                      <div className="flex items-end bg-green-400">
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

const AutoCompleteCoaInTransaksi = ({
  parentSetForm,
  transaksi,
  index,
  trx,
}) => {
  const [form, setForm] = useState(trx);
  useEffect(() => {
    transaksi[index] = { ...form, ...trx };
    updateForm(parentSetForm, { transaksi: [...transaksi] });
  }, [form]);
  return (
    <AutocompleteCoa form={form} setForm={setForm} disallowEmptySelection />
  );
};

export default function TransaksiUI() {
  const session = useSession();
  const { user: sessionUser } = session?.data || {};
  const [page, setPage] = useState(1);
  const rowsPerPage = 25;
  const offset = (page - 1) * rowsPerPage;
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    id_perusahaan: "",
    transaksi: [],
    method: "POST",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const transaksiData = useClientFetch(
    `${TRANSAKSI_ENDPOINT}?limit=${rowsPerPage}&offset=${offset}`,
  );

  const pages = useMemo(() => {
    return transaksiData?.data?.count
      ? Math.ceil(transaksiData.data.count / rowsPerPage)
      : 0;
  }, [transaksiData?.data?.count]);

  const handleEditForm = async (data) => {
    setIsLoading(true);
    const jurnal = await fetch(
      `${API_PATH}${TRANSAKSI_ENDPOINT}/${data.id_jurnal}`,
    );
    const res = await jurnal.json();
    setForm({ ...res.data, method: "PATCH" });
    setIsLoading(false);
    onOpen();
    // setForm({
    //   tanggal: "",
    //   keterangan: "",
    //   id_perusahaan: "",
    //   transaksi: [],
    //   method: "POST",
    // });
    // onOpen();
  };

  const loadingState = transaksiData?.isLoading ? "loading" : "idle";
  if (isLoading) return <Spinner />;
  const queryState = renderQueryStates({ transaksiData }, session);
  if (queryState) return queryState;
  const isHighRole = highRoleCheck(sessionUser.role);

  // console.log(form);

  const handleOpenForm = () => {
    setForm({
      tanggal: "",
      keterangan: "",
      id_perusahaan: "",
      transaksi: [],
      method: "POST",
    });
    onOpen();
  };
  const handleSubmitForm = async (onClose) => {
    if (!form.tanggal || !form.id_perusahaan) {
      return alert("Tanggal dan Perusahaan harus diisi");
    }
    if (!form.transaksi || form.transaksi.length < 2) {
      return alert("Minimal ada 2 transaksi");
    }
    try {
      const res = await saveTransaksi({
        ...form,
        id: form.method === "PATCH" ? form.id : undefined,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Gagal menyimpan transaksi");
        return;
      }
      transaksiData.mutate();
      onClose();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Hapus jurnal ini?")) return;

    try {
      const res = await deleteTransaksi(id);
      if (!res.ok) {
        const json = await res.json();
        alert(json.message || "Gagal menghapus");
        return;
      }
      alert("Jurnal berhasil dihapus");
      transaksiData.mutate();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const columns = [
    { key: "aksi", label: "Aksi" },
    { key: "id_jurnal", label: "Id Jurnal" },
    { key: "coa", label: "COA" },
    { key: "tanggal", label: "Tanggal" },
    { key: "debit", label: "Debit" },
    { key: "kredit", label: "Kredit" },
    { key: "perusahaan", label: "Perusahaan" },
  ];

  const addExtraColumnHandlers = (data) => {
    return {
      tanggal: () => getDateFId(data.tanggal),
      debit: () => <NumberComp value={data.tipe == 1 ? data.amount : 0} />,
      kredit: () => <NumberComp value={data.tipe == 0 ? data.amount : 0} />,
    };
  };

  console.log(form);
  return (
    <div className="w-full">
      <TransaksiForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitForm}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
      {/* Transaksi Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          aria-label="Jurnal Transaksi Table"
          topContent={
            <TableHeaderWithAddButton
              isHighRole={true}
              title="Jurnal Transaksi"
              onPress={handleOpenForm}
            />
          }
          bottomContent={
            pages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  color="secondary"
                  page={page}
                  total={pages}
                  onChange={(p) => setPage(p)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                align={column.key === "aksi" ? "center" : "start"}
                allowsSorting
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={transaksiData?.data?.data ?? []}
            loadingContent={"Loading..."}
            emptyContent={"Tidak ada data jurnal"}
            loadingState={loadingState}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell
                    align={
                      columnKey === "debit" || columnKey === "kredit"
                        ? "right"
                        : "start"
                    }
                  >
                    {renderDefaultTableCell({
                      data: item,
                      columnKey,
                      onEdit: handleEditForm,
                      onDelete: handleDelete,
                      addExtraColumnHandlers,
                    })}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
