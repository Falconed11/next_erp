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
import { useClientFetch } from "@/hooks/useClientFetch";
import { getDateFId } from "@/app/utils/date";
import {
  TRANSAKSI_ENDPOINT,
  saveTransaksi,
  deleteTransaksi,
} from "@/services/transaksi.service";
import {
  highRoleCheck,
  key2set,
  renderQueryStates,
  rolesCheck,
  set2key,
  updateForm,
} from "@/app/utils/tools";
import { TableHeaderWithAddButton } from "@/components/mycomponent";
import { useSession } from "next-auth/react";
import { renderDefaultTableCell } from "@/components/default/DefaultTable";
import Harga, { NumberComp } from "@/components/harga";
import { API_PATH } from "@/app/utils/apiconfig";
import { useTransaksiColumns } from "@/hooks/useTransaksi.hooks";
import { ModalJurnal } from "@/components/transaksi/transaksi";
import { fetchJurnalById } from "@/services/transaksi/jurnal.service";

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
    onOpen();
    setIsLoading(true);
    const jurnal = await fetchJurnalById(data.id_jurnal);
    const res = await jurnal.json();
    setForm({ ...res.data, method: "PATCH" });
    setIsLoading(false);
  };
  const isAuthorized =
    highRoleCheck(sessionUser?.role) ||
    rolesCheck(["admin"], sessionUser?.peran);
  const columns = useTransaksiColumns(isAuthorized);

  const loadingState = transaksiData?.isLoading ? "loading" : "idle";
  const queryState = renderQueryStates({ transaksiData }, session);
  if (queryState) return queryState;
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
        id_karyawan: sessionUser?.id_karyawan,
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

  const addExtraColumnHandlers = (data) => {
    return {
      tanggal: () => getDateFId(data.tanggal),
      debit: () => <NumberComp value={data.tipe == 1 ? data.amount : 0} />,
      kredit: () => <NumberComp value={data.tipe == 0 ? data.amount : 0} />,
    };
  };

  return (
    <div className="w-full">
      <ModalJurnal
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitForm}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isLoading={isLoading}
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
