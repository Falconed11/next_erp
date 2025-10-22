"use client";
import React, { useState, useMemo } from "react";
import { useClientFetch, getApiPath } from "../../utils/apiconfig";
import { penawaran } from "../../utils/formatid";
import {
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
import { Input, NumberInput } from "@heroui/react";
import { Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../../components/icon";
import { FileUploader } from "@/components/input";
import {
  getDate,
  getDateF,
  getCurFirstLastDay,
  excelToJSDate,
} from "@/app/utils/date";
import Harga from "@/components/harga";
import { RangeDate } from "@/components/input";
import Kategori from "./kategori";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSession } from "next-auth/react";
import { highRoleCheck } from "@/app/utils/tools";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const session = useSession();
  const sessUser = session.data?.user;
  const [filter, setFilter] = useState({
    startDate,
    endDate,
    selectKategori: new Set([]),
  });
  const [current, setCurrent] = useState({});
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;
  const kategorioperasionalkantor = useClientFetch("kategorioperasionalkantor");
  const karyawan = useClientFetch("karyawan");
  const operasionalkantor = useClientFetch(
    `operasionalkantor?start=${getDate(current.startDate)}&end=${getDate(
      current.endDate
    )}&id_kategori=${
      filter.selectKategori.values().next().value
        ? filter.selectKategori.values().next().value
        : ""
    }`
  );
  const queries = { kategorioperasionalkantor, karyawan, operasionalkantor };
  const pages = useMemo(() => {
    return operasionalkantor?.data
      ? Math.ceil(operasionalkantor?.data?.length / rowsPerPage)
      : 0;
  }, [operasionalkantor?.data?.length, rowsPerPage]);
  const loadingState = operasionalkantor.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;
  const [form, setForm] = useState({ tanggal: new Date() });
  const [json, setJson] = useState([]);

  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}operasionalkantor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
              tanggal: v.tanggal ?? "",
              karyawan: v.karyawan ?? "",
              kategori: v.kategori ?? "",
              keterangan: v.keterangan ?? "",
              biaya: v.biaya ?? "",
            }),
          })
        )
      );
      const dataArray = await Promise.all(
        responses.map((response) => response.json())
      );
      setReportList(dataArray.map((v, i) => `${i}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
    // return alert(`Upload Berhasil`);
  };
  const handleButtonExportToExcelPress = () => {
    const rows = operasionalkantor.data.map((row) => ({
      tanggal: getDateF(new Date(row.tanggal)),
      keterangan: row.keterangan,
      biaya: row.biaya,
      karyawan: row.karyawan,
      kategori: row.kategori,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(
      workbook,
      `operasionalkantor_${getDateF(filter.startDate)}_${getDateF(
        filter.endDate
      )}.xlsx`,
      { compression: true }
    );
  };
  const tambahButtonPress = async (method) => {
    // if (select.size == 0) return alert("Produk belum dipilih.");
    if (!form.tanggal || !form.id_karyawan || !form.biaya)
      return alert("Data belum lengkap");
    const res = await fetch(`${apiPath}operasionalkantor`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        id_kategorioperasionalkantor: form.id_kategorioperasionalkantor
          ?.values()
          ?.next()?.value,
        id_karyawan: form.id_karyawan?.values()?.next()?.value,
        tanggal: getDate(form.tanggal),
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    setForm({});
    operasionalkantor.mutate();
    // return alert(json.message);
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      id_karyawan: new Set([String(data.id_karyawan)]),
      id_kategorioperasionalkantor: new Set([
        String(data.id_kategorioperasionalkantor || ""),
      ]),
      modalmode: "Edit",
      tanggal: startdate,
    });
    onOpen();
    return;
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus operasinal kantor?")) {
      const res = await fetch(`${apiPath}operasionalkantor`, {
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
  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "biaya":
        return (
          <div className="text-right">
            <Harga harga={data.biaya} />
          </div>
        );
      case "aksi":
        const id_statusproyek = data.id_statusproyek;
        let link = ``;
        if (id_statusproyek == 1) {
          link = `/proyek/detail?id=${data.id}`;
        } else link = `/proyek/detail/proses?id=${data.id}`;

        return (
          <div className="relative flex items-center gap-2">
            {/* <Tooltip content="Detail">
              <Link href={link}>
                <span
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EyeIcon />
                </span>
              </Link>
            </Tooltip> */}
            <Tooltip content="Edit">
              <span
                onClick={() => editButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                onClick={() => deleteButtonPress(data.id)}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  if (session.status === "loading") return <div>Session Loading...</div>;
  const isHighRole = highRoleCheck(sessUser.rank);

  const col = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "karyawan",
      label: "Karyawan",
    },
    {
      key: "kategori",
      label: "Kategori",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
    {
      key: "biaya",
      label: "Biaya",
    },
  ];

  // const sumBiaya = operasionalkantor.data.reduce((acc, v) => {
  //   return acc + v.biaya;
  // });
  return (
    <>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2">
          <div className="bg-white p-3 rounded-lg">
            <div>Operasional Kantor</div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <FormOperasionalKantor
                  form={form}
                  setForm={setForm}
                  kategorioperasionalkantor={kategorioperasionalkantor}
                  karyawan={karyawan}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  onPress={() => {
                    tambahButtonPress("POST");
                  }}
                  color="primary"
                  className="ml-2"
                >
                  Tambah
                </Button>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-row gap-2">
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/operasionalkantor.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button
          color="primary"
          className=""
          onPress={handleButtonUploadExcelPress}
        >
          Upload Excel
        </Button>
      </div> */}
          <Table
            isStriped
            className="h-full w-full"
            aria-label="Example table with custom cells"
            topContent={
              <>
                <div>Filter</div>
                <div className="flex flex-row gap-3">
                  <div className="flex flex-row gap-2">
                    <div className="flex">
                      <RangeDate
                        current={current}
                        setCurrent={setCurrent}
                        setPage={setPage}
                      />
                    </div>
                  </div>
                  {/* kategori */}
                  <Select
                    label="Kategori"
                    placeholder="Pilih kategori!"
                    className="w-4/12"
                    selectedKeys={filter.selectKategori}
                    onSelectionChange={(v) =>
                      setFilter({ ...filter, selectKategori: v })
                    }
                  >
                    {kategorioperasionalkantor.data.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                {/* <div>
              <Button color="primary" onClick={handleButtonExportToExcelPress}>
                Export to Excel
              </Button>
            </div> */}
              </>
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
            <TableHeader columns={col}>
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
              items={operasionalkantor.data.slice(offset, offset + rowsPerPage)}
              loadingContent={"Loading..."}
              emptyContent={"Kosong"}
              loadingState={loadingState}
            >
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
        <div className="flex">
          <Kategori sessionuser={sessUser} />
        </div>
      </div>
      {/* Edit Operasional Kantor */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Operasional Kantor
              </ModalHeader>
              <ModalBody>
                <FormOperasionalKantor
                  form={form}
                  setForm={setForm}
                  kategorioperasionalkantor={kategorioperasionalkantor}
                  karyawan={karyawan}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setForm({});
                    onClose();
                  }}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    tambahButtonPress("PUT");
                    onClose();
                  }}
                >
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* upload report */}
      <Modal
        isOpen={report.isOpen}
        onOpenChange={report.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hasil Upload
              </ModalHeader>
              <ModalBody>
                {reportList.map((r, i) => (
                  <div key={i}>{r}</div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const FormOperasionalKantor = ({
  form,
  setForm,
  kategorioperasionalkantor,
  karyawan,
}) => {
  return (
    <>
      <div className="bg-gray-100 p-3 rounded-lg">
        <div>Tanggal</div>
        <DatePicker
          className="bg-white"
          placeholderText="Pilih tanggal"
          dateFormat="dd/MM/yyyy"
          selected={form.tanggal}
          onChange={(v) => setForm({ ...form, tanggal: v })}
        />
      </div>
      <Select
        label="Kategori"
        placeholder="Pilih kategori!"
        className=""
        selectedKeys={form.id_kategorioperasionalkantor || new Set([])}
        onSelectionChange={(v) =>
          setForm({ ...form, id_kategorioperasionalkantor: v })
        }
      >
        {kategorioperasionalkantor.data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <Select
        label="Karyawan"
        placeholder="Pilih karyawan!"
        className=""
        selectedKeys={form.id_karyawan || new Set([])}
        onSelectionChange={(v) => setForm({ ...form, id_karyawan: v })}
      >
        {karyawan.data.map((item) => (
          <SelectItem key={item.id} value={item.id}>
            {item.nama}
          </SelectItem>
        ))}
      </Select>
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        label="Biaya"
        value={form.biaya}
        placeholder="Masukkan biaya!"
        className=""
        onValueChange={(v) => setForm({ ...form, biaya: v })}
      />
      <Textarea
        label="Keterangan"
        labelPlacement="inside"
        placeholder="Masukkan keterangan!"
        value={form.keterangan}
        onValueChange={(v) => setForm({ ...form, keterangan: v })}
      />
    </>
  );
};
