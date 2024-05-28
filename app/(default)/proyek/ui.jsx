"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
import { penawaran } from "@/app/utils/formatid";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
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
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  NoteIcon,
  ReportMoneyIcon,
  FileExportIcon,
} from "../../../components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import { FileUploader } from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const [isLoading, setIsLoading] = useState(0);
  const session = useSession();
  const user = session.data?.user;

  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  const [filter, setFilter] = useState({
    startDate,
    endDate,
    selectKategori: new Set([]),
  });
  const [selectProyek, setSelectProyek] = useState({});
  const proyek = useClientFetch(
    `proyek?start=${getDate(filter.startDate)}&end=${getDate(filter.endDate)}`
  );
  const penawaran = useClientFetch(
    `exportpenawaran?start=${getDate(filter.startDate)}&end=${getDate(
      filter.endDate
    )}`
  );
  const perusahaan = useClientFetch("perusahaan");
  const karyawan = useClientFetch("karyawan");
  const statusproyek = useClientFetch("statusproyek");
  const customer = useClientFetch("customer");
  const kategoriproyek = useClientFetch("kategoriproyek");
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("POST");
  const [json, setJson] = useState([]);

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
    const startdate = new Date(data.tanggal);
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
    console.log(json);
  };
  const importPenawaran = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setIsLoading(1);
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}importpenawaran`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(v),
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
    setIsLoading(0);
    report.onOpen();
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
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <NoteIcon />
                </span>
              </Link>
            </Tooltip>
            {data.versi > 0 ? (
              user?.peran == "admin" || user?.peran == "super" ? (
                <Tooltip content="Pengeluaran Proyek">
                  <Link href={`/proyek/detail/proses?id=${data.id}`}>
                    <span
                      // onClick={() => detailButtonPress(data)}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      <ReportMoneyIcon />
                    </span>
                  </Link>
                </Tooltip>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
            <Tooltip content="Edit">
              <span
                onClick={() => editButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            {/* <Tooltip content="Export">
              <span
                onClick={() => handleExportButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <FileExportIcon />
              </span>
            </Tooltip> */}
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

  if (isLoading) return <div>loading...</div>;
  if (proyek.error) return <div>failed to load</div>;
  if (proyek.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  if (perusahaan.error) return <div>failed to load</div>;
  if (perusahaan.isLoading) return <div>loading...</div>;
  if (statusproyek.error) return <div>failed to load</div>;
  if (statusproyek.isLoading) return <div>loading...</div>;
  if (customer.error) return <div>failed to load</div>;
  if (customer.isLoading) return <div>loading...</div>;
  if (kategoriproyek.error) return <div>failed to load</div>;
  if (kategoriproyek.isLoading) return <div>loading...</div>;
  if (penawaran.error) return <div>failed to load</div>;
  if (penawaran.isLoading) return <div>loading...</div>;

  const columns = [
    {
      key: "id",
      label: "Id",
    },
    {
      key: "id_second",
      label: "Id Proyek",
    },
    {
      key: "namaperusahaan",
      label: "Nama Perusahaan",
    },
    {
      key: "swasta",
      label: "Swasta/Negri",
    },
    {
      key: "kategoriproyek",
      label: "Kategori Proyek",
    },
    {
      key: "nama",
      label: "Nama Proyek",
    },
    // {
    //   key: "klien",
    //   label: "Klien",
    // },
    {
      key: "instansi",
      label: "Customer",
    },
    {
      key: "kota",
      label: "Kota",
    },
    {
      key: "namakaryawan",
      label: "Sales",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "keterangan",
      label: "Keterangan",
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
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        {/* <div>
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
        </Button> */}
      </div>
      <Table
        isStriped
        className="pt-3"
        aria-label="Example table with custom cells"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        topContent={
          <>
            <div>Filter</div>
            <div className="flex flex-row gap-2">
              <div className="flex flex-col bg-gray-100 p-3 rounded-lg">
                <div>Periode</div>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={filter.startDate}
                  onChange={(date) => setFilter({ ...filter, startDate: date })}
                  selectsStart
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                />
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={filter.endDate}
                  onChange={(date) => setFilter({ ...filter, endDate: date })}
                  selectsEnd
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                  minDate={filter.startDate}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-row gap-2">
                <Button
                  color="primary"
                  onClick={handleButtonExportToExcelPress}
                >
                  Export to Excel
                </Button>
              </div>
              <div className="flex flex-row gap-2">
                <Button color="primary" onClick={exportPenawaran}>
                  Export Penawaran
                </Button>
              </div>
              <FileUploader onFileUpload={handleFileUpload} />
              <Button color="primary" onPress={importPenawaran}>
                Import Penawaran
              </Button>
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
        <TableBody items={proyek.data}>
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
                  placeholder="Pilih perusahaan!"
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
                  {perusahaan.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                {/* <Select
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
                </Select> */}
                {/* <Select
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
                </Select> */}
                {/* <Select
                  label="Customer"
                  variant="bordered"
                  placeholder="Pilih customer!"
                  selectedKeys={form.selectcustomer}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    const id_instansi = new Set(val).values().next().value;
                    setForm({
                      ...form,
                      selectcustomer: val,
                      id_instansi,
                      kota: customer.data.filter((v) => v.id == id_instansi)[0]
                        ?.kota,
                    });
                  }}
                >
                  {customer.data.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      textValue={item.nama}
                    >
                      {item.nama} | {item.swasta ? "Swasta" : "Negri"} |{" "}
                      {item.kota}
                    </SelectItem>
                  ))}
                </Select> */}
                <Autocomplete
                  label="Customer"
                  variant="bordered"
                  defaultItems={customer.data}
                  placeholder="Cari customer"
                  className="max-w-xs"
                  selectedKey={form.id_instansi}
                  defaultSelectedKey={form.id_instansi}
                  defaultInputValue={form.instansi}
                  onSelectionChange={(v) =>
                    setForm({ ...form, id_instansi: v })
                  }
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama} | {item.swasta ? "Swasta" : "Negri"} |{" "}
                      {item.kota}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
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
                  placeholder="Masukkan klien! Contoh : Bapak Adi"
                  value={form.klien}
                  onValueChange={(val) => setForm({ ...form, klien: val })}
                />
                {/* <Input
                  type="text"
                  label="Kota"
                  placeholder="Masukkan kota!"
                  value={form.kota}
                  onValueChange={(val) => setForm({ ...form, kota: val })}
                /> */}
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
                  placeholder="Masukkan keterangan! (Opsional)"
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
