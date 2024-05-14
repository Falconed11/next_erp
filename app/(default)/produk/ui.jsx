"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
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
import { Select, SelectItem } from "@nextui-org/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "../../../components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Harga from "@/components/harga";
import { FileUploader } from "@/components/input";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";

const apiPath = getApiPath();

export default function App() {
  const [selectKategori, setSelectKategori] = useState([]);
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value ?? ""}`
  );
  const kategori = useClientFetch("kategoriproduk");
  const subkategori = useClientFetch("subkategoriproduk");
  const merek = useClientFetch("merek");
  const [method, setMethod] = useState("POST");
  const [form, setForm] = useState({
    modalmode: "Tambah",
    id: "",
    kategori: "",
    id_kustom: "",
    nama: "",
    merek: "",
    tipe: "",
    vendor: "",
    stok: "",
    satuan: "",
    hargamodal: "",
    hargajual: "",
    select_kategori: new Set([]),
    select_subkategori: new Set([]),
    select_merek: new Set([]),
    filteredsubkategori: [],
    keterangan: "",
  });
  const [json, setJson] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  const saveButtonPress = async (onClose) => {
    if (form.nama == "" || form.kategori == "")
      return alert("Nama, dan Kategori harus diisi!");
    const res = await fetch(`${apiPath}produk`, {
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
    // return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      kategori: "",
      id_kustom: "",
      nama: "",
      merek: "",
      tipe: "",
      vendor: "",
      stok: "",
      satuan: "",
      hargamodal: "",
      hargajual: "",
      select_kategori: new Set([]),
      select_subkategori: new Set([]),
      select_merek: new Set([]),
      filteredsubkategori: [],
      keterangan: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      modalmode: "Edit",
      // select_kategori: new Set([String(data.id_kategori)]),
      // select_subkategori: new Set([String(data.id_subkategori)]),
      // select_merek: new Set([String(data.id_merek)]),
    });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus product?")) {
      const res = await fetch(`${apiPath}produk`, {
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
    setJson(jsonData);
    console.log(json);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}produk`, {
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
      setReportList(dataArray.map((v, i) => `${i}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };
  const handleButtonExportToExcelPress = () => {
    const rows = produk.data.map((v) => {
      const totalHarga = (v.hargakustom ?? v.hargajual) * v.jumlah;
      return {
        id: v.id,
        id_kustom: v.id_kustom,
        kategori: v.kategori,
        nama: v.nama,
        tipe: v.tipe,
        stok: v.stok,
        satuan: v.satuan,
        merek: v.merek,
        vendor: v.vendor,
        hargamodal: v.hargamodal,
        hargajual: v.hargajual,
        keterangan: v.keterangan,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(workbook, `produk.xlsx`, { compression: true });
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "hargamodal":
        return (
          <div className="text-right">
            <Harga harga={data.hargamodal} />
          </div>
        );
      case "hargajual":
        return (
          <div className="text-right">
            <Harga harga={data.hargajual} />
          </div>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            {/* <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EyeIcon />
              </span>
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

  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  // if (subkategori.error) return <div>failed to load</div>;
  // if (subkategori.isLoading) return <div>loading...</div>;
  // if (merek.error) return <div>failed to load</div>;
  // if (merek.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "kategori",
      label: "Kategori",
    },
    {
      key: "id_kustom",
      label: "Id",
    },
    {
      key: "nama",
      label: "Nama",
    },
    {
      key: "nmerek",
      label: "Merek",
    },
    {
      key: "tipe",
      label: "Tipe",
    },
    {
      key: "nvendor",
      label: "Vendor",
    },
    {
      key: "stok",
      label: "Stok",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    {
      key: "hargamodal",
      label: "Harga Modal",
    },
    {
      key: "hargajual",
      label: "Harga Jual",
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

  let filteredsubkategori = [
    { nama: "Silahkan pilih kategori terlebih dahulu" },
  ];
  if (form.id_kategori) {
    filteredsubkategori = subkategori.data.filter((item) => {
      if (item.id_kategoriproduk == form.id_kategori) return item;
    });
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/produk.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button>
      </div>
      <Table
        selectionMode="single"
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <Select
              label="Kategori"
              variant="bordered"
              placeholder="Pilih kategori!"
              selectedKeys={selectKategori}
              className="max-w-xs"
              onSelectionChange={setSelectKategori}
            >
              {kategori.data.map((item) => (
                <SelectItem key={item.kategori} value={item.kategori}>
                  {`${item.kategori}`}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-row gap-2">
              <Button color="primary" onClick={handleButtonExportToExcelPress}>
                Export to Excel
              </Button>
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
        <TableBody items={produk.data}>
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
                {form.modalmode} Produk
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Kategori"
                  placeholder="Masukkan kategori!"
                  value={form.kategori}
                  onValueChange={(val) => setForm({ ...form, kategori: val })}
                />
                <Input
                  type="text"
                  label="Id"
                  placeholder="Masukkan id!"
                  value={form.id_kustom}
                  onValueChange={(val) => setForm({ ...form, id_kustom: val })}
                />
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                {/* <Select
                  label="Kategori"
                  placeholder="Pilih Kategori"
                  className="max-w-xs"
                  selectedKeys={form.select_kategori}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_kategori: e.target.value,
                      select_kategori: new Set([e.target.value]),
                      filteredsubkategori: subkategori.data.filter((item) => {
                        if (item.id_kategoriproduk == e.target.value) {
                          return item;
                        }
                      }),
                    })
                  }
                >
                  {kategori.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Subkategori"
                  placeholder="Pilih Subkategori"
                  className="max-w-xs"
                  selectedKeys={form.select_subkategori}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_subkategori: e.target.value,
                      select_subkategori: new Set([e.target.value]),
                    })
                  }
                >
                  {filteredsubkategori.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Merek"
                  placeholder="Pilih Merek"
                  className="max-w-xs"
                  selectedKeys={form.select_merek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_merek: e.target.value,
                      select_merek: new Set([e.target.value]),
                    })
                  }
                >
                  {merek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select> */}
                <Input
                  type="text"
                  label="Merek"
                  placeholder="Masukkan merek!"
                  value={form.merek}
                  onValueChange={(val) => setForm({ ...form, merek: val })}
                />
                <Input
                  type="text"
                  label="Tipe"
                  placeholder="Masukkan tipe!"
                  value={form.tipe}
                  onValueChange={(val) => setForm({ ...form, tipe: val })}
                />
                <Input
                  type="text"
                  label="Vendor"
                  placeholder="Masukkan vendor!"
                  value={form.vendor}
                  onValueChange={(val) => setForm({ ...form, vendor: val })}
                />
                <Input
                  type="number"
                  label="Stok"
                  placeholder="Masukkan stok!"
                  value={form.stok}
                  onValueChange={(val) => setForm({ ...form, stok: val })}
                />
                <Input
                  type="text"
                  label="Satuan"
                  placeholder="Masukkan satuan!"
                  value={form.satuan}
                  onValueChange={(val) => setForm({ ...form, satuan: val })}
                />
                <Input
                  type="text"
                  label="Harga Modal"
                  placeholder="Masukkan harga modal!"
                  value={form.hargamodal}
                  onValueChange={(val) => setForm({ ...form, hargamodal: val })}
                />
                <Input
                  type="text"
                  label="Harga Jual"
                  placeholder="Masukkan harga jual!"
                  value={form.hargajual}
                  onValueChange={(val) => setForm({ ...form, hargajual: val })}
                />
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
