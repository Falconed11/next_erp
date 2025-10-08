"use client";
import React, { useCallback, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import Link from "next/link";
import {
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Form,
  NumberInput,
} from "@heroui/react";
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
  NoteIcon,
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
import { TemplateImport } from "@/components/input";
import { FilterProduk } from "@/components/filter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { Button } from "@heroui/react";
import { Input, Textarea } from "@heroui/react";
import { getDate, getDateF, getDateFId } from "@/app/utils/date";
import { LinkOpenNewTab } from "@/components/mycomponent";
import { AuthorizationComponent } from "@/components/componentmanipulation";
import {
  countPercentProvit,
  countPriceByPercentProfit,
  countPriceByProvitMarginPercent,
  countProvitMarginPercent,
} from "@/app/utils/formula";
import { highRoleCheck } from "@/app/utils/tools";
import { useFilter } from "@react-aria/i18n";

const apiPath = getApiPath();

export default function App() {
  const session = useSession();
  const sessUser = session.data?.user;
  // dynamic input
  const terapkanButton = useRef();
  const [inputs, setInputs] = useState([{ id: uuidv4(), value: "" }]);
  const handleChange = (id, value) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) => (input.id === id ? { ...input, value } : input))
    );
  };
  const addInput = () => {
    setInputs((prevInputs) => [...prevInputs, { id: uuidv4(), value: "" }]);
  };
  const removeInput = (id) => {
    if (inputs.length > 1) {
      setInputs((prevInputs) => prevInputs.filter((input) => input.id !== id));
    }
  };

  const [nama, setNama] = useState("");
  const [id, setId] = useState("");
  const [selectKategori, setSelectKategori] = useState([]);
  const [page, setPage] = React.useState(1);
  const [isReadyStock, setIsReadyStock] = useState(false);
  const rowsPerPage = 10;
  const { contains } = useFilter({ sensitivity: "base" });

  const produk = useClientFetch(
    `produk?kategori=${selectKategori.values().next().value ?? ""}${
      isReadyStock ? `&isReadyStock=${isReadyStock}` : ""
    }`
  );
  const merek = useClientFetch("merek");
  const vendor = useClientFetch("vendor?columnName=nama");
  const metodepengeluaran = useClientFetch("metodepengeluaran");
  const kategori = useClientFetch("kategoriproduk");
  const queries = {
    produk,
    merek,
    vendor,
    metodepengeluaran,
    kategori,
  };

  const [method, setMethod] = useState("POST");
  const [form, setForm] = useState({
    modalmode: "Tambah",
    id: "",
    kategori: "",
    id_kustom: "",
    id_kategori: null,
    nama: "",
    merek: "",
    tipe: "",
    vendor: "",
    stok: "",
    satuan: "",
    hargamodal: 0,
    hargajual: 0,
    selectedKategori: new Set([]),
    select_subkategori: new Set([]),
    select_merek: new Set([]),
    filteredsubkategori: [],
    keterangan: "",
  });
  const [persenProvit, setPersenProvit] = useState(30);
  const provit = (form.hargajual || 0) - (form.hargamodal || 0);
  const [json, setJson] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(0);
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  const modal = { masuk: useDisclosure(), keluar: useDisclosure() };

  const [fieldState, setFieldState] = useState({
    selectedKey: "",
    inputValue: "",
    items: vendor.data?.slice(0, 10), // Initially show only top 10 items
  });
  const [dataKategori, setDataKategori] = useState(kategori?.data);

  const onInputChange = (value) => {
    const filteredItems = vendor.data
      ?.filter((item) => item.nama.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10); // Always limit to top 10 items

    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: value ? filteredItems : vendor.data.slice(0, 10), // If no input, show top 10 unfiltered items
    }));
  };

  const saveButtonPress = async (onClose) => {
    if (form.tipe == "" || (!form.id_kategori && !form.kategoriproduk))
      return alert("Tipe, dan Kategori wajib diisi!");
    if (
      form.modalmode == "Tambah" &&
      !form.id_vendor &&
      !form.vendor &&
      form.stok > 0
    )
      return alert("Jika mengisi stok maka vendor wajib dipilih!");
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
    produk.mutate();
    onClose();
    // return alert(json.message);
  };
  const tambahButtonPress = useCallback(() => {
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
      selectKategori: new Set([]),
      filteredsubkategori: [],
      startdate: new Date(),
      tanggal: getDate(new Date()),
      lunas: "1",
      keterangan: "",
    });
    setDataKategori(kategori?.data);
    setMethod("POST");
    onOpen();
  }, [kategori, onOpen]);
  const editButtonPress = useCallback(
    (data) => {
      const newForm = {
        ...data,
        modalmode: "Edit",
        selectKategori: new Set([String(data.id_kategori)]),
        merek: data.nmerek,
        id_merek: data.id_merek,
        vendor: data.nvendor,
        id_vendor: data.id_vendor,
        startdate: new Date(data.tanggal),
        tanggal: data.tanggal,
      };
      setForm(newForm);
      setDataKategori(kategori?.data);
      setMethod("PUT");
      onOpen();
    },
    [kategori, onOpen]
  );
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
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      produk.mutate();
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
    console.log(data);
    setForm({
      ...data,
      startdate: new Date(),
      tanggal: getDate(new Date()),
      id_produk: data.id,
      harga: data.hargamodal,
      lunas: "1",
    });
    modal.masuk.onOpen();
  };
  const onSimpanClick = async (onClose) => {
    // if (form.jumlah <= 0 || form.harga < 0 || !form.harga)
    //   return alert("Jumlah, dan Harga wajib diisi!");
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
    produk.mutate();
    onClose();
    // return alert(json.message);
  };

  const onProdukKeluarClick = (data) => {
    setForm({
      ...data,
      startdate: new Date(),
      tanggal: getDate(new Date()),
      id_produk: data.id,
      sn: "1",
      selectMetodePengeluaran: new Set([]),
    });
    modal.keluar.onOpen();
  };
  const onSimpanProdukKeluarClick = async (onClose) => {
    if (form.selectMetodePengeluaran.size == 0)
      return alert("Metode pengeluaran belum diisi.");
    if (form.jumlah > form.stok) return alert("Jumlah melebihi stok.");
    if (form.sn == 1) {
      if (
        inputs.some((i) => {
          if (i.value == "") return true;
          return false;
        })
      )
        return alert("Serial number belum diisi.");
    }
    const res = await fetch(`${apiPath}produkkeluar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ ...form, serialnumbers: inputs }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // return alert(json.message);
  };

  const exportStok = () => {
    // if (selectedKeys.size == 0) return alert("Proyek belum dipilih");
    // const data = penawaran.data.filter((v) =>
    //   selectedKeys.has(String(v.id_proyek))
    // );
    const worksheet = XLSX.utils.json_to_sheet(produk.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(workbook, `stok-${getDateF(new Date())}.xlsx`, {
      compression: true,
    });
  };

  const renderCell = React.useCallback(
    (data, columnKey) => {
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
        case "totalmodal":
          return (
            <div className="text-right">
              <Harga harga={data.hargamodal * data.stok} />
            </div>
          );
        case "totaljual":
          return (
            <div className="text-right">
              <Harga harga={data.hargajual * data.stok} />
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
              <LinkOpenNewTab
                content="Riwayat"
                link={`/produk/masuk?id_produk=${data.id}`}
                icon={<NoteIcon />}
              />
              <Tooltip content="Edit">
                <span
                  onClick={() => editButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip content="Produk Masuk">
                <span
                  onClick={() => onProdukMasukClick(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <AddIcon />
                </span>
              </Tooltip>
              {/* {data.stok > 0 ? (
              <Tooltip content="Produk Keluar">
                <span
                  onClick={() => onProdukKeluarClick(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <MinIcon />
                </span>
              </Tooltip>
            ) : (
              <></>
            )} */}
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
    },
    [kategori]
  );
  const filteredData = useMemo(() => {
    if (!produk?.data) return [];
    return produk.data.filter(
      (row) =>
        (row.nama.toLowerCase().includes(nama.toLowerCase()) ||
          row.nmerek?.toLowerCase().includes(nama.toLowerCase()) ||
          row.tipe?.toLowerCase().includes(nama.toLowerCase()) ||
          row.vendor?.toLowerCase().includes(nama.toLowerCase()) ||
          row.keterangan?.toLowerCase().includes(nama.toLowerCase())) &&
        row.id_kustom.toLowerCase().includes(id.toLowerCase())
    );
  }, [produk?.data, nama, id]);
  const dataMerek = useMemo(() => {
    if (!merek?.data) return [];
    return merek.data
      .filter((merek) =>
        merek.nama.toLowerCase().includes(form.merek.toLowerCase())
      )
      .slice(0, 20);
  }, [merek?.data, form.merek]);
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData?.length, rowsPerPage]);
  const loadingState = produk.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;
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
      key: "kategoriproduk",
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
    // {
    //   key: "nvendor",
    //   label: "Vendor",
    // },
    {
      key: "stok",
      label: "Stok",
    },
    {
      key: "satuan",
      label: "Satuan",
    },
    ...(isHighRole
      ? [
          {
            key: "hargamodal",
            label: "Harga Modal",
          },
        ]
      : []),
    {
      key: "hargajual",
      label: "Harga Jual",
    },
    ...(isHighRole
      ? [
          {
            key: "totalmodal",
            label: "Total Modal",
          },
        ]
      : []),
    {
      key: "totaljual",
      label: "Total Jual",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
  ];

  let filteredsubkategori = [
    { nama: "Silahkan pilih kategori terlebih dahulu" },
  ];

  const totalModal = produk.data.reduce(
    (acc, cur) => acc + cur.stok * cur.hargamodal,
    0
  );
  const totalJual = produk.data.reduce(
    (acc, cur) => acc + cur.stok * cur.hargajual,
    0
  );
  const result = produk.data.reduce((acc, item) => {
    const existing = acc.find(
      (entry) => entry.kategori === item.kategoriproduk
    );
    if (existing) {
      existing.totalModal += item.stok * item.hargamodal;
      existing.totalJual += item.stok * item.hargajual;
    } else {
      acc.push({
        kategori: item.kategoriproduk,
        totalModal: item.stok * item.hargamodal,
        totalJual: item.stok * item.hargajual,
      });
    }
    return acc;
  }, []);
  const classCompByRole = isHighRole ? "" : "hidden";
  // if (form.id_kategori) {
  //   filteredsubkategori = subkategori.data.filter((item) => {
  //     if (item.id_kategoriproduk == form.id_kategori) return item;
  //   });
  // }
  console.log([form.kategoriproduk, form.id_kategori]);
  return (
    <div className="">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {isHighRole && (
            <Button color="primary" onPress={tambahButtonPress}>
              Tambah
            </Button>
          )}
          <div className="flex flex-row gap-2">
            <Button color="primary" onPress={exportStok}>
              Export Stok
            </Button>
          </div>
        </div>
        <AuthorizationComponent
          roles={["super", "admin"]}
          user={sessUser}
          component={
            <>
              <div>
                <TemplateImport
                  report={report}
                  setReportList={setReportList}
                  name={"Import Produk"}
                  apiendpoint={"importproduk"}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  formatLink={"/produk.xlsx"}
                />
              </div>
            </>
          }
        />
      </div>
      <Table
        isStriped
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <>
            <FilterProduk
              id={id}
              setId={setId}
              nama={nama}
              setNama={setNama}
              selectKategori={selectKategori}
              setSelectKategori={setSelectKategori}
              page={page}
              setPage={setPage}
              isReadyStock={isReadyStock}
              setIsReadyStock={setIsReadyStock}
              kategori={kategori}
            />
            {/* <div className="flex flex-row gap-2">
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
      {/* Tambah Edit Produk */}
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
                <Autocomplete
                  variant="bordered"
                  label={
                    <LabelRecordCheck
                      title={"Kategori"}
                      isNotAvailable={
                        form.kategoriproduk && form.id_kategori == null
                      }
                    />
                  }
                  allowsCustomValue
                  // isClearable={false}
                  items={dataKategori}
                  placeholder="Cari kategori"
                  className="max-w-xs"
                  inputValue={form.kategoriproduk}
                  selectedKey={form.id_kategori}
                  // defaultSelectedKey={form.id_kategori}
                  // defaultInputValue={form.kategoriproduk}
                  onSelectionChange={(key) => {
                    let selectedItem = kategori.data.find(
                      (option) => option.id == key
                    );
                    setDataKategori(
                      kategori.data.filter((item) =>
                        contains(item.nama, selectedItem?.nama || "")
                      )
                    );
                    setForm((prevState) => {
                      return {
                        ...prevState,
                        kategoriproduk:
                          selectedItem?.nama || prevState.kategoriproduk,
                        id_kategori: key || prevState.id_kategori,
                      };
                    });
                  }}
                  onInputChange={(value) => {
                    setDataKategori(
                      kategori.data.filter((item) => contains(item.nama, value))
                    );
                    setForm((prevState) => ({
                      ...prevState,
                      kategoriproduk: value,
                      id_kategori:
                        kategori.data.find(
                          (option) =>
                            option.nama?.toLowerCase() == value.toLowerCase()
                        )?.id ?? null,
                    }));
                  }}
                  onOpenChange={(isOpen, menuTrigger) => {
                    if (menuTrigger === "manual" && isOpen) {
                      setDataKategori(kategori.data);
                      setForm((prevState) => ({
                        ...prevState,
                        kategoriproduk: prevState.kategoriproduk,
                        id_kategori: prevState.id_kategori,
                      }));
                    }
                  }}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                {/* <Autocomplete
                  variant="bordered"
                  label={
                    <LabelRecordCheck
                      title={"Kategori"}
                      isNotAvailable={
                        form.kategoriproduk && form.id_kategori == null
                      }
                    />
                  }
                  allowsCustomValue
                  isClearable={false}
                  defaultItems={kategori.data}
                  placeholder="Cari kategori"
                  className="max-w-xs"
                  selectedKey={form.id_kategori}
                  // inputValue={form.kategoriproduk}
                  defaultSelectedKey={form.id_kategori}
                  defaultInputValue={form.kategoriproduk}
                  onSelectionChange={(v) =>
                    setForm({ ...form, id_kategori: v })
                  }
                  onValueChange={(v) => setForm({ ...form, kategoriproduk: v })}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama}
                    </AutocompleteItem>
                  )}
                </Autocomplete> */}
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
                  variant="bordered"
                  label={
                    <LabelRecordCheck
                      title={"Merek"}
                      isNotAvailable={form.merek && !form.id_merek}
                    />
                  }
                  allowsCustomValue
                  isClearable={false}
                  defaultItems={dataMerek}
                  placeholder="Cari merek"
                  className="max-w-xs"
                  selectedKey={form.id_merek}
                  defaultSelectedKey={form.id_merek}
                  defaultInputValue={form.merek}
                  onSelectionChange={(v) => setForm({ ...form, id_merek: v })}
                  onValueChange={(v) => setForm({ ...form, merek: v })}
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
                {form.modalmode == "Tambah" ? (
                  <>
                    <NumberInput
                      hideStepper
                      isWheelDisabled
                      formatOptions={{
                        useGrouping: false,
                      }}
                      label="Stok"
                      placeholder="Masukkan stok!"
                      isReadOnly={form.modalmode == "Edit" ? true : undefined}
                      value={form.stok}
                      onValueChange={(val) => setForm({ ...form, stok: val })}
                    />
                    <Autocomplete
                      allowsCustomValue
                      isClearable={false}
                      isDisabled={form.stok ? undefined : true}
                      label={
                        <LabelRecordCheck
                          title={"Vendor"}
                          isNotAvailable={form.vendor && !form.id_vendor}
                        />
                      }
                      variant="bordered"
                      defaultItems={vendor.data}
                      placeholder="Cari vendor"
                      className="max-w-xs"
                      selectedKey={form.id_vendor}
                      defaultSelectedKey={form.id_vendor}
                      defaultInputValue={form.vendor}
                      onSelectionChange={(v) => {
                        const selectedVendor = vendor.data.find(
                          (o) => o.id == v
                        );
                        setForm({
                          ...form,
                          id_vendor: v,
                          alamat: selectedVendor?.alamat,
                        });
                      }}
                      onValueChange={(v) => setForm({ ...form, vendor: v })}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.id} textValue={item.nama}>
                          {item.nama}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                    <Textarea
                      isDisabled={!form.stok || !form.vendor ? true : undefined}
                      label="alamat"
                      labelPlacement="inside"
                      placeholder="Masukkan alamat!"
                      value={form.alamat || ""}
                      onValueChange={(val) => setForm({ ...form, alamat: val })}
                    />
                  </>
                ) : (
                  <></>
                )}
                <Input
                  type="text"
                  label="Satuan"
                  placeholder="Masukkan satuan!"
                  value={form.satuan}
                  onValueChange={(val) => setForm({ ...form, satuan: val })}
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  className={classCompByRole}
                  label="Harga Modal"
                  placeholder="Masukkan harga modal!"
                  value={form.hargamodal}
                  onValueChange={(val) => setForm({ ...form, hargamodal: val })}
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  label="Harga Jual"
                  placeholder="Masukkan harga jual!"
                  value={form.hargajual}
                  onValueChange={(val) => setForm({ ...form, hargajual: val })}
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  className={classCompByRole}
                  label="Provit"
                  // label={`Provit (${
                  //   Math.round(
                  //     countPercentProvit(
                  //       form.hargamodal || 0,
                  //       form.hargajual || 0
                  //     ) * 100
                  //   ) / 100
                  // }%)`}
                  placeholder="Masukkan Provit!"
                  value={form.hargajual - form.hargamodal}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      hargajual: (+form.hargamodal || 0) + (+v || 0),
                    })
                  }
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  className={classCompByRole}
                  label="Persen Provit (%)"
                  placeholder="Masukkan persen provit!"
                  value={
                    Math.round(
                      countPercentProvit(form.hargamodal, form.hargajual) * 100
                    ) / 100
                  }
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      hargajual: Math.round(
                        countPriceByPercentProfit(form.hargamodal, v)
                      ),
                    })
                  }
                />
                {/* <NumberInput
                  hideStepper
                  isWheelDisabled
                  label="Persen Provit"
                  placeholder="Masukkan Persen Provit!"
                  value={persenProvit}
                  endContent={
                    <Button
                      ref={terapkanButton}
                      size="sm"
                      color="primary"
                      type="button"
                      onPress={() => {
                        setForm({
                          ...form,
                          hargajual: Math.ceil(
                            countPriceByPercentProfit(
                              form.hargamodal,
                              persenProvit
                            )
                          ),
                        });
                      }}
                    >
                      Terapkan
                    </Button>
                  }
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      terapkanButton.current?.click();
                    }
                  }}
                  onValueChange={setPersenProvit}
                /> */}
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
                {form.modalmode == "Tambah" && form.stok > 0 ? (
                  <>
                    <RadioGroup
                      orientation="horizontal"
                      defaultValue={"1"}
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
                          label="Terbayar"
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
                  <div key={i}>
                    {i + 1}. {r}
                  </div>
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
      {/* masuk */}
      <Modal
        isOpen={modal.masuk.isOpen}
        onOpenChange={modal.masuk.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Produk Masuk
              </ModalHeader>
              <ModalBody>
                <div>
                  {form.id_kustom} | {form.nama} | {form.nmerek} | {form.tipe} |
                  Stok: {form.stok}
                </div>
                <Autocomplete
                  label="Vendor"
                  variant="bordered"
                  //defaultItems={fieldState.items}
                  items={fieldState.items ?? vendor.data.slice(0, 10)}
                  placeholder="Cari vendor"
                  className="max-w-xs"
                  selectedKey={form.id_vendor}
                  defaultSelectedKey={form.id_vendor}
                  defaultInputValue={form.vendor}
                  onSelectionChange={(v) => setForm({ ...form, id_vendor: v })}
                  onInputChange={onInputChange}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  label="Jumlah"
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(val) => setForm({ ...form, jumlah: val })}
                />
                <NumberInput
                  hideStepper
                  isWheelDisabled
                  formatOptions={{
                    useGrouping: false,
                  }}
                  className={classCompByRole}
                  label={
                    <>
                      Harga Modal (Ref: <Harga harga={form.hargamodal} />)
                    </>
                  }
                  placeholder="Masukkan harga modal!"
                  value={form.harga}
                  onValueChange={(val) => setForm({ ...form, harga: val })}
                />
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
                  defaultValue={"1"}
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
                      label="Terbayar"
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
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={() => onSimpanClick(onClose)}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* keluar */}
      <Modal
        isOpen={modal.keluar.isOpen}
        onOpenChange={modal.keluar.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Produk Keluar
              </ModalHeader>
              <ModalBody>
                <div>
                  {form.id_kustom} | {form.nama} | {form.nmerek} | {form.tipe} |
                  Stok: {form.stok}
                </div>
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
                <Select
                  required
                  label="Metode Pengeluaran"
                  placeholder="Pilih metode"
                  className="max-w-xs"
                  isRequired
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
                <RadioGroup
                  orientation="horizontal"
                  defaultValue={"1"}
                  value={form.sn}
                  onValueChange={(v) => setForm({ ...form, sn: v })}
                >
                  <Radio value="1">SN</Radio>
                  <Radio value="0">Tanpa SN</Radio>
                </RadioGroup>
                {form.sn == "1" ? (
                  <>
                    {inputs.map((input, i) => (
                      <div key={input.id}>
                        <Input
                          label={`Serial Number ${
                            inputs.length > 1 ? i + 1 : ""
                          } `}
                          placeholder="Masukkan serial number!"
                          type="text"
                          endContent={
                            inputs.length !== 1 ? (
                              <Button
                                color="danger"
                                variant="light"
                                onPress={() => removeInput(input.id)}
                              >
                                Hapus
                              </Button>
                            ) : null
                          }
                          value={input.value}
                          onChange={(e) =>
                            handleChange(input.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                    {inputs.length < form.stok ? (
                      <div>
                        <Button color="primary" onPress={addInput}>
                          Tambah SN
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Input
                    type="number"
                    min={1}
                    max={form.stok}
                    label={`Jumlah (Stok: ${form.stok})`}
                    placeholder="Masukkan jumlah!"
                    value={form.jumlah}
                    onValueChange={(val) => setForm({ ...form, jumlah: val })}
                  />
                )}

                <Input
                  type="number"
                  label={`Harga Jual (Ref: ${form.hargajual})`}
                  placeholder="Masukkan harga!"
                  value={form.harga}
                  onValueChange={(val) => setForm({ ...form, harga: val })}
                />
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
                  onPress={() => onSimpanProdukKeluarClick(onClose)}
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

const LabelRecordCheck = ({ title, isNotAvailable }) => {
  return (
    <>
      {title}
      {isNotAvailable && (
        <span className="text-danger">{" *Data tidak terdaftar"}</span>
      )}
    </>
  );
};
