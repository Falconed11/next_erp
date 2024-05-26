"use client";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
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
  Pagination,
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
} from "@/components/icon";
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
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { Button } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
import { getDateFId } from "@/app/utils/date";

const apiPath = getApiPath();

export default function App() {
  const [nama, setNama] = useState("");
  const [selectKategori, setSelectKategori] = useState([]);
  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value ?? ""}`
  );
  const kategori = useClientFetch("kategoriproduk");
  const merek = useClientFetch("merek");
  const vendor = useClientFetch("vendor?columnName=nama");

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;

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
    selectedKategori: new Set([]),
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
    if (form.nama == "" || !form.selectKategori.size > 0)
      return alert("Nama, dan Kategori wajib diisi!");
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
      selectedKategori: new Set([]),
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
      selectKategori: new Set([String(data.id_kategori)]),
      merek: data.nmerek,
      id_merek: data.id_merek,
      vendor: data.nvendor,
      id_vendor: data.id_vendor,
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
      case "tanggal":
        return getDateFId(new Date(data.tanggal));
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

  let data = produk?.data;
  data = data?.filter(
    (row) =>
      row.nama.toLowerCase().includes(nama.toLowerCase()) ||
      row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
      row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
      row.vendor?.toLowerCase().includes(nama.toLowerCase())
  );
  data = data?.slice(0, 50);
  const filteredData = produk?.data?.filter(
    (row) =>
      row.nama.toLowerCase().includes(nama.toLowerCase()) ||
      row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
      row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
      row.vendor?.toLowerCase().includes(nama.toLowerCase())
  );

  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData?.length, rowsPerPage]);
  const loadingState = produk.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  if (vendor.error) return <div>failed to load</div>;
  if (vendor.isLoading) return <div>loading...</div>;
  // if (subkategori.error) return <div>failed to load</div>;
  // if (subkategori.isLoading) return <div>loading...</div>;
  // if (merek.error) return <div>failed to load</div>;
  // if (merek.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "kategoriproduk",
      label: "Kategori",
    },
    {
      key: "id",
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

  let filteredsubkategori = [
    { nama: "Silahkan pilih kategori terlebih dahulu" },
  ];
  // if (form.id_kategori) {
  //   filteredsubkategori = subkategori.data.filter((item) => {
  //     if (item.id_kategoriproduk == form.id_kategori) return item;
  //   });
  // }
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
        isStriped
        selectionMode="single"
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <div className="flex gap-3">
              <Select
                label="Kategori"
                variant="bordered"
                placeholder="Pilih kategori!"
                selectedKeys={selectKategori}
                className="max-w-xs"
                onSelectionChange={(v) => {
                  setSelectKategori(v);
                  setPage(1);
                }}
              >
                {kategori.data.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {`${item.nama}`}
                  </SelectItem>
                ))}
              </Select>
              <Autocomplete
                label="Produk"
                variant="bordered"
                defaultItems={data}
                placeholder="Cari produk"
                className="max-w-xs"
                selectedKey={form.selectProduk}
                onSelectionChange={(v) => {
                  setForm({ ...form, selectProduk: v });
                  setNama(
                    data?.filter((row) => {
                      return row.id == v;
                    })[0]?.nama ?? ""
                  );
                  setPage(1);
                }}
                onValueChange={(v) => {
                  setNama(v);
                }}
              >
                {(item) => (
                  <AutocompleteItem key={item.id} textValue={item.nama}>
                    {item.nama}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
            <div className="flex flex-row gap-2">
              <Button color="primary" onClick={handleButtonExportToExcelPress}>
                Export to Excel
              </Button>
            </div>
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
          items={
            filteredData ? filteredData.slice(offset, offset + rowsPerPage) : []
          }
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
                <Select
                  label="Kategori"
                  placeholder="Pilih Kategori"
                  className="max-w-xs"
                  selectedKeys={form.selectKategori}
                  onSelectionChange={(val) =>
                    setForm({
                      ...form,
                      selectKategori: val,
                      id_kategori: new Set(val).values().next().value,
                    })
                  }
                >
                  {kategori.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
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
                <Autocomplete
                  label="Merek"
                  variant="bordered"
                  defaultItems={merek.data}
                  placeholder="Cari merek"
                  className="max-w-xs"
                  selectedKey={form.id_merek}
                  defaultSelectedKey={form.id_merek}
                  defaultInputValue={form.merek}
                  onSelectionChange={(v) => setForm({ ...form, id_merek: v })}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Input
                  type="text"
                  label="Tipe"
                  placeholder="Masukkan tipe!"
                  value={form.tipe}
                  onValueChange={(val) => setForm({ ...form, tipe: val })}
                />
                <Autocomplete
                  label="Vendor"
                  variant="bordered"
                  defaultItems={vendor.data}
                  placeholder="Cari vendor"
                  className="max-w-xs"
                  selectedKey={form.id_vendor}
                  defaultSelectedKey={form.id_vendor}
                  defaultInputValue={form.vendor}
                  onSelectionChange={(v) => setForm({ ...form, id_vendor: v })}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
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
