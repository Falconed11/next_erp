"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import { RadioGroup, Radio } from "@heroui/react";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
const apiPath = getApiPath();
import { fIdProyek } from "@/app/utils/formatid";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@heroui/drawer";
import { Accordion, AccordionItem } from "@heroui/react";
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
  DangerTriangleBrokenIcon,
  BusinessProgressBarIcon,
} from "@/components/icon";
import {
  getCurFirstLastDay,
  excelToJSDate,
  getDate,
  getDateF,
} from "@/app/utils/date";
import { highRoleCheck, rolesCheck } from "@/app/utils/tools";
import { FileUploader } from "@/components/input";
import { RangeDate } from "@/components/input";
import { LinkOpenNewTab } from "@/components/mycomponent";
import Harga from "@/components/harga";
import { ShowHideComponent } from "@/components/componentmanipulation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SelectStatusProyek from "@/components/selectstatusproyek";
import { LIST_SWASTA_NEGRI } from "@/app/utils/const";

export default function App({ id_instansi, id_karyawan, startDate, endDate }) {
  const [sort, setSort] = React.useState("tanggal_penawaran");
  const session = useSession();
  const sessUser = session.data?.user;

  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [current, setCurrent] = useState({
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  });
  const [selectkaryawan, setSelectKaryawan] = useState(
    new Set([id_karyawan ? id_karyawan : ""])
    // new Set([])
  );
  const [stat, setStat] = useState(1);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState([]);
  const [selectStatusProyek, setSelectStatusProyek] = useState();
  const proyek = useClientFetch(
    `proyek?${id_instansi ? `id_instansi=${id_instansi}` : ""}${
      selectkaryawan.size > 0
        ? `id_karyawan=${selectkaryawan.values().next().value}`
        : ""
    }${current.startDate ? `&start=${getDate(current.startDate)}` : ""}${
      current.endDate ? `&end=${getDate(current.endDate)}` : ""
    }${
      selectStatusProyek ? `&id_statusproyek=${selectStatusProyek}` : ""
    }&sort=${sort}`
  );
  const penawaran = useClientFetch(
    `exportpenawaran?start=${getDate(current.startDate)}&end=${getDate(
      current.endDate
    )}`
  );
  const perusahaan = useClientFetch("perusahaan");
  const karyawan = useClientFetch("karyawan");
  const statusproyek = useClientFetch("statusproyek?ids=1&ids=3");
  const customer = useClientFetch(
    `customer?${id_instansi ? `id=${id_instansi}` : ""}`
  );
  const kategoriproyek = useClientFetch("kategoriproyek");
  const queries = [
    proyek,
    penawaran,
    perusahaan,
    karyawan,
    statusproyek,
    customer,
    kategoriproyek,
  ];
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("POST");
  const [json, setJson] = useState([]);
  // filteredData = proyek?.data;
  // filteredData.forEach((data) => [(data.peran = sessUser?.peran)]);
  useEffect(() => {
    const updated = proyek?.data?.map((d) => ({
      ...d,
      peran: sessUser?.peran,
    }));
    setFilteredData(updated);
  }, [proyek?.data, sessUser?.peran]);
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData?.length, rowsPerPage]);
  const loadingState = proyek.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;
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
    proyek.mutate();
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
      id_statusproyek: 1,
      last_user: sessUser?.nama,
    });
    setMethod("POST");
    onOpen();
  };
  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal_penawaran);
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
      const json = await res.json();
      if (res.status == 400) return alert(json.message);
      proyek.mutate();
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
    const versi = data.versi;
    const peran = data.peran;
    switch (columnKey) {
      case "no":
        return `${penawaran(data.id_kustom, date, data.id_karyawan)}`;
      case "swasta":
        return data.swasta ? "swasta" : "negri";
      case "status":
        return data.versi == -1 ? (
          <span className="p-2 rounded-sm bg-red-600 text-white font-bold">
            Reject
          </span>
        ) : data.versi > 0 ? (
          <span className="p-2 rounded-sm bg-green-500 text-white font-bold">
            Deal
          </span>
        ) : data.jumlahbarangkeluar > 0 ? (
          <Tooltip
            color="warning"
            content="Proyek Berjalan. Belum ada penawaran."
          >
            <div
              // onClick={() => editButtonPress(data)}
              className="text-4xl text-warning cursor-help active:opacity-50 text-center"
            >
              <DangerTriangleBrokenIcon />
            </div>
          </Tooltip>
        ) : (
          data.statusproyek
        );
      case "pengeluaranproyek":
        return (
          <div className="text-right">
            <Harga harga={data.pengeluaranproyek} />
          </div>
        );
      case "totalpenawaran":
        return (
          <div className="text-right">
            <Harga harga={+cellValue} />
          </div>
        );
      case "tanggal":
        return data.tanggal ? getDateF(new Date(data.tanggal)) : "";
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
            <LinkOpenNewTab
              content="Aktivitas Sales"
              link={`/proyek/aktivitassales?id=${data.id}&versi=${
                data.versi <= 0 ? "1" : data.versi
              }`}
              icon={<BusinessProgressBarIcon />}
            />
            <LinkOpenNewTab
              content="Detail"
              link={`/proyek/detail?id=${data.id}&versi=${
                data.versi <= 0 ? "1" : data.versi
              }`}
              icon={<NoteIcon />}
            />
            {rolesCheck(["super", "admin", "sales"], peran) ? (
              <Tooltip content="Pengeluaran & Pembayaran">
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
            {["super", "admin"].includes(peran) ? (
              <Tooltip color="danger" content="Delete">
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
  }, []);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();
  for (const [name, data] of Object.entries(queries)) {
    if (data.error) return <div>Failed to load {name}</div>;
    if (data.isLoading) return <div>Loading {name}...</div>;
  }
  if (session.status === "loading") return <>Session Loading ...</>;
  const isHighRole = highRoleCheck(sessUser.rank);
  const columns = [
    {
      key: "aksi",
      label: "Aksi",
    },
    // {
    //   key: "id",
    //   label: "Id",
    // },
    {
      key: "id_kustom",
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
    // {
    //   key: "kategoriproyek",
    //   label: "Kategori Proyek",
    // },
    {
      key: "nama",
      label: "Nama Proyek",
    },
  ];
  if (!id_instansi)
    columns.push({
      key: "instansi",
      label: "Customer",
    });
  columns.push(
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
      key: "status",
      label: "Status",
    },
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
      key: "tanggal_penawaran",
      label: "Tanggal Penawaran",
    },
    {
      key: "tanggal",
      label: "Tanggal Proyek",
    },
    {
      key: "keterangan",
      label: "Keterangan",
    }
  );
  const isSwasta = [
    { id: 0, nama: "negri" },
    { id: 1, nama: "swasta" },
  ];
  const nPenawaran = proyek.data.length;
  const summary = proyek.data.reduce(
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
    }
  );
  summary.totalModal =
    summary.totalModalDeal +
    summary.totalModalReject +
    summary.totalModalWaiting;
  summary.totalPenawaran =
    summary.totalPenawaranDeal +
    summary.totalPenawaranReject +
    summary.totalPenawaranWaiting;
  summary.totalProvit = summary.totalPenawaran - summary.totalModal;
  const isCustomerSelected =
    form.id_instansi || !form.instansi ? true : undefined;
  // console.log(form);
  return (
    <div className="flex flex-col gap-2 w-7/8- h-3/4 overscroll-auto">
      {id_instansi ? (
        <div className="flex">
          <div className="bg-white rounded-lg p-3">
            Customer: {customer.data[0].nama}
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
      </div>
      <Table
        isStriped
        className=""
        aria-label="Example table with custom cells"
        // selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        topContent={
          <div className="flex gap-2">
            {/* Filter & Report */}
            <ShowHideComponent
              stat={stat}
              setStat={setStat}
              openContent={"Buka Filter"}
            >
              <div className="flex gap-2">
                {/* Filter */}
                <div className="flex flex-col gap-2">
                  <div>Filter</div>
                  <RadioGroup
                    orientation="horizontal"
                    value={sort}
                    onValueChange={setSort}
                  >
                    <Radio value="tanggal_penawaran">Penawaran</Radio>
                    <Radio value="tanggal">Proyek</Radio>
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
                  />
                </div>
                {/* Ringkasan */}
                <div>
                  <div>Ringkasan</div>
                  <div className="flex gap-2">
                    <div className="text-center text-sm">
                      <div className="gap-2 flex flex-col">
                        <div>Penawaran</div>
                        <div className="px-2 py-1 text-white rounded-large bg-primary">
                          <div>Total</div>
                          <div>{nPenawaran}</div>
                        </div>
                        <div className="px-2 py-1 rounded-large bg-warning">
                          <div>Waiting</div>
                          <div>{summary.nOfferingWaiting}</div>
                        </div>
                        <div className="px-2 py-1 rounded-large bg-success">
                          <div>Deal</div>
                          <div>{summary.nOfferingDeal}</div>
                        </div>
                        <div className="px-2 py-1 text-white rounded-large bg-danger">
                          <div>Reject</div>
                          <div>{summary.nOfferingReject}</div>
                        </div>
                      </div>
                    </div>
                    {isHighRole && (
                      <div className="text-center text-sm">
                        <div className="gap-2 flex flex-col">
                          <div>Modal</div>
                          <div className="px-2 py-1 text-white rounded-large bg-primary">
                            <div>Total</div>
                            <div>
                              <Harga harga={summary.totalModal} />
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-large bg-warning">
                            <div>Waiting</div>
                            <div>
                              <Harga harga={summary.totalModalWaiting} />
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-large bg-success">
                            <div>Deal</div>
                            <div>
                              <Harga harga={summary.totalModalDeal} />
                            </div>
                          </div>
                          <div className="px-2 py-1 text-white rounded-large bg-danger">
                            <div>Reject</div>
                            <div>
                              <Harga harga={summary.totalModalReject} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="text-center text-sm">
                      <div className="gap-2 flex flex-col">
                        <div>Nilai Penawaran</div>
                        <div className="px-2 py-1 text-white rounded-large bg-primary">
                          <div>Total</div>
                          <div>
                            <Harga
                              harga={
                                +summary.totalPenawaranDeal +
                                summary.totalPenawaranReject +
                                summary.totalPenawaranWaiting
                              }
                            />
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded-large bg-warning">
                          <div>Waiting</div>
                          <div>
                            <Harga harga={+summary.totalPenawaranWaiting} />
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded-large bg-success">
                          <div>Deal</div>
                          <div>
                            <Harga harga={+summary.totalPenawaranDeal} />
                          </div>
                        </div>
                        <div className="px-2 py-1 text-white rounded-large bg-danger">
                          <div>Reject</div>
                          <div>
                            <Harga harga={+summary.totalPenawaranReject} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {isHighRole && (
                      <div className="text-center text-sm">
                        <div className="gap-2 flex flex-col">
                          <div>Provit</div>
                          <div className="px-2 py-1 text-white rounded-large bg-primary">
                            <div>Total</div>
                            <div>
                              <Harga harga={summary.totalProvit} />
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-large bg-warning">
                            <div>Waiting</div>
                            <div>
                              <Harga
                                harga={
                                  summary.totalPenawaranWaiting -
                                  summary.totalModalWaiting
                                }
                              />
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-large bg-success">
                            <div>Deal</div>
                            <div>
                              <Harga
                                harga={
                                  summary.totalPenawaranDeal -
                                  summary.totalModalDeal
                                }
                              />
                            </div>
                          </div>
                          <div className="px-2 py-1 text-white rounded-large bg-danger">
                            <div>Reject</div>
                            <div>
                              <Harga
                                harga={
                                  summary.totalPenawaranReject -
                                  summary.totalModalReject
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ShowHideComponent>
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
                {form.modalmode} Proyek
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Status"
                  variant="bordered"
                  placeholder="Pilih status!"
                  disallowEmptySelection
                  selectedKeys={
                    new Set(
                      form.id_statusproyek ? [String(form.id_statusproyek)] : []
                    )
                  }
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      id_statusproyek: new Set(val).values().next().value,
                    });
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
                )}
                <Input
                  type="text"
                  variant="bordered"
                  label="Nama Proyek"
                  placeholder="Masukkan nama proyek!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
                <Autocomplete
                  label="Customer"
                  variant="bordered"
                  allowsCustomValue
                  defaultItems={customer.data}
                  placeholder="Cari customer"
                  className="max-w-xs"
                  selectedKey={form.id_instansi}
                  defaultSelectedKey={form.id_instansi}
                  defaultInputValue={form.instansi || ""}
                  onInputChange={(v) => {
                    const nextForm = { ...form, instansi: v };
                    if (!form.id_instansi) {
                      nextForm.swasta = "";
                      nextForm.kota = "";
                      nextForm.alamat = "";
                    }
                    setForm(nextForm);
                  }}
                  onSelectionChange={(v) => {
                    const selectedInstansi = customer.data.find(
                      (o) => o.id == v
                    );
                    setForm({
                      ...form,
                      id_instansi: v,
                      swasta: selectedInstansi?.swasta,
                      kota: selectedInstansi?.kota,
                      alamat: selectedInstansi?.alamat,
                    });
                  }}
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.nama}>
                      {item.nama} | {item.swasta ? "Swasta" : "Negri"} |{" "}
                      {item.kota}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
                <Select
                  label="S/N"
                  variant="bordered"
                  isDisabled={isCustomerSelected}
                  placeholder="Pilih swasta/negri!"
                  selectedKeys={
                    new Set(
                      form.swasta || form.swasta == 0
                        ? [String(form.swasta)]
                        : []
                    )
                  }
                  className="max-w-xs"
                  onSelectionChange={(v) => {
                    setForm({
                      ...form,
                      swasta: new Set(v).values().next().value,
                    });
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
                  variant="bordered"
                  isDisabled={isCustomerSelected}
                  label="Kota"
                  placeholder="Masukkan kota!"
                  value={form.kota || ""}
                  onValueChange={(v) => setForm({ ...form, kota: v })}
                />
                <Textarea
                  type="text"
                  variant="bordered"
                  label="Alamat"
                  isDisabled={isCustomerSelected}
                  placeholder="Masukkan alamat!"
                  value={form.alamat}
                  onValueChange={(v) => setForm({ ...form, alamat: v })}
                />
                <Input
                  type="text"
                  label="Klien"
                  placeholder="Masukkan klien! Contoh : Bapak Adi"
                  value={form.klien}
                  onValueChange={(val) => setForm({ ...form, klien: val })}
                />
                {form.id_statusproyek == 1 && (
                  <Input
                    type="text"
                    label="No PO"
                    placeholder="Masukkan no. PO!"
                    value={form.id_po}
                    onValueChange={(val) => setForm({ ...form, id_po: val })}
                  />
                )}
                <Select
                  label="Sales"
                  variant="bordered"
                  placeholder="Pilih sales!"
                  selectedKeys={form.selectkaryawan}
                  className="max-w-xs"
                  onSelectionChange={(val) => {
                    setForm({
                      ...form,
                      selectkaryawan: val,
                      id_karyawan: new Set(val).values().next().value,
                    });
                  }}
                >
                  {karyawan.data.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      textValue={item.nama || "NN"}
                    >
                      {item.nama || "NN"}
                    </SelectItem>
                  ))}
                </Select>
                {form.id_statusproyek == 1 && (
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div>Tanggal Penawaran</div>
                    <DatePicker
                      placeholderText="Pilih tanggal"
                      dateFormat="dd/MM/yyyy"
                      selected={form.startdate}
                      onChange={(v) =>
                        setForm({ ...form, startdate: v, tanggal: getDate(v) })
                      }
                    />
                  </div>
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
