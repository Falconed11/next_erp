"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
import { penawaran } from "@/app/utils/formatid";
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
} from "@/components/icon";
import Harga from "@/components/harga";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import { FileUploader, RangeDate } from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const [current, setCurrent] = useState({
    startDate,
    endDate,
    selectKategori: new Set([]),
  });
  const omset = useClientFetch(
    `omset?start=${getDate(current.startDate)}&end=${getDate(current.endDate)}`
  );
  const karyawan = useClientFetch("karyawan");
  const statusproyek = useClientFetch("statusproyek");
  const customer = useClientFetch("customer");
  const kategoriproyek = useClientFetch("kategoriproyek");
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("POST");
  const [json, setJson] = useState([]);

  const saveButtonPress = async (onClose) => {
    if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
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
      tanggal: "",
      startdate: "",
      keterangan: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
      selectkaryawan: String(data.id_karyawan),
      selectperusahaan: String(data.id_perusahaan),
      selectcustomer: String(data.id_instansi),
      selectkategoriproyek: String(data.id_kategoriproyek),
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
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
    console.log(jsonData);
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
    const rows = omset.data.map((v) => {
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

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const provit = data.omset - data.biayaproduksi;
    const date = new Date(data.tanggal);
    switch (columnKey) {
      case "no":
        return `${penawaran(data.id_kustom, date, data.id_karyawan)}`;
      case "swasta":
        return data.swasta ? "swasta" : "negri";
      case "status":
        return data.versi == -1
          ? "reject"
          : data.versi == 0
          ? "penawaran"
          : "deal";
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "totalharga":
        return data.jumlah * data.harga;
      case "biayaproduksi":
        return (
          <div className="text-right">
            <Harga harga={+data.biayaproduksi} />
          </div>
        );
      case "omset":
        return (
          <div className="text-right">
            <Harga harga={+data.omset} />
          </div>
        );
      case "provit":
        return (
          <div className="text-right">
            <Harga harga={provit} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Penawaran">
              <Link
                href={`/proyek/detail?id=${data.id}&versi=${
                  data.versi <= 0 ? "1" : data.versi
                }`}
              >
                <span
                  role="link"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      `/proyek/detail?id=${data.id}&versi=${
                        data.versi <= 0 ? "1" : data.versi
                      }`
                    );
                  }}
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <NoteIcon />
                </span>
              </Link>
            </Tooltip>
            {data.versi > 0 ? (
              <Tooltip content="Pengeluaran Proyek">
                <Link href={`/proyek/detail/proses?id=${data.id}`} passHref>
                  <span
                    role="link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`/proyek/detail/proses?id=${data.id}`);
                    }}
                    // onClick={() => detailButtonPress(data)}
                    className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  >
                    <ReportMoneyIcon />
                  </span>
                </Link>
              </Tooltip>
            ) : (
              <></>
            )}
            {/* <Tooltip content="Edit">
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
            </Tooltip> */}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  if (omset.error) return <div>failed to load</div>;
  if (omset.isLoading) return <div>loading...</div>;
  if (statusproyek.error) return <div>failed to load</div>;
  if (statusproyek.isLoading) return <div>loading...</div>;
  if (customer.error) return <div>failed to load</div>;
  if (customer.isLoading) return <div>loading...</div>;
  if (kategoriproyek.error) return <div>failed to load</div>;
  if (kategoriproyek.isLoading) return <div>loading...</div>;

  const columns = [
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "id_second",
      label: "Id Proyek",
    },
    {
      key: "nama",
      label: "Nama Proyek",
    },
    {
      key: "customer",
      label: "Customer",
    },
    {
      key: "swasta",
      label: "S/N",
    },
    {
      key: "biayaproduksi",
      label: "Biaya Produksi",
    },
    {
      key: "omset",
      label: "Omset",
    },
    {
      key: "provit",
      label: "Provit",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const isSwasta = [
    { id: 0, nama: "negri" },
    { id: 1, nama: "swasta" },
  ];

  const biayaProduksi = omset.data.reduce(
    (acc, cur) => acc + +cur.biayaproduksi,
    0
  );
  const sOmset = omset.data.reduce((acc, cur) => acc + +cur.omset, 0);
  const provit = omset.data.reduce(
    (acc, cur) => acc + (cur.omset - cur.biayaproduksi),
    0
  );

  return (
    <div className="flex flex-col">
      {/* <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/proyek.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button>
      </div> */}
      <Table
        isStriped
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <div className="flex flex-row gap-2">
              <RangeDate current={current} setCurrent={setCurrent} />
            </div>
            {/* <div className="flex flex-row gap-2"> */}
            {/* <Button color="primary" onClick={handleButtonExportToExcelPress}>
                Export to Excel
              </Button>
            </div> */}
            <div className="flex gap-3">
              <div>
                Biaya Produksi :<Harga harga={biayaProduksi} />{" "}
              </div>
              <div>
                {" "}
                Omset :<Harga harga={sOmset} />{" "}
              </div>
              <div>
                Provit :<Harga harga={provit} />{" "}
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
        <TableBody items={omset.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Proyek
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Perusahaan"
                  variant="bordered"
                  placeholder="Pilih omset!"
                  selectedKeys={form.selectperusahaan}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectperusahaan: val,
                      id_perusahaan: new Set(val).values().next().value,
                    });
                  }}
                >
                  {omset.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Swasta/Negri"
                  variant="bordered"
                  placeholder="Pilih swasta/negri!"
                  selectedKeys={form.isSwasta}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      isSwasta: val,
                      swasta: new Set(val).values().next().value,
                    });
                  }}
                >
                  {isSwasta.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Kategori Proyek"
                  variant="bordered"
                  placeholder="Pilih kategori proyek!"
                  selectedKeys={form.selectkategoriproyek}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectkategoriproyek: val,
                      id_kategoriproyek: new Set(val).values().next().value,
                    });
                  }}
                >
                  {kategoriproyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  label="Nama Proyek"
                  placeholder="Masukkan nama proyek!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <Input
                  type="text"
                  label="Klien"
                  placeholder="Masukkan klien!"
                  value={form.klien}
                  onValueChange={(val) => setForm({ ...form, klien: val })}
                />
                <Select
                  label="Customer"
                  variant="bordered"
                  placeholder="Pilih customer!"
                  selectedKeys={form.selectcustomer}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectcustomer: val,
                      id_instansi: new Set(val).values().next().value,
                    });
                  }}
                >
                  {customer.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  label="Kota"
                  placeholder="Masukkan kota!"
                  value={form.kota}
                  onValueChange={(val) => setForm({ ...form, kota: val })}
                />
                <Select
                  label="Sales"
                  variant="bordered"
                  placeholder="Pilih sales!"
                  selectedKeys={form.selectkaryawan}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    console.log(val);
                    setForm({
                      ...form,
                      selectkaryawan: val,
                      id_karyawan: new Set(val).values().next().value,
                    });
                  }}
                >
                  {karyawan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                {/* <Select
                  label="Status"
                  variant="bordered"
                  placeholder="Pilih status!"
                  selectedKeys={form.selectstatus}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectstatus: val,
                      id_statusproyek: new Set(val).values().next().value,
                    });
                  }}
                >
                  {statusproyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select> */}
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
                <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => saveButtonPress(onClose)}
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
    </div>
  );
}
