"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
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
import { Form } from "@heroui/form";
import Link from "next/link";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  NoteIcon,
  TransferIcon,
  ReportMoneyIcon,
} from "@/components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import Harga from "@/components/harga";
import { LinkOpenNewTab } from "@/components/mycomponent";
import { FileUploader } from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const apiPath = getApiPath();

export default function App() {
  const bank = useClientFetch("bank");
  const metodepembayaran = useClientFetch("metodepembayaran");
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const saveButtonPress = async (onClose) => {
    if (!form.id_bank) return alert("Bank belum dipilih!");
    const res = await fetch(`${apiPath}metodepembayaran`, {
      method: form.method,
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
  const saveTransferButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await fetch(`${apiPath}transferbank`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        src: form.currentId,
        dst: form.metodepembayaran,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    //return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      id: "",
      nama: "",
      method: "POST",
      title: "Tambah",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    // const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      selectbank: new Set([String(data.id_bank)]),
      method: "PUT",
      title: "Edit",
    });
    onOpen();
  };
  const transferButtonPress = (data) => {
    setForm({
      currentId: data.id,
      nama: data.nama,
    });
    transfer.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus metode pembayaran?")) {
      // setIsLoading(true);
      const res = await fetch(`${apiPath}metodepembayaran`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      // setIsLoading(false);
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

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    const date = new Date(data.tanggal);
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "totalharga":
        return data.jumlah * data.harga;
      case "total":
        return (
          <div className="text-right">
            <Harga harga={+data.total} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <LinkOpenNewTab
              content="Detail"
              link={`/bank/detail?id=${data.id}`}
              icon={<EyeIcon />}
            />
            <Tooltip content="Transfer">
              <span
                onClick={() => transferButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <TransferIcon />
              </span>
            </Tooltip>
            {data.versi > 0 ? (
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
            )}
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
  const transfer = useDisclosure();
  const report = useDisclosure();
  // if (metodepembayaran.error) return <div>failed to load</div>;
  // if (metodepembayaran.isLoading) return <div>loading...</div>;
  // if (bank.error) return <div>failed to load</div>;
  // if (bank.isLoading) return <div>loading...</div>;
  if (isLoading) return <div>loading...</div>;
  const sources = [bank, metodepembayaran];
  if (sources.some((o) => o.error)) return <div>failed to load</div>;
  if (sources.some((o) => o.isLoading)) return <div>loading...</div>;
  const columns = [
    {
      key: "id",
      label: "Id",
    },
    {
      key: "namabank",
      label: "Bank",
    },
    {
      key: "norekening",
      label: "No. Rekening",
    },
    {
      key: "atasnama",
      label: "Atas Nama",
    },
    {
      key: "nama",
      label: "Keterangan",
    },
    {
      key: "total",
      label: "Total",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  console.log(form.selectbank?.size);
  return (
    <div className="flex gap-2">
      <Bank bank={bank} />
      <div className="flex flex-col gap-2">
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
          className=""
          aria-label="Example table with custom cells"
          topContent={<></>}
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
          <TableBody items={metodepembayaran.data}>
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.title} Bank
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Bank"
                  variant="bordered"
                  placeholder="Pilih perusahaan!"
                  selectedKeys={form.selectbank}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectbank: val,
                      id_bank: new Set(val).values().next().value,
                    });
                  }}
                >
                  {bank.data.result.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  label="Atas Nama"
                  placeholder="Masukkan nama!"
                  value={form.atasnama}
                  onValueChange={(val) => setForm({ ...form, atasnama: val })}
                />
                <Input
                  type="text"
                  label="No. Rekening"
                  placeholder="Masukkan no. rekening!"
                  value={form.norekening}
                  onValueChange={(val) => setForm({ ...form, norekening: val })}
                />
                <Input
                  type="text"
                  label="Keterangan (Opsional)"
                  placeholder="Masukkan keterangan!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                {/* <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) =>
                      setForm({ ...form, startdate: v, tanggal: getDate(v) })
                    }
                  />
                </div> */}
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                /> */}
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
      {/* transfer */}
      <Modal
        isOpen={transfer.isOpen}
        onOpenChange={transfer.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Transfer Bank
              </ModalHeader>
              <ModalBody>
                <Input
                  isDisabled
                  type="text"
                  label="Bank asal"
                  defaultValue={form.nama}
                  className="max-w-xs"
                />
                <Select
                  label="Targer metodepembayaran"
                  variant="bordered"
                  placeholder="Pilih target metodepembayaran"
                  selectedKeys={form.selectedBank}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectedBank: val,
                      metodepembayaran: new Set(val).values().next().value,
                    });
                  }}
                >
                  {metodepembayaran.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                {/* <Input
                  type="text"
                  label="Alamat"
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(val) => setForm({ ...form, alamat: val })}
                /> */}
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(val) => setForm({ ...form, keterangan: val })}
                /> */}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={transfer.onClose}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => saveTransferButtonPress(transfer.onClose)}
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

const Bank = ({ bank }) => {
  const [form, setForm] = useState();

  const onSubmit = async (e, onClose) => {
    e.preventDefault();
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    const res = await fetch(`${apiPath}bank`, {
      method: form.method,
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
      id: "",
      nama: "",
      method: "POST",
      title: "Tambah",
    });
    onOpen();
  };
  const editButtonPress = (data) => {
    // const startdate = new Date(data.tanggal);
    setForm({
      ...data,
      method: "PUT",
      title: "Edit",
    });
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus bank?")) {
      const res = await fetch(`${apiPath}bank`, {
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
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
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

  const columns = [
    {
      key: "id",
      label: "Id",
    },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
      </div>
      <Table
        isStriped
        aria-label="Example table with custom cells"
        topContent={<></>}
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
        <TableBody items={bank.data.result}>
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
            <Form onSubmit={(e) => onSubmit(e, onClose)}>
              <ModalHeader className="">{form.title} Bank</ModalHeader>
              <ModalBody className="w-full">
                <Input
                  type="text"
                  label="Nama"
                  className=""
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
              </ModalBody>
              <ModalFooter className="w-full">
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button type="submit" color="primary">
                  Simpan
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
