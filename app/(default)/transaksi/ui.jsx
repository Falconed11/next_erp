"use client";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Pagination,
} from "@heroui/react";
import { useClientFetch } from "@/hooks/useClientFetch";
import { getDate, getDateFId } from "@/app/utils/date";
import {
  TRANSAKSI_ENDPOINT,
  saveTransaksi,
  deleteTransaksi,
} from "@/services/transaksi.service";
import {
  highRoleCheck,
  renderQueryStates,
  rolesCheck,
} from "@/app/utils/tools";
import {
  TableHeaderWithAddButton,
  OpenBlueLinkInNewTab,
} from "@/components/mycomponent";
import { renderDefaultTableCell } from "@/components/default/DefaultTable";
import { NumberComp } from "@/components/harga";
import { useTransaksiColumns } from "@/hooks/useTransaksi.hooks";
import { ModalJurnal } from "@/components/transaksi/transaksi";
import { fetchJurnalById } from "@/services/transaksi/jurnal.service";

export default function TransaksiUI({ user }) {
  const sessionUser = user;
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const offset = (page - 1) * rowsPerPage;
  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    id_perusahaan: "",
    id_proyek: "",
    transaksi: [],
    method: "POST",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const transaksiData = useClientFetch(
    `${TRANSAKSI_ENDPOINT}?limit=${rowsPerPage}&offset=${offset}`,
  );
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
  const queryState = renderQueryStates({ transaksiData });
  if (queryState) return queryState;
  const pages = Math.ceil(transaksiData.data.data[0]?.total / rowsPerPage);
  const handleOpenForm = () => {
    setForm({
      tanggal: getDate(new Date()),
      keterangan: "",
      id_perusahaan: "",
      id_proyek: "",
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
        sessIdKaryawan: sessionUser?.id_karyawan,
      });
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
  const handleDelete = async (id, { id_jurnal }) => {
    if (!confirm(`Hapus jurnal id: ${id_jurnal}?`)) return;

    try {
      const res = await deleteTransaksi(id_jurnal);
      if (!res.ok) {
        alert(json.message || "Gagal menghapus");
        return;
      }
      transaksiData.mutate();
      alert("Jurnal berhasil dihapus");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const addExtraColumnHandlers = (data) => {
    return {
      tanggal: () => getDateFId(data.tanggal),
      debit: () => <NumberComp value={data.tipe == 1 ? data.amount : 0} />,
      kredit: () => <NumberComp value={data.tipe == 0 ? data.amount : 0} />,
      id_proyek: () =>
        data.id_proyek ? (
          <OpenBlueLinkInNewTab link={`/proyek?id_proyek=${data.id_proyek}`}>
            {data.id_proyek}
          </OpenBlueLinkInNewTab>
        ) : (
          "-"
        ),
    };
  };
  console.log(form);
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
          isStriped
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
                  color="primary"
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
