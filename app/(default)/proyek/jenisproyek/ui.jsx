"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { RadioGroup, Radio, Badge } from "@heroui/react";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
const apiPath = getApiPath();
import { fIdProyek } from "@/app/utils/formatid";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  User,
  Chip,
  Tooltip,
  ChipProps,
  getKeyValue,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Input } from "@heroui/react";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Accordion, AccordionItem } from "@heroui/react";
import Link from "next/link";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  NoteIcon,
  ReportMoneyIcon,
  FileExportIcon,
  DangerTriangleBrokenIcon,
  BusinessProgressBarIcon,
} from "@/components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import {
  capitalizeEachWord,
  highRoleCheck,
  key2set,
  renderQueryStates,
  rolesCheck,
  set2key,
} from "@/app/utils/tools";
import { FileUploader } from "@/components/input";
import { RangeDate } from "@/components/input";
import {
  LinkOpenNewTab,
  TableHeaderWithAddButton,
} from "@/components/mycomponent";
import Harga from "@/components/harga";
import { ShowHideComponent } from "@/components/componentmanipulation";
import DatePicker from "react-datepicker";
import { useReactToPrint } from "react-to-print";
import {
  deleteJenisProyek,
  saveJenisProyek,
} from "@/services/jenis-proyek.service";
import {
  useJenisProyekColumns,
  useJenisProyek,
} from "@/hooks/useJenisProyekColumns";
import JenisProyekModal from "@/components/jenis-proyek/JenisProyekModal";
import renderJenisProyekTableCell from "@/components/jenis-proyek/JenisProyekTableCell";
import { TITLE_STYLE } from "@/app/utils/const";

export default function App() {
  const { data: session } = useSession();
  const sessUser = session?.user;

  const [selectedKeys, setSelectedKeys] = useState(new Set([]));

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const offset = (page - 1) * rowsPerPage;

  const printProyekRef = useRef(null);
  const handlePrintProyek = useReactToPrint({
    // content: () => printProyekRef.current,
    contentRef: printProyekRef,
    pageStyle: "bg-white block",
    documentTitle: "Daftar Proyek",
  });

  const jenisProyek = useJenisProyek({ limit: rowsPerPage, offset });
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
      if (res.status == 400) return alert(json.message);
      proyek.mutate();
    }
  };

  const isHighRole = highRoleCheck(sessUser?.rank);
  const columns = useJenisProyekColumns(isHighRole);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();
  const queryStates = renderQueryStates({ jenisProyek }, session);
  if (queryStates) return queryStates;

  const pages = Math.ceil(dataJenisProyek.data[0]?.total / rowsPerPage);
  return (
    <div className="flex flex-col gap-2 w-7/8- h-3/4">
      <Table
        isStriped
        className=""
        aria-label="Example table with custom cells"
        // selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
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
                    {renderJenisProyekTableCell({
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
      <JenisProyekModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        form={form}
        setForm={setForm}
        onSave={saveButtonPress}
      />
    </div>
  );
}
