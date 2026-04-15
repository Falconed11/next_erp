"use client";
import React, { useState, useMemo } from "react";
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
import { useFilter } from "@react-aria/i18n";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AddIcon, EditIcon, DeleteIcon } from "@/components/icon";
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
  renderQueryStates,
  updateForm,
} from "@/app/utils/tools";
import { TableHeaderWithAddButton } from "@/components/mycomponent";
import { useSession } from "next-auth/react";
import { AutocompleteCoa, SelectDebitKredit } from "@/components/coa/coa";
import { DefaultNumberInput } from "@/components/default/DefaultInput";

const TransaksiForm = ({ form, setForm, onSubmit, isOpen, onOpenChange }) => {
  const totals = useMemo(() => {
    const debit = (form.transaksi || [])
      .filter((t) => t.tipe === 1)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const kredit = (form.transaksi || [])
      .filter((t) => t.tipe === 0)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    return { debit, kredit, isBalanced: Math.abs(debit - kredit) < 0.01 };
  }, [form.transaksi]);
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
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Tambah Jurnal
            </ModalHeader>
            <ModalBody className="gap-4">
              {/* Header Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="z-50">
                  <label className="text-sm font-medium mb-2 block">
                    Tanggal *
                  </label>
                  <DatePicker
                    selected={form.tanggal ? new Date(form.tanggal) : null}
                    onChange={(date) =>
                      updateForm(setForm, {
                        tanggal: date ? getDate(date) : "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholderText="Pilih tanggal"
                  />
                </div>
                <SelectPerusahaan
                  form={form}
                  setForm={setForm}
                  disallowEmptySelection
                />
              </div>
              {/* Keterangan */}
              <Textarea
                variant="bordered"
                label="Keterangan"
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
                        form={form}
                        setForm={setForm}
                      />
                      <AutocompleteCoa
                        key={index}
                        form={form}
                        setForm={setForm}
                        disallowEmptySelection
                      />
                      <DefaultNumberInput
                        variant="bordered"
                        field="amount"
                        form={form}
                        setForm={setForm}
                        label="Jumlah"
                        placeholder="Masukkan jumlah!"
                      />
                      <div className="flex items-end">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => handleRemoveTransaksi(index)}
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
                    <div>
                      <p className="text-gray-600">Total Debit</p>
                      <p className="text-lg font-bold text-blue-600">
                        {totals.debit.toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Kredit</p>
                      <p className="text-lg font-bold text-red-600">
                        {totals.kredit.toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Selisih</p>
                      <p
                        className={`text-lg font-bold ${
                          totals.isBalanced ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(totals.debit - totals.kredit).toLocaleString(
                          "id-ID",
                          {
                            minimumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {!totals.isBalanced && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-semibold">
                      ⚠️ Debit dan Kredit harus sama (seimbang)
                    </p>
                  </div>
                )}
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
                  !totals.isBalanced ||
                  !form.id_perusahaan ||
                  !form.tanggal ||
                  form.transaksi.length === 0
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const transaksiData = useClientFetch(
    `${TRANSAKSI_ENDPOINT}?limit=${rowsPerPage}&offset=${offset}`,
  );

  const pages = useMemo(() => {
    return transaksiData?.data?.count
      ? Math.ceil(transaksiData.data.count / rowsPerPage)
      : 0;
  }, [transaksiData?.data?.count]);

  const loadingState = transaksiData?.isLoading ? "loading" : "idle";
  const queryState = renderQueryStates({ transaksiData }, session);
  if (queryState) return queryState;
  const isHighRole = highRoleCheck(sessionUser.role);

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
  const handleEditForm = (data) => {
    setForm({
      ...data,
      method: "PATCH",
    });
    onOpen();
  };
  const handleSubmitForm = async (onClose) => {
    if (!form.tanggal || !form.id_perusahaan) {
      return alert("Tanggal dan Perusahaan harus diisi");
    }
    if (!form.transaksi || form.transaksi.length === 0) {
      return alert("Minimal ada 1 transaksi");
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

      alert("Transaksi berhasil disimpan");
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
  const formatCurrency = (num) => {
    return Math.abs(num).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
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
          <TableHeader>
            <TableColumn>ID JURNAL</TableColumn>
            <TableColumn>TANGGAL</TableColumn>
            <TableColumn align="right">DEBIT</TableColumn>
            <TableColumn align="right">KREDIT</TableColumn>
            <TableColumn>PERUSAHAAN</TableColumn>
            <TableColumn align="center">AKSI</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              loadingState === "loading"
                ? "Loading..."
                : "Tidak ada data jurnal"
            }
          >
            {(transaksiData?.data?.data ?? []).map((item) => {
              // Calculate debit and kredit for this journal
              const debit =
                item.transaksi
                  ?.filter((t) => t.tipe === 1)
                  .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) ||
                0;
              const kredit =
                item.transaksi
                  ?.filter((t) => t.tipe === 0)
                  .reduce(
                    (sum, t) => sum + Math.abs(parseFloat(t.amount) || 0),
                    0,
                  ) || 0;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">
                    {item.id_jurnal}
                  </TableCell>
                  <TableCell>{getDateFId(item.tanggal)}</TableCell>
                  <TableCell
                    align="right"
                    className="text-blue-600 font-semibold"
                  >
                    {formatCurrency(debit)}
                  </TableCell>
                  <TableCell
                    align="right"
                    className="text-red-600 font-semibold"
                  >
                    {formatCurrency(kredit)}
                  </TableCell>
                  <TableCell>{item.nama_perusahaan}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      <Tooltip content="Edit">
                        <Button
                          isIconOnly
                          variant="light"
                          onPress={() => handleEditForm(item)}
                        >
                          <EditIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => handleDelete(item.id)}
                        >
                          <DeleteIcon />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
