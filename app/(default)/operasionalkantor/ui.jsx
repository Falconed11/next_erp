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
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../components/icon";
import { FileUploader } from "@/app/components/input";
import { getDate, getDateF, getCurFirstLastDay } from "@/app/utils/date";
import Harga from "@/app/components/harga";
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
  const operasionalkantor = useClientFetch(
    `operasionalkantor?start=${getDate(filter.startDate)}&end=${getDate(
      filter.endDate
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
  const [method, setMethod] = useState("POST");

  const handleFileUpload = (jsonData) => {
    console.log(jsonData[0].nama);
    // Do something with the converted JSON object, e.g., send it to an API
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
            <Tooltip content="Detail">
              <Link href={link}>
                <span
                  // onClick={() => detailButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EyeIcon />
                </span>
              </Link>
            </Tooltip>
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

  const sumBiaya = operasionalkantor.data.reduce((acc, v) => {
    return acc + v.biaya;
  });
  return (
    <div className="flex flex-col">
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
      <Table
        className="h-full w-full"
        aria-label="Example table with custom cells"
        topContent={
          <>
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
                  label="Biaya"
                  value={form.biaya}
                  placeholder="Masukkan biaya!"
                  className="w-4/12 pl-2"
                  onValueChange={(v) => setForm({ ...form, biaya: v })}
                />
                <FileUploader onFileUpload={handleFileUpload} />
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
            <div>Filter</div>
            <div className="flex flex-row gap-3">
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
