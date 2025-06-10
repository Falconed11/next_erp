"use client";
import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { RadioGroup, Radio } from "@heroui/react";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
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
} from "@/components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import { FileUploader } from "@/components/input";
import { RangeDate } from "@/components/input";
import { LinkOpenNewTab } from "@/components/mycomponent";
import Harga from "@/components/harga";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App({ id_instansi }) {
  const [sort, setSort] = React.useState("tanggal_penawaran");
  const [isLoading, setIsLoading] = useState(0);
  const session = useSession();

  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  const [current, setCurrent] = useState({});
  const laporan = useClientFetch(
    `laporanpenawaran?${
      current.startDate ? `&start=${getDate(current.startDate)}` : ""
    }${current.endDate ? `&end=${getDate(current.endDate)}` : ""}`
  );

  const saveButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await fetch(`${apiPath}proyek`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    //return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      nama: "",
      klien: "",
      instansi: "",
      kota: "",
      selectkaryawan: "",
      selectperusahaan: "",
      selectcustomer: "",
      selectkategoriproyek: "",
      // selectstatus: "",
      isSwasta: "",
      tanggal: getDate(new Date()),
      startdate: new Date(),
      keterangan: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal_penawaran);
    setForm({
      ...data,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
      selectkaryawan: new Set([String(data.id_karyawan)]),
      selectperusahaan: new Set([String(data.id_perusahaan)]),
      id_instansi: data.id_instansi,
      instansi: data.instansi,
      selectkategoriproyek: new Set([String(data.id_kategoriproyek)]),
      // selectstatus: String(data.id_statusproyek),
      isSwasta: String(data.swasta),
    });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus proyek?")) {
      const res = await fetch(`${apiPath}proyek`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      // return alert(await res.json().then((json) => json.message));
    }
  };

  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggalproduk = getDate(new Date(v.tanggalproduk));
      v.tanggalproyek = getDate(new Date(v.tanggalproyek));
      return v;
    });
    setJson(jsonData);
    // console.log(json);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}proyek`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ ...v, id_second: v.id }),
          })
        )
      );
      const dataArray = await Promise.all(
        responses.map((response) => response.json())
      );
      setReportList(dataArray.map((v, i) => `${i + 1}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };
  const handleButtonExportToExcelPress = () => {
    const rows = proyek.data.map((v) => {
      const totalHarga = (v.hargakustom ?? v.hargajual) * v.jumlah;
      return v;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(
      workbook,
      `proyek_${getDateF(filter.startDate)}_${getDateF(filter.endDate)}.xlsx`,
      { compression: true }
    );
  };
  const handleExportButtonPress = (proyek) => {
    const data = penawaran.filter((v) => v.selectedKeys.has(v.id_proyek));
    // console.log(data);
    // const worksheet = XLSX.utils.json_to_sheet(rows);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    // XLSX.writeFile(
    //   workbook,
    //   `proyek_${getDateF(filter.startDate)}_${getDateF(filter.endDate)}.xlsx`,
    //   { compression: true }
    // );
  };
  const exportPenawaran = () => {
    if (selectedKeys.size == 0) return alert("Proyek belum dipilih");
    const data = penawaran.data.filter((v) =>
      selectedKeys.has(String(v.id_proyek))
    );
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(workbook, `exportpenawaran-${getDateF(new Date())}.xlsx`, {
      compression: true,
    });
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "status":
        return data.versi == -1 ? (
          "reject"
        ) : data.versi > 0 ? (
          "deal"
        ) : data.pengeluaranproyek > 0 ? (
          <Tooltip
            color="warning"
            content="Proyek Berjalan. Belum ada penawaran."
          >
            <div
              // onClick={() => editButtonPress(data)}
              className="text-4xl text-warning cursor-help active:opacity-50 text-center"
            >
              <DangerTriangleBrokenIcon />
            </div>
          </Tooltip>
        ) : (
          "penawaran"
        );
      case "nilaipenawaran":
      case "nilaipenawarandeal":
      case "nilaipenawaranwaiting":
      case "nilaipenawaranreject":
        return (
          <div className="text-right">
            <Harga harga={+cellValue} />
          </div>
        );
      case "action":
        return (
          <div className="relative flex items-center gap-2">
            <LinkOpenNewTab
              content="Detail"
              link={`/proyek?id_karyawan=${data.id}&start=${getDate(
                data.startDate
              )}&end=${getDate(data.endDate)}`}
              icon={<NoteIcon />}
            />
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const report = useDisclosure();

  if (isLoading) return <div>loading...</div>;
  if (laporan.error) return <div>failed to load</div>;
  if (laporan.isLoading) return <div>loading...</div>;
  if (session.data?.user == undefined) return <div>loading...</div>;

  const user = session.data?.user;

  const data = laporan.data.map((v) => ({
    ...v,
    startDate: current.startDate ?? "",
    endDate: current.endDate ?? "",
  }));

  const columns = [
    // {
    //   key: "id",
    //   label: "Id",
    // },
    // {
    //   key: "id",
    //   label: "Id Karyawan",
    // },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "jumlahpenawaran",
      label: "Jumlah Penawaran",
    },
    {
      key: "jumlahpenawaranwaiting",
      label: "Jumlah Penawaran Menunggu",
    },
    {
      key: "jumlahpenawarandeal",
      label: "Jumlah Penawaran Deal",
    },
    {
      key: "jumlahpenawaranreject",
      label: "Jumlah Penawaran Reject",
    },
    {
      key: "nilaipenawaran",
      label: "Nilai Penawaran",
    },
    {
      key: "nilaipenawarandeal",
      label: "Nilai Penawaran Deal",
    },
    {
      key: "nilaipenawaranwaiting",
      label: "Nilai Penawaran Menunggu",
    },
    {
      key: "nilaipenawaranreject",
      label: "Nilai Penawaran Reject",
    },
    {
      key: "action",
      label: "Aksi",
    },
  ];

  console.log(getDate(current.startDate));

  return (
    <div className="flex flex-col gap-2">
      <Table
        isStriped
        // className="pt-3"
        aria-label="Example table with custom cells"
        // selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        topContent={
          <>
            <div>Filter</div>
            <div className="flex flex-row gap-2">
              <div className="flex">
                <RangeDate current={current} setCurrent={setCurrent} />
              </div>
            </div>
          </>
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
        <TableBody items={data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
