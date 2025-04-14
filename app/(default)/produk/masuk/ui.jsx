"use client";
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
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
} from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  MinIcon,
} from "@/components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { RadioGroup, Radio } from "@heroui/react";
import Harga from "@/components/harga";
import { FileUploader } from "@/components/input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { Button } from "@heroui/react";
import { Input, Textarea } from "@heroui/react";
import { getDate, getDateFId } from "@/app/utils/date";

const apiPath = getApiPath();

export default function App({ id_produk }) {
  const [nama, setNama] = useState("");
  const [id, setId] = useState("");
  const produkmasuk = useClientFetch(
    `produkmasuk?${id_produk ? `id_produk=${id_produk}` : ""}`
  );
  const produk = useClientFetch(`produk?id=${id_produk}`);
  const vendor = useClientFetch(`vendor?columnName=nama`);

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

  const modal = { masuk: useDisclosure(), keluar: useDisclosure() };

  const saveButtonPress = async (onClose) => {
    // if (form.nama == "" || !form.selectKategori.size > 0)
    //   return alert("Nama, dan Kategori wajib diisi!");
    if (form.jumlah < form.keluar)
      return alert(
        `Jumlah tidak boleh kurang dari produk keluar. (Min ${form.keluar})`
      );
    const res = await fetch(`${apiPath}produkmasuk`, {
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
    // return alert(json.message);
  };
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      kategori: "",
      id_kustom: id,
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
      startdate: new Date(),
      tanggal: getDate(new Date()),
      lunas: "1",
      keterangan: "",
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      modalmode: "Edit",
      startdate: new Date(data.tanggal),
      tanggal: getDate(new Date(data.tanggal)),
      startdateJatuhtempo: data.jatuhtempo ? new Date(data.jatuhtempo) : null,
      jatuhtempo: data.jatuhtempo ? getDate(new Date(data.jatuhtempo)) : null,
      oldJumlah: data.jumlah,
      oldTerbayar: data.terbayar,
      lunas: data.jumlah * data.harga > data.terbayar ? "0" : "1",
      method: "PUT",
    });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (data) => {
    if (data.keluar > 0)
      return alert("Tidak dapat menghapus. Data keluar tidak kosong.");
    if (confirm("Hapus produk masuk?")) {
      const res = await fetch(`${apiPath}produkmasuk`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          id: data.id,
          id_produk: data.id_produk,
          jumlah: data.jumlah,
        }),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
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

  const onProdukMasukClick = (data) => {
    setForm({
      ...data,
      startdate: new Date(),
      id_produk: data.id,
      lunas: "1",
    });
    modal.masuk.onOpen();
  };
  const onSimpanClick = async (onClose) => {
    // if (form.nama == "" || !form.selectKategori.size > 0)
    //   return alert("Nama, dan Kategori wajib diisi!");
    const res = await fetch(`${apiPath}produkmasuk`, {
      method: "POST",
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

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "tanggal":
        return getDateFId(new Date(data.tanggal));
      case "terbayar":
        return (
          <div
            className={`text-right px-1 rounded ${
              data.jumlah * data.harga > data.terbayar
                ? new Date() >= new Date(data.jatuhtempo)
                  ? "bg-red-200"
                  : "bg-yellow-200"
                : ""
            }`}
          >
            <Harga harga={data.terbayar} />
          </div>
        );
      case "jatuhtempo":
        return data.jatuhtempo ? getDateFId(new Date(data.jatuhtempo)) : "";
      case "harga":
        return (
          <div className="text-right">
            <Harga harga={data.harga} />
          </div>
        );
      case "total":
        return (
          <div className="text-right">
            <Harga harga={data.harga * data.jumlah} />
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
            {/* <Tooltip content="Produk Masuk">
              <span
                onClick={() => onProdukMasukClick(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <AddIcon />
              </span>
            </Tooltip>
            <Tooltip content="Produk Keluar">
              <span
                onClick={() => onProdukKeluarClick(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <MinIcon />
              </span>
            </Tooltip> */}
            <Tooltip color="danger" content="Delete">
              <span
                onClick={() => deleteButtonPress(data)}
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

  // let data = produk?.data;
  // data = data?.filter(
  //   (row) =>
  //     (row.nama.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.vendor?.toLowerCase().includes(nama.toLowerCase())) &&
  //     row.id_kustom.toLowerCase().includes(id.toLocaleLowerCase())
  // );
  // data = data?.slice(0, 50);
  // const filteredData = produk?.data?.filter(
  //   (row) =>
  //     (row.nama.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
  //       row.vendor?.toLowerCase().includes(nama.toLowerCase())) &&
  //     row.id_kustom.toLowerCase().includes(id.toLocaleLowerCase())
  // );

  const filteredData = produkmasuk?.data;
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData, rowsPerPage]);
  const loadingState = produkmasuk.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  if (produkmasuk.error) return <div>failed to load</div>;
  if (produkmasuk.isLoading) return <div>loading...</div>;
  if (produk.error) return <div>failed to load</div>;
  if (produk.isLoading) return <div>loading...</div>;
  if (vendor.error) return <div>failed to load</div>;
  if (vendor.isLoading) return <div>loading...</div>;

  const col = [
    // {
    //   key: "id_kustom",
    //   label: "Id",
    // },
    // {
    //   key: "nama",
    //   label: "Produk",
    // },
    // {
    //   key: "merek",
    //   label: "Merek",
    // },
    // {
    //   key: "tipe",
    //   label: "Tipe",
    // },
    {
      key: "vendor",
      label: "Vendor",
    },
    // {
    //   key: "stok",
    //   label: "Stok",
    // },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "keluar",
      label: "Keluar",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "total",
      label: "Total",
    },
    {
      key: "terbayar",
      label: "Terbayar",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "jatuhtempo",
      label: "Jatuh Tempo",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];

  const selectedProduk = produk.data[0];
  console.log(selectedProduk);
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-lg p-2">
        <div>Produk: {selectedProduk.nama}</div>
        <div>Merek: {selectedProduk.nmerek}</div>
        <div>Tipe: {selectedProduk.tipe}</div>
        <div>Stok: {selectedProduk.stok}</div>
      </div>
      {/* <div className="flex flex-row gap-2">
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
      </div> */}
      {/* Table Masuk */}
      <Table
        isStriped
        className=""
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Masuk</div>
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
              align={
                ["stok", "jumlah", "keluar"].includes(column.key)
                  ? "end"
                  : "start"
              }
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
      <TabelProdukKeluar id_produk={id_produk ?? null} />
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Produk Masuk
              </ModalHeader>
              <ModalBody>
                {/* <Select
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
                </Select> */}
                <div>
                  {form.id_kustom} | {form.nama} | {form.merek} |{form.tipe}
                </div>
                <Input
                  type="text"
                  label={`Jumlah (Min ${form.keluar}) :`}
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(val) => setForm({ ...form, jumlah: val })}
                />
                <Input
                  type="number"
                  label="Harga"
                  placeholder="Masukkan harga!"
                  value={form.harga}
                  onValueChange={(val) => setForm({ ...form, harga: val })}
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
                <div className="bg-gray-100 p-3 rounded-lg z-40">
                  <div>Tanggal</div>
                  <DatePicker
                    className="z-40"
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) =>
                      setForm({ ...form, startdate: v, tanggal: getDate(v) })
                    }
                  />
                </div>
                <RadioGroup
                  orientation="horizontal"
                  defaultValue={form.lunas}
                  value={form.lunas}
                  onValueChange={(v) => setForm({ ...form, lunas: v })}
                >
                  <Radio value="1">Lunas</Radio>
                  <Radio value="0">Hutang</Radio>
                </RadioGroup>
                {form.lunas == "0" ? (
                  <>
                    <div className="bg-gray-100 p-3 rounded-lg z-40">
                      <div>Jatuh Tempo</div>
                      <DatePicker
                        className="z-40"
                        placeholderText="Pilih tanggal"
                        dateFormat="dd/MM/yyyy"
                        selected={form.startdateJatuhtempo}
                        onChange={(v) =>
                          setForm({
                            ...form,
                            startdateJatuhtempo: v,
                            jatuhtempo: getDate(v),
                          })
                        }
                      />
                    </div>
                    <Input
                      type="number"
                      label={
                        <Harga
                          harga={form.oldTerbayar}
                          label="Terbayar ("
                          endContent=")"
                        />
                      }
                      placeholder="Masukkan nominal!"
                      value={form.terbayar}
                      onValueChange={(val) =>
                        setForm({ ...form, terbayar: val })
                      }
                    />
                  </>
                ) : (
                  <></>
                )}
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
    </div>
  );
}

const TabelProdukKeluar = ({ id_produk }) => {
  const produkkeluar = useClientFetch(
    `produkkeluar?${id_produk ? `id_produk=${id_produk}` : ""}`
  );
  const metodepengeluaran = useClientFetch("metodepengeluaran");
  const [page, setPage] = React.useState(1);
  const [form, setForm] = React.useState({});
  const rowsPerPage = 25;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const saveButtonPress = async (onClose) => {
    // if (form.nama == "" || !form.selectKategori.size > 0)
    //   return alert("Nama, dan Kategori wajib diisi!");
    if (form.selectMetodePengeluaran?.size == 0)
      return alert(`Metode pengeluaran belum diisi.`);
    const res = await fetch(`${apiPath}produkkeluar`, {
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
    // return alert(json.message);
  };
  const deleteButtonPress = async (data) => {
    if (confirm("Hapus produk keluar?")) {
      const res = await fetch(`${apiPath}produkkeluar`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      // return alert(await res.json().then((json) => json.message));
    }
  };
  const editButtonPress = (data) => {
    setForm({
      ...data,
      method: "PUT",
      modalmode: "Edit",
      startdate: new Date(data.tanggal),
      tanggal: getDate(new Date(data.tanggal)),
      startdateJatuhtempo: data.jatuhtempo ? new Date(data.jatuhtempo) : null,
      jatuhtempo: data.jatuhtempo ? getDate(new Date(data.jatuhtempo)) : null,
      oldJumlah: data.jumlah,
      oldTerbayar: data.terbayar,
      oldHarga: data.harga,
      oldSn: data.sn,
      selectMetodePengeluaran: new Set([data.metodepengeluaran]),
      lunas: data.jumlah * data.harga > data.terbayar ? "0" : "1",
    });
    onOpen();
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "tanggal":
        return getDateFId(new Date(data.tanggal));
      case "harga":
        return (
          <div
            className={`text-right px-1 rounded ${
              data.jumlah * data.harga > data.terbayar
                ? new Date() >= new Date(data.jatuhtempo)
                  ? "bg-red-200"
                  : "bg-yellow-200"
                : ""
            }`}
          >
            <Harga harga={data.harga} />
          </div>
        );
      case "jatuhtempo":
        return data.jatuhtempo ? getDateFId(new Date(data.jatuhtempo)) : "";
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
            {data.metodepengeluaran != "proyek" ? (
              <>
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
                    onClick={() => deleteButtonPress(data)}
                    className="text-lg text-danger cursor-pointer active:opacity-50"
                  >
                    <DeleteIcon />
                  </span>
                </Tooltip>
              </>
            ) : (
              <></>
            )}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  const filteredData = produkkeluar?.data;
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData, rowsPerPage]);
  const loadingState = produkkeluar.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;
  if (produkkeluar.error) return <div>failed to load</div>;
  if (produkkeluar.isLoading) return <div>loading...</div>;
  if (metodepengeluaran.error) return <div>failed to load</div>;
  if (metodepengeluaran.isLoading) return <div>loading...</div>;

  const col = [
    // {
    //   key: "id_kustom",
    //   label: "Id",
    // },
    // {
    //   key: "produk",
    //   label: "Produk",
    // },
    // {
    //   key: "merek",
    //   label: "Merek",
    // },
    // {
    //   key: "tipe",
    //   label: "Tipe",
    // },
    {
      key: "vendor",
      label: "Vendor",
    },
    {
      key: "metodepengeluaran",
      label: "Metode Pengeluaran",
    },
    {
      key: "sn",
      label: "SN",
    },
    // {
    //   key: "stok",
    //   label: "Stok",
    // },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    {
      key: "harga",
      label: "Harga",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];

  console.log(form.selectMetodePengeluaran?.size);

  return (
    <>
      <Table
        isStriped
        className=""
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Keluar</div>
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
              align={
                ["stok", "jumlah", "keluar"].includes(column.key)
                  ? "end"
                  : "start"
              }
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
                {form.modalmode} Produk Keluar
              </ModalHeader>
              <ModalBody>
                <div>
                  {form.produk} | {form.merek} | {form.tipe} | {form.vendor}
                </div>
                {form.metodepengeluaran != "proyek" ? (
                  <Select
                    required
                    label="Metode Pengeluaran"
                    placeholder="Pilih metode"
                    className="max-w-xs"
                    selectedKeys={form.selectMetodePengeluaran}
                    onSelectionChange={(val) =>
                      setForm({
                        ...form,
                        selectMetodePengeluaran: val,
                        metodepengeluaran: new Set(val).values().next().value,
                      })
                    }
                  >
                    {metodepengeluaran.data.map((item) => (
                      <SelectItem key={item.nama} value={item.nama}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <></>
                )}
                {form.jumlah == 1 ? (
                  <Input
                    type="text"
                    label="S/N"
                    placeholder="Masukkan S/N!"
                    value={form.sn}
                    onValueChange={(val) => setForm({ ...form, sn: val })}
                  />
                ) : (
                  <></>
                )}
                <Input
                  type="number"
                  label={`Harga Jual (${form.oldHarga})`}
                  placeholder="Masukkan harga!"
                  value={form.harga}
                  onValueChange={(val) => setForm({ ...form, harga: val })}
                />
                {/* <Autocomplete
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
                </Autocomplete> */}
                <div className="bg-gray-100 p-3 rounded-lg z-40">
                  <div>Tanggal</div>
                  <DatePicker
                    className="z-40"
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) =>
                      setForm({ ...form, startdate: v, tanggal: getDate(v) })
                    }
                  />
                </div>
                {/* <Textarea
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan! (Opsional)"
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
    </>
  );
};
