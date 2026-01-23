"use client";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { highRoleCheck, renderQueryStates } from "@/app/utils/tools";
import { TableHeaderWithAddButton } from "@/components/mycomponent";
import {
  deleteJenisProyek,
  saveJenisProyek,
} from "@/services/jenis-proyek.service";
import { useDefaultFetch, useDefaultColumns } from "@/hooks/useDefault";
import DefaultModal from "@/components/default/DefaultModal";
import renderDefaultTableCell from "@/components/default/defaulttablecell";

export default function App() {
  const { data: session } = useSession();
  const sessUser = session?.user;

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));

  const [page, setPage] = useState(1);
  const rowsPerPage = 1;
  const offset = (page - 1) * rowsPerPage;

  const jenisProyek = useDefaultFetch({
    endPoint: "v2/jenis-proyek",
    limit: rowsPerPage,
    offset,
  });
  const dataJenisProyek = jenisProyek?.data;

  const [form, setForm] = useState({});

  const loadingState = jenisProyek.isLoading ? "loading" : "idle";
  const saveButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await saveJenisProyek(form);
    const json = await res.json();
    if (!res.ok) return alert(json.message);
    jenisProyek.mutate();
    onClose();
    //return alert(json.message);
  };
  const tambahButtonPress = () => {
    const now = new Date();
    const idKaryawan = sessUser.id_karyawan;
    setForm({
      method: "POST",
      nama: "",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      method: "PATCH",
      modalmode: "Edit",
    });
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus jenis proyek?")) {
      const res = await deleteJenisProyek(id);
      // return alert(await res.json().then((json) => json.message));
      const json = await res.json();
      if (!res.ok) return alert(json.message);
      jenisProyek.mutate();
      setPage(1);
    }
  };

  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useDefaultColumns(isHighRole);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const queryStates = renderQueryStates({ jenisProyek }, session);
  if (queryStates) return queryStates;

  const pages = Math.ceil(dataJenisProyek.data[0]?.total / rowsPerPage);
  console.log(dataJenisProyek);
  return (
    <div className="flex flex-col gap-2">
      <Table
        isStriped
        className="min-h-[40px]"
        aria-label="Example table with custom cells"
        topContent={
          <TableHeaderWithAddButton
            title="Jenis Proyek"
            isHighRole={isHighRole}
            onPress={tambahButtonPress}
          />
        }
        bottomContent={
          pages > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={dataJenisProyek.data}
          loadingContent={"Loading..."}
          emptyContent={"Kosong"}
          loadingState={loadingState}
        >
          {(item) => {
            if (!item.id) return;
            return (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>
                    {renderDefaultTableCell({
                      data: item,
                      columnKey,
                      onEdit: editButtonPress,
                      onDelete: deleteButtonPress,
                    })}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
      <DefaultModal
        name="Jenis Proyek"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        form={form}
        setForm={setForm}
        onSave={saveButtonPress}
      />
    </div>
  );
}
