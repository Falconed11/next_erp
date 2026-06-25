"use client";
import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { RadioGroup, Radio, Badge } from "@heroui/react";
import { getApiPath } from "@/app/utils/apiconfig";
const apiPath = getApiPath();
import { fIdProyek } from "@/app/utils/formatid";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Tooltip,
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
  NoteIcon,
  ReportMoneyIcon,
} from "@/components/my/icon";
import { getDate, getDateF } from "@/app/utils/date";
import {
  capitalizeEachWord,
  highRoleCheck,
  key2set,
  renderQueryStates,
  rolesCheck,
  set2key,
  updateForm,
  useDebounce,
} from "@/app/utils/tools";
import { UpdateShowHide } from "@/components/my/input";
import { RangeDate } from "@/components/my/input";
import { FilterCard, LinkOpenNewTab } from "@/components/my/mycomponent";
import Harga from "@/components/my/harga";
import { ShowHideComponent2 } from "@/components/my/componentmanipulation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SelectStatusProyek from "@/components/my/selectstatusproyek";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";
import { StatusProyek } from "./statusproyek";
import PrintDaftarProyek from "./printdaftarproyek";
import {
  AutocompleteCustomer,
  AutocompleteJenisProyek,
} from "@/components/my/myautocomplete";
import { BadgeStatusProyek } from "@/components/my/badgestatusproyek";
import { useReactToPrint } from "react-to-print";
import { useClientFetch } from "@/hooks/useClientFetch";
import { apiFetch } from "@/app/utils/fetchHelper";
import { saveProyek, duplicateProyek } from "@/services/proyek.service";
import { FilterHidden } from "@/components/my/filter";
import { countOffset, countPages } from "@/app/utils/formula";

export default function App({
  idProyek,
  id_instansi,
  id_karyawan,
  startDate,
  endDate,
  id_produk,
  user,
}) {
  const [sort, setSort] = useState("tanggal_penawaran");
  const sessUser = user;
  const { peran } = sessUser;
  // filter
  const [isShowHidden, setIsShowHidden] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [current, setCurrent] = useState({
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });
  const [selectkaryawan, setSelectKaryawan] = useState(
    new Set(id_karyawan ? [id_karyawan] : null),
    // new Set([])
  );
  const [stat, setStat] = useState(1);
  const [selectStatusProyek, setSelectStatusProyek] = useState();
  const [filterText, setFilterText] = useState("");
  const [filterBy, setFilterBy] = useState("nama");
  const debouncedFilterText = useDebounce(filterText, 500);
  const printProyekRef = useRef(null);
  const handlePrintProyek = useReactToPrint({
    // content: () => printProyekRef.current,
    contentRef: printProyekRef,
    pageStyle: "bg-white block",
    documentTitle: "Daftar Proyek",
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const offset = countOffset(page, rowsPerPage);
  const proyek = useClientFetch(
    `proyek?${[
      ...(isShowHidden ? [] : ["hide=0"]),
      ...(idProyek ? [`id=${idProyek}`] : []),
      ...(id_instansi ? [`id_instansi=${id_instansi}`] : []),
      ...(selectkaryawan.size > 0
        ? [`id_karyawan=${set2key(selectkaryawan)}`]
        : []),
      ...(current.startDate ? [`start=${getDate(current.startDate)}`] : []),
      ...(current.endDate ? [`end=${getDate(current.endDate)}`] : []),
      ...(selectStatusProyek ? [`id_statusproyek=${selectStatusProyek}`] : []),
      ...(id_produk ? [`id_produk=${id_produk}`] : []),
      ...(debouncedFilterText ? [`${filterBy}=${debouncedFilterText}`] : []),
      `sort=${sort}`,
      `limit=${rowsPerPage}`,
      `offset=${offset}`,
    ].join("&")}`,
  );
  const produk = useClientFetch(id_produk ? `produk?id=${id_produk}` : null);
  const customer = useClientFetch(`customer`);
  const penawaran = useClientFetch(
    `exportpenawaran?start=${getDate(current.startDate)}&end=${getDate(
      current.endDate,
    )}`,
  );
  const perusahaan = useClientFetch("perusahaan");
  const karyawan = useClientFetch("karyawan");
  // const statusproyek = useClientFetch("statusproyek?ids=1&ids=3");
  const statusproyek = useClientFetch("statusproyek?nids=2&nids=-1");
  const kategoriproyek = useClientFetch("kategoriproyek");
  const queries = {
    produk,
    // proyek,
    penawaran,
    perusahaan,
    karyawan,
    statusproyek,
    customer,
    kategoriproyek,
  };
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("POST");
  const [json, setJson] = useState([]);
  const loadingState = proyek.isLoading ? "loading" : "idle";
  const saveButtonPress = async (onClose) => {
    // if (form.isSwasta.size == 0) return alert("Swasta/Negri belum diisi");
    try {
      await apiFetch(`${apiPath}proyek`, {
        method,
        body: JSON.stringify(form),
      });
      proyek.mutate();
      onClose();
    } catch (error) {
      alert(error.message || "Save failed");
    }
  };
  const tambahButtonPress = () => {
    const now = new Date();
    const idKaryawan = sessUser.id_karyawan;
    setForm({
      modalmode: "Tambah",
      id: "",
      nama: "",
      klien: "",
      instansi: "",
      kota: "",
      selectkaryawan: key2set(idKaryawan),
      id_karyawan: idKaryawan,
      isSwasta: "",
      tanggal_penawaran: getDate(now),
      startdate: now,
      keterangan: "",
      id_statusproyek: 1,
      last_user: sessUser?.nama,
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal_penawaran);
    const idKaryawan = data.id_karyawan;
    const sessIdKaryawan = sessUser.id_karyawan;
    setForm({
      ...data,
      modalmode: "Edit",
      tanggal_penawaran: getDate(startdate),
      startdate,
      selectkaryawan: key2set(idKaryawan || sessIdKaryawan),
      id_karyawan: idKaryawan || sessIdKaryawan,
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
      try {
        await apiFetch(`${apiPath}proyek`, {
          method: "DELETE",
          body: JSON.stringify({ id }),
        });
        proyek.mutate();
      } catch (error) {
        alert(error.message || "Delete failed");
      }
    }
  };
  const handleDuplicatePress = async (id) => {
    if (!confirm("Duplicate this proyek?")) return;
    try {
      const res = await duplicateProyek(id);
      proyek.mutate();
      alert("Proyek berhasil diduplikasi");
    } catch (error) {
      alert("Error: " + error.message);
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
    // console.log(json);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const dataArray = await Promise.all(
        json.map((v) =>
          apiFetch(`${apiPath}proyek`, {
            method: "POST",
            body: JSON.stringify({ ...v, id_second: v.id }),
          }),
        ),
      );
      setReportList(dataArray.map((v, i) => `${i + 1}. ${v.message}`));
    } catch (error) {
      alert(error.message || "Upload failed");
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
      { compression: true },
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
      selectedKeys.has(String(v.id_proyek)),
    );
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    XLSX.writeFile(workbook, `exportpenawaran-${getDateF(new Date())}.xlsx`, {
      compression: true,
    });
  };

  const isHighRole = highRoleCheck(sessUser?.rank);
  const renderCell = useCallback(
    (data, columnKey) => {
      const cellValue = data[columnKey];
      const date = new Date(data.tanggal);
      const versi = data.versi;
      const idStatusProyek = data.id_statusproyek;
      const tanggalReject = data.tanggal_reject;
      const sTanggal = "text-white font-bold p-1 rounded";
      switch (columnKey) {
        case "no":
          return `${penawaran(data.id_kustom, date, data.id_karyawan)}`;
        case "swasta":
          return data.swasta ? "swasta" : "negri";
        case "statusproyek":
          return (
            <BadgeStatusProyek
              idStatusProyek={idStatusProyek}
              data={data}
              versi={versi}
            />
          );
        case "pengeluaranproyek":
          return (
            <div className="text-right">
              <Harga harga={data.pengeluaranproyek} />
            </div>
          );
        case "totalpembayaranproyek":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "totalmodal":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "totalpenawaran":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "progress":
          return (
            <div className="text-right">
              <Harga harga={cellValue} />
            </div>
          );
        case "tanggal":
          return (
            <div>
              {data.id_statusproyek == -1 ? (
                tanggalReject ? (
                  <span className={`bg-red-600 ${sTanggal}`}>
                    {getDateF(new Date(tanggalReject))}
                  </span>
                ) : (
                  ""
                )
              ) : cellValue && data.progress == 100 ? (
                <span className={`bg-green-400 ${sTanggal}`}>
                  {getDateF(new Date(cellValue))}
                </span>
              ) : (
                ""
              )}
            </div>
          );
        case "tanggal_penawaran":
          return getDateF(new Date(data.tanggal_penawaran));
        case "totalharga":
          return data.jumlah * data.harga;
        case "id_kustom":
          return data.versi > 0
            ? fIdProyek(data.id_kustom, new Date(data.tanggal))
            : "";
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
              {/* <LinkOpenNewTab
                content="Aktivitas Sales"
                link={`/proyek/aktivitassales?id=${data.id}&versi=${
                  data.versi <= 0 ? "1" : data.versi
                }`}
                icon={<BusinessProgressBarIcon />}
              /> */}
              <LinkOpenNewTab
                content="Detail (Penawaran, Invoice, Surat Jalan, & Kwitansi)"
                link={`/proyek/detail?id=${data.id}&versi=${
                  data.versi <= 0 ? "1" : data.versi
                }`}
                icon={<NoteIcon />}
              />
              {rolesCheck(
                ["super", "admin", "head-sales", "sales", "owner"],
                peran,
              ) && (
                <Tooltip content="Proses (Pengeluaran & Pembayaran)">
                  <Link href={`/proyek/detail/proses?id=${data.id}`}>
                    <span
                      // onClick={() => detailButtonPress(data)}
                      role="link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/proyek/detail/proses?id=${data.id}`);
                      }}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      <ReportMoneyIcon />
                    </span>
                  </Link>
                </Tooltip>
              )}
              {/* {versi > 0 ? (
                peran == "admin" || peran == "super" ? (
                  <Tooltip content="Pengeluaran Proyek">
                    <Link href={`/proyek/detail/proses?id=${data.id}`}>
                      <span
                        // onClick={() => detailButtonPress(data)}
                        role="link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`/proyek/detail/proses?id=${data.id}`);
                        }}
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
              )} */}
              {(!data.id_karyawan ||
                isHighRole ||
                sessUser.id_karyawan == data.id_karyawan) && (
                <>
                  <Tooltip content="Duplicate">
                    <span
                      onClick={() => handleDuplicatePress(data.id)}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      ⧉
                    </span>
                  </Tooltip>
                  <Tooltip content="Edit">
                    <span
                      onClick={() => editButtonPress(data)}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      <EditIcon />
                    </span>
                  </Tooltip>
                  <UpdateShowHide
                    data={data}
                    mutate={proyek.mutate}
                    onFetch={saveProyek}
                  />
                </>
              )}
              {/* <Tooltip content="Export">
                <span
                  onClick={() => handleExportButtonPress(data)}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <FileExportIcon />
                </span>
              </Tooltip> */}
              {["super", "admin"].includes(peran) ? (
                <Tooltip color="danger" variant="solid" content="Delete">
                  <span
                    onClick={() => deleteButtonPress(data.id)}
                    className="text-lg text-danger cursor-pointer active:opacity-50"
                  >
                    <DeleteIcon />
                  </span>
                </Tooltip>
              ) : (
                <></>
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [user],
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();
  const queryStates = renderQueryStates(queries);
  if (queryStates) return queryStates;

  const selectedProyek = proyek?.data?.[0];
  const totalRows = selectedProyek?.totalrows;
  const pages = countPages(totalRows, rowsPerPage);

  const columns = [
    {
      key: "aksi",
      label: "Aksi",
    },
    {
      key: "tanggal_penawaran",
      label: "Tanggal Penawaran",
    },
    {
      key: "tanggal",
      label: "Tanggal Deal/Reject",
    },
    {
      key: "id_second",
      label: "Id Proyek",
    },
    {
      key: "jenisproyek",
      label: "Jenis Proyek",
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
      key: "nama",
      label: "Nama Proyek",
    },
    ...(!id_instansi
      ? [
          {
            key: "instansi",
            label: "Customer",
          },
        ]
      : []),
    {
      key: "klien",
      label: "Klien",
    },
    {
      key: "kota",
      label: "Kota",
    },
    {
      key: "id_po",
      label: "No. PO",
    },
    {
      key: "namakaryawan",
      label: "Sales",
    },
    {
      key: "statusproyek",
      label: "Status",
    },
    {
      key: "progress",
      label: "Progress (%)",
    },
    ...(isHighRole
      ? [
          {
            key: "totalmodal",
            label: "Estimasi Modal",
          },
        ]
      : []),
    {
      key: "totalpenawaran",
      label: "Penawaran",
    },
    ...(isHighRole
      ? [
          {
            key: "pengeluaranproyek",
            label: "Pengeluaran Proyek",
          },
        ]
      : []),
    {
      key: "totalpembayaranproyek",
      label: "Total Pembayaran",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    },
  ];
  const nPenawaran = proyek?.data?.length;
  const summary = proyek?.data?.reduce(
    (acc, current) => {
      const versi = current.versi;
      if (versi == 0) {
        acc.nOfferingWaiting++;
        acc.totalPenawaranWaiting += +current.totalpenawaran;
        acc.totalModalWaiting += +current.totalmodal;
      }
      if (versi > 0) {
        acc.nOfferingDeal++;
        acc.totalPenawaranDeal += +current.totalpenawaran;
        acc.totalModalDeal += +current.totalmodal;
      }
      if (versi < 0) {
        acc.nOfferingReject++;
        acc.totalPenawaranReject += +current.totalpenawaran;
        acc.totalModalReject += +current.totalmodal;
      }
      return acc;
    },
    {
      nOfferingDeal: 0,
      nOfferingWaiting: 0,
      nOfferingReject: 0,
      totalPenawaranDeal: 0,
      totalPenawaranReject: 0,
      totalPenawaranWaiting: 0,
      totalModalDeal: 0,
      totalModalReject: 0,
      totalModalWaiting: 0,
    },
  ) || { totalModal: 0, totalPenawaran: 0, totalProvit: 0 };
  summary.totalModal =
    summary?.totalModalDeal +
    summary?.totalModalReject +
    summary?.totalModalWaiting;
  summary.totalPenawaran =
    summary?.totalPenawaranDeal +
    summary?.totalPenawaranReject +
    summary?.totalPenawaranWaiting;
  summary.totalProvit = summary?.totalPenawaran - summary?.totalModal;
  const isCustomerSelected =
    form.id_instansi || !form.instansi ? true : undefined;

  const Section = ({ title, items }) => (
    <div className="text-center text-sm">
      <div className="gap-2 flex flex-col">
        <div>{title}</div>
        {items.map((item, i) => (
          <div
            key={i}
            className={`shadow-lg px-2 py-1 rounded-large ${
              item.color === "primary" || item.color === "danger"
                ? "text-white"
                : ""
            } bg-${item.color}`}
          >
            <div>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
  const selectedProduct = produk.data?.[0];
  const selectedCustomer = customer.data.find((item) => item.id == id_instansi);
  // console.log(selectkaryawan);
  console.log("rerender");
  return (
    <div
    // className="flex flex-col gap-2 w-7/8- h-3/4"
    >
      {/* <div>
        <div className="bg-white p-2 rounded-lg inline-flex gap-2 items-center">
          <div className="font-bold text-lg">Proyek</div>
          <Button
            variant="shadow"
            size="sm"
            color="primary" variant="solid"
            onClick={tambahButtonPress}
          >
            <span className="text-xl font-bold">
              <AddIcon />
            </span>
            Tambah
          </Button>
          <Button
            variant="shadow"
            size="sm"
            color="primary" variant="solid"
            onClick={handlePrintProyek}
          >
            <span className="text-xl font-bold">
              <AddIcon />
            </span>
            Print
          </Button>
        </div>
      </div> */}
      <div className="w-300-">
        <Table
          key={peran}
          isStriped
          aria-label="Example table with custom cells"
          // selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          topContent={
            <div className="flex gap-2">
              {/* Filter & Report */}
              <div className="flex gap-2 flex-col">
                <ShowHideComponent2
                  initialState
                  closeContent="Buka Filter"
                  openContent="Tutup Filter"
                >
                  <div className="flex gap-2">
                    {/* Filter */}
                    <div className="flex flex-col gap-2 shadow-lg border rounded-lg p-3">
                      <div className="font-bold text-lg">Filter</div>
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-2">
                          <RadioGroup
                            orientation="horizontal"
                            value={sort}
                            onValueChange={setSort}
                          >
                            <Radio value="tanggal_penawaran">Penawaran</Radio>
                            <Radio value="tanggal">Deal</Radio>
                          </RadioGroup>
                          <div className="flex flex-row gap-2">
                            <div className="flex">
                              <RangeDate
                                current={current}
                                setCurrent={setCurrent}
                                setPage={setPage}
                              />
                            </div>
                          </div>
                          <Select
                            className="max-w-xs"
                            label="Sales"
                            placeholder="Pilih sales"
                            selectedKeys={selectkaryawan}
                            color="default"
                            variant="bordered"
                            onSelectionChange={(v) => {
                              setSelectKaryawan(v);
                              setPage(1);
                            }}
                          >
                            {karyawan.data.map((v) => (
                              <SelectItem key={v.id} textValue={v.nama || "NN"}>
                                {v.nama || "NN"}
                              </SelectItem>
                            ))}
                          </Select>
                          <SelectStatusProyek
                            select={selectStatusProyek}
                            setSelect={setSelectStatusProyek}
                            setPage={setPage}
                          />
                          {/* filter */}
                          <div className="grid grid-cols-5 gap-2">
                            <Input
                              className="col-span-3"
                              type="text"
                              color="default"
                              variant="bordered"
                              label="Filter"
                              placeholder="Masukkan nama atau klien"
                              value={filterText}
                              onValueChange={setFilterText}
                            />
                            <Select
                              className="col-span-2"
                              label="Filter By"
                              color="default"
                              variant="bordered"
                              selectedKeys={new Set([filterBy])}
                              onSelectionChange={(keys) =>
                                setFilterBy(Array.from(keys)[0])
                              }
                              classNames={{ popoverContent: "w-auto" }}
                              disallowEmptySelection
                            >
                              {[
                                { key: "nama", label: "Nama Proyek" },
                                { key: "klien", label: "Klien" },
                              ].map((o) => (
                                <SelectItem key={o.key}>{o.label}</SelectItem>
                              ))}
                            </Select>
                          </div>
                          <FilterHidden
                            isShowHidden={isShowHidden}
                            setIsShowHidden={setIsShowHidden}
                          />
                        </div>
                        {selectedProduct && (
                          <div>
                            <div className="font-bold text-lg">Produk</div>
                            {[
                              { label: "Id", value: selectedProduct.id },
                              { label: "Nama", value: selectedProduct.nama },
                              { label: "Merek", value: selectedProduct.nmerek },
                              { label: "Tipe", value: selectedProduct.tipe },
                              {
                                label: "Satuan",
                                value: selectedProduct.satuan,
                              },
                              {
                                label: "Keterangan",
                                value: selectedProduct.keterangan,
                              },
                            ].map((o, i) => (
                              <div key={i}>
                                {o.label} : {o.value}
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedCustomer && (
                          <div>
                            <FilterCard
                              title={"Customer"}
                              arrayContent={[
                                { label: "Id", value: selectedCustomer.id },
                                { label: "Nama", value: selectedCustomer.nama },
                                {
                                  label: "Alamat",
                                  value: selectedCustomer.alamat,
                                },
                              ]}
                              link="proyek"
                            />
                          </div>
                        )}
                        {idProyek && (
                          <div>
                            <FilterCard
                              title={"Proyek"}
                              arrayContent={[
                                { label: "Id", value: idProyek },
                                { label: "Nama", value: selectedProyek?.nama },
                              ]}
                              link="proyek"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Ringkasan */}
                    {false && (
                      <div>
                        <div className="text-lg shadow-lg border border-black- p-3 rounded-xl">
                          <div className="font-bold">Ringkasan</div>
                          <div className="flex gap-2">
                            {/* PENAWARAN */}
                            <Section
                              title="Penawaran"
                              items={[
                                {
                                  label: "Total",
                                  value: nPenawaran,
                                  color: "primary",
                                },
                                {
                                  label: "Waiting",
                                  value: summary.nOfferingWaiting,
                                  color: "warning",
                                },
                                {
                                  label: "Deal",
                                  value: summary.nOfferingDeal,
                                  color: "success",
                                },
                                {
                                  label: "Reject",
                                  value: summary.nOfferingReject,
                                  color: "danger",
                                },
                              ]}
                            />
                            {/* MODAL */}
                            {isHighRole && (
                              <Section
                                title="Modal"
                                items={[
                                  {
                                    label: "Total",
                                    value: <Harga harga={summary.totalModal} />,
                                    color: "primary",
                                  },
                                  {
                                    label: "Waiting",
                                    value: (
                                      <Harga
                                        harga={summary.totalModalWaiting}
                                      />
                                    ),
                                    color: "warning",
                                  },
                                  {
                                    label: "Deal",
                                    value: (
                                      <Harga harga={summary.totalModalDeal} />
                                    ),
                                    color: "success",
                                  },
                                  {
                                    label: "Reject",
                                    value: (
                                      <Harga harga={summary.totalModalReject} />
                                    ),
                                    color: "danger",
                                  },
                                ]}
                              />
                            )}
                            {/* NILAI PENAWARAN */}
                            <Section
                              title="Nilai Penawaran"
                              items={[
                                {
                                  label: "Total",
                                  value: (
                                    <Harga harga={summary.totalPenawaran} />
                                  ),
                                  color: "primary",
                                },
                                {
                                  label: "Waiting",
                                  value: (
                                    <Harga
                                      harga={summary.totalPenawaranWaiting}
                                    />
                                  ),
                                  color: "warning",
                                },
                                {
                                  label: "Deal",
                                  value: (
                                    <Harga harga={summary.totalPenawaranDeal} />
                                  ),
                                  color: "success",
                                },
                                {
                                  label: "Reject",
                                  value: (
                                    <Harga
                                      harga={summary.totalPenawaranReject}
                                    />
                                  ),
                                  color: "danger",
                                },
                              ]}
                            />
                            {/* PROVIT */}
                            {isHighRole && (
                              <Section
                                title="Provit"
                                items={[
                                  {
                                    label: "Total",
                                    value: (
                                      <Harga harga={summary.totalProvit} />
                                    ),
                                    color: "primary",
                                  },
                                  {
                                    label: "Waiting",
                                    value: (
                                      <Harga
                                        harga={
                                          summary.totalPenawaranWaiting -
                                          summary.totalModalWaiting
                                        }
                                      />
                                    ),
                                    color: "warning",
                                  },
                                  {
                                    label: "Deal",
                                    value: (
                                      <Harga
                                        harga={
                                          summary.totalPenawaranDeal -
                                          summary.totalModalDeal
                                        }
                                      />
                                    ),
                                    color: "success",
                                  },
                                  {
                                    label: "Reject",
                                    value: (
                                      <Harga
                                        harga={
                                          summary.totalPenawaranReject -
                                          summary.totalModalReject
                                        }
                                      />
                                    ),
                                    color: "danger",
                                  },
                                ]}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Status Proyek */}
                    <div>
                      <StatusProyek user={user} />
                    </div>
                  </div>
                </ShowHideComponent2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="solid"
                    onClick={tambahButtonPress}
                  >
                    <span className="text-xl font-bold">
                      <AddIcon />
                    </span>
                    Tambah
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="solid"
                    onClick={handlePrintProyek}
                  >
                    Print
                  </Button>
                </div>
              </div>
            </div>
          }
          bottomContent={
            pages > 0 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  variant="solid"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            ) : null
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
          <TableBody
            items={proyek?.data || []}
            loadingContent={"Loading..."}
            emptyContent={"Kosong"}
            loadingState={proyek.isLoading}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell className={item.hide ? "bg-red-200" : ""}>
                    {renderCell(item, columnKey)}
                  </TableCell>
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
                {form.modalmode} Proyek
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Status"
                  color="default"
                  variant="bordered"
                  placeholder="Pilih status!"
                  disallowEmptySelection
                  selectedKeys={key2set(form.id_statusproyek)}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    updateForm(setForm, { id_statusproyek: set2key(val) });
                  }}
                >
                  {statusproyek.data.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                {form.id_statusproyek == 1 && (
                  <Select
                    label="Perusahaan"
                    color="default"
                    variant="bordered"
                    placeholder="Pilih perusahaan!"
                    selectedKeys={form.selectperusahaan}
                    className="max-w-xs"
                    onSelectionChange={(val) => {
                      setForm((prev) => ({
                        ...prev,
                        selectperusahaan: val,
                        id_perusahaan: set2key(val),
                      }));
                    }}
                  >
                    {perusahaan.data.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <Input
                  type="text"
                  color="default"
                  variant="bordered"
                  label="Nama Proyek"
                  placeholder="Masukkan nama proyek!"
                  value={form.nama}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, nama: val }))
                  }
                />
                <AutocompleteJenisProyek form={form} setForm={setForm} />
                <AutocompleteCustomer form={form} setForm={setForm} />
                <Select
                  label="S/N"
                  color="default"
                  variant="bordered"
                  isDisabled={isCustomerSelected}
                  placeholder="Pilih swasta/negri!"
                  selectedKeys={
                    new Set(
                      form.swasta || form.swasta == 0
                        ? [String(form.swasta)]
                        : [],
                    )
                  }
                  className="max-w-xs"
                  onSelectionChange={(v) => {
                    setForm((prev) => ({
                      ...prev,
                      swasta: set2key(v),
                    }));
                  }}
                >
                  {LIST_SWASTA_NEGRI.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="text"
                  color="default"
                  variant="bordered"
                  isDisabled={isCustomerSelected}
                  label="Kota"
                  placeholder="Masukkan kota!"
                  value={form.kota || ""}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, kota: v }))
                  }
                />
                <Textarea
                  type="text"
                  color="default"
                  variant="bordered"
                  label="Alamat"
                  isDisabled={isCustomerSelected}
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, alamat: v }))
                  }
                />
                <Input
                  color="default"
                  variant="bordered"
                  type="text"
                  label="Klien"
                  placeholder="Masukkan klien! Contoh : Bapak Adi"
                  value={form.klien}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, klien: val }))
                  }
                />
                {form.id_statusproyek == 1 && (
                  <Input
                    color="default"
                    variant="bordered"
                    type="text"
                    label="No PO"
                    placeholder="Masukkan no. PO!"
                    value={form.id_po}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, id_po: val }))
                    }
                  />
                )}
                <Select
                  isDisabled={isHighRole ? undefined : true}
                  label="Sales"
                  color="default"
                  variant="bordered"
                  placeholder="Pilih sales!"
                  selectedKeys={form.selectkaryawan}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm((prev) => ({
                      ...prev,
                      selectkaryawan: val,
                      id_karyawan: set2key(val),
                    }));
                  }}
                >
                  {karyawan.data.map(
                    (item) =>
                      item.id_statuskaryawan == 1 && (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          textValue={item.nama || "NN"}
                        >
                          {item.nama || "NN"}
                        </SelectItem>
                      ),
                  )}
                </Select>
                {form.id_statusproyek == 1 && (
                  <div className="bg-gray-100 p-3 rounded-lg w-fit z-40">
                    <div>Tanggal Penawaran</div>
                    <DatePicker
                      className="bg-white rounded px-1"
                      placeholderText="Pilih tanggal"
                      dateFormat="dd/MM/yyyy"
                      selected={form.startdate}
                      onChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          startdate: v,
                          tanggal_penawaran: getDate(v),
                        }))
                      }
                    />
                    <Button
                      onClick={() => {
                        const now = new Date();
                        setForm((prev) => ({
                          ...prev,
                          startdate: now,
                          tanggal_penawaran: getDate(now),
                        }));
                      }}
                      className="ml-2"
                      size="sm"
                      color="primary"
                      variant="solid"
                    >
                      Sekarang
                    </Button>
                  </div>
                )}
                <Textarea
                  color="default"
                  variant="bordered"
                  label="Keterangan"
                  labelPlacement="inside"
                  placeholder="Masukkan keterangan! (Opsional)"
                  value={form.keterangan}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, keterangan: val }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onClick={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => saveButtonPress(onClose)}
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
                <Button color="danger" variant="flat" onClick={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <PrintDaftarProyek
        ref={printProyekRef}
        data={proyek.data}
        loadingState={loadingState}
        idKaryawan={set2key(selectkaryawan)}
        idStatusProyek={selectStatusProyek}
        startDate={current.startDate}
        endDate={current.endDate}
      />
    </div>
  );
}
