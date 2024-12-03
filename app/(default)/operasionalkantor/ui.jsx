"use client";
import React, { useState } from "react";
import { useClientFetch, getApiPath } from "../../utils/apiconfig";
import { penawaran } from "../../utils/formatid";
import {
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
} from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const kategorioperasionalkantor = useClientFetch("kategorioperasionalkantor");
  const [filter, setFilter] = useState({
    startDate,
    endDate,
    selectKategori: new Set([]),
  });
  const [current, setCurrent] = useState({
    startDate,
    endDate,
  });
  const operasionalkantor = useClientFetch(
    `operasionalkantor?start=${getDate(current.startDate)}&end=${getDate(
      current.endDate
    )}&id_kategori=${
      filter.selectKategori.values().next().value
        ? filter.selectKategori.values().next().value
        : ""
    }`
  );
  const karyawan = useClientFetch("karyawan");
  const [selectKaryawan, setSelectKaryawan] = useState(new Set([]));
  const [selectKategori, setSelectKategori] = useState(new Set([]));
  const [form, setForm] = useState({});
  const [json, setJson] = useState([]);
  const [method, setMethod] = useState("POST");

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

  const simpanButtonPress = async (onClose) => {
    const res = await fetch(`${apiPath}operasionalkantor`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        id_karyawan: selectKaryawan.values().next().value,
        id_kategorioperasionalkantor: selectKategori.values().next().value,
      }),
    });
    const json = await res.json();
    onClose();
    // return alert(json.message);
  };
  const tambahButtonPress = async () => {
    // if (select.size == 0) return alert("Produk belum dipilih.");
    if (
      !form.tanggal ||
      selectKategori.size == 0 ||
      selectKaryawan.size == 0 ||
      !form.biaya
    )
      return alert("Data belum lengkap");
    const res = await fetch(`${apiPath}operasionalkantor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        id_kategorioperasionalkantor: selectKategori.values().next().value,
        id_karyawan: selectKaryawan.values().next().value,
        biaya: form.biaya,
        keterangan: form.keterangan ? form.keterangan : "",
        tanggal: form.tanggal,
      }),
    });
    const json = await res.json();
    setForm({ biaya: "", keterangan: "" });
    setSelectKaryawan([]);
    setSelectKategori([]);
    // return alert(json.message);
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
    });
    setSelectKaryawan(new Set(String(data.id_karyawan)));
    setSelectKategori(new Set(String(data.id_kategorioperasionalkantor)));
    setMethod("PUT");
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
        return <Harga harga={data.biaya} />;
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

  if (operasionalkantor.error) return <div>failed to load</div>;
  if (operasionalkantor.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  if (kategorioperasionalkantor.error) return <div>failed to load</div>;
  if (kategorioperasionalkantor.isLoading) return <div>loading...</div>;

  const col = [
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
    {
      key: "aksi",
      label: "Aksi",
    },
  ];

  // const sumBiaya = operasionalkantor.data.reduce((acc, v) => {
  //   return acc + v.biaya;
  // });

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white p-3 rounded-lg">
        <div>Operasional Kantor</div>
        <div className="flex-col gap-2">
          <div className="flex flex-row gap-2">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div>Tanggal</div>
              <DatePicker
                placeholderText="Pilih tanggal"
                dateFormat="dd/MM/yyyy"
                selected={form.startdate}
                onChange={(v) =>
                  setForm({ ...form, startdate: v, tanggal: getDate(v) })
                }
              />
            </div>
            <Select
              label="Kategori"
              placeholder="Pilih kategori!"
              className="w-4/12"
              selectedKeys={selectKategori}
              onSelectionChange={setSelectKategori}
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
              className="w-5/12 pl-2"
              selectedKeys={selectKaryawan}
              onSelectionChange={setSelectKaryawan}
            >
              {karyawan.data.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nama}
                </SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              min={0}
              label="Biaya"
              value={form.biaya}
              placeholder="Masukkan biaya!"
              className="w-4/12 pl-2"
              onValueChange={(v) => setForm({ ...form, biaya: v })}
            />
          </div>
          <div className="flex flex-row gap-2 mt-3">
            <Textarea
              label="Keterangan"
              labelPlacement="inside"
              placeholder="Masukkan keterangan!"
              value={form.keterangan}
              onValueChange={(v) => setForm({ ...form, keterangan: v })}
            />
            <Button
              onClick={() => {
                tambahButtonPress();
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
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) =>
                      setForm({ ...form, startdate: v, tanggal: getDate(v) })
                    }
                  />
                </div>
                <Select
                  label="Kategori"
                  placeholder="Pilih kategori!"
                  className=""
                  selectedKeys={selectKategori}
                  onSelectionChange={setSelectKategori}
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
                  selectedKeys={selectKaryawan}
                  onSelectionChange={setSelectKaryawan}
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
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
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => simpanButtonPress(onClose)}
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
                  <RangeDate current={current} setCurrent={setCurrent} />
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
        <TableBody items={operasionalkantor.data}>
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
