"use client";
import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
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
  Textarea,
  Divider,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { RadioGroup, Radio } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  PrinterIcon,
  NoteIcon,
} from "@/components/icon";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
import date, {
  getDateF,
  getDate,
  getCurFirstLastDay,
  getDateFId,
} from "@/app/utils/date";
import number from "@/app/utils/number";
import Harga from "@/components/harga";
import { RangeDate } from "@/components/input";
import { SVTHeader, BKSHeader } from "@/components/mycomponent";
import Image from "next/image";
import logoBks from "@/public/logo-bks.jpeg";
import logoSvt from "@/public/logo-svt.jpeg";

const apiPath = getApiPath();
const [startDate, endDate] = getCurFirstLastDay();

export default function App() {
  const componentRef = {
    kwitansi: useRef(),
  };
  const handlePrintKwitansi = useReactToPrint({
    content: () => componentRef.kwitansi.current,
    pageStyle: "p-10",
  });

  const [current, setCurrent] = useState({
    startDate,
    endDate,
  });

  const kwitansi = useClientFetch(
    `kwitansi?start=${getDate(current.startDate)}&end=${getDate(
      current.endDate
    )}`
  );
  const karyawan = useClientFetch("karyawan");
  const [selected, setSelected] = React.useState("bks");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const modal = {
    kwitansi: useDisclosure(),
  };
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("");

  const [page, setPage] = React.useState(1);
  const rowsPerPage = 25;

  const saveButtonPress = async (onClose) => {
    if (form.keterangan.length > 150)
      return alert("Keterangan guna membayar maksimal 150 huruf!");
    if (form.nominal.length > 15)
      return alert("Nominal uang sebanyak maksimal 15 digit!");
    const res = await fetch(`${apiPath}kwitansi`, {
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
  const printButtonPress = (data) => {
    setForm(data);
    modal.kwitansi.onOpen();
  };
  const tambahButtonPress = () => {
    setForm({
      modalmode: "Tambah",
      id: "",
      id_kustom: "",
      nama_pembayar: "",
      nominal: "",
      keterangan: "",
      startdate: "",
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
    });
    setMethod("PUT");
    onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus kwitansi?")) {
      const res = await fetch(`${apiPath}kwitansi`, {
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
      case "nominal":
        return <Harga harga={data.nominal} />;
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Kwitansi">
              <span
                onClick={() => printButtonPress(data)}
                // onClick={() => detailButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <NoteIcon />
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

  const filteredData = kwitansi?.data;
  const pages = useMemo(() => {
    return filteredData ? Math.ceil(filteredData?.length / rowsPerPage) : 0;
  }, [filteredData, rowsPerPage]);
  const loadingState = kwitansi.isLoading ? "loading" : "idle";
  const offset = (page - 1) * rowsPerPage;

  if (kwitansi.error) return <div>failed to load</div>;
  if (kwitansi.isLoading) return <div>loading...</div>;
  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;
  const col = [
    {
      key: "id_kustom",
      label: "Id",
    },
    {
      key: "tanggal",
      label: "Tanggal",
    },
    {
      key: "nama_pembayar",
      label: "Pembayar",
    },
    {
      key: "nominal",
      label: "Nominal",
    },
    {
      key: "nama_karyawan",
      label: "Karyawan",
    },
    {
      key: "keterangan",
      label: "keterangan",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const content = [
    { col: "Diterima dari", val: form.nama_pembayar },
    { col: "Nominal sebesar", val: number.nominalToText(form.nominal) },
    { col: "Guna membayar", val: form.keterangan },
  ];

  const a = "f";
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
      </div>
      <Table
        className=""
        aria-label="Example table with custom cells"
        topContent={
          <>
            <div>Filter</div>
            <div className="flex">
              <RangeDate current={current} setCurrent={setCurrent} />
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
      {/*tambah/edit */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Kwitansi
              </ModalHeader>
              <ModalBody>
                <div className="bg-gray-100 p-3 rounded-lg z-50">
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
                <Input
                  type="text"
                  label="Telah terima dari"
                  placeholder="Masukkan nama pembayar!"
                  value={form.nama_pembayar}
                  onValueChange={(val) =>
                    setForm({ ...form, nama_pembayar: val })
                  }
                />
                <Input
                  type="text"
                  label={`Uang sebanyak`}
                  placeholder="Masukkan Nominal!"
                  value={form.nominal}
                  onValueChange={(val) =>
                    setForm({
                      ...form,
                      nominal: val,
                    })
                  }
                />
                <Select
                  label="Karyawan"
                  variant="bordered"
                  placeholder="Pilih karyawan!"
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
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </Select>
                <Textarea
                  label={`Guna membayar (${form.keterangan.length})`}
                  placeholder="Masukkan Keterangan!"
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
      {/* kwitansi */}
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={modal.kwitansi.isOpen}
        onOpenChange={modal.kwitansi.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Kwitansi
              </ModalHeader>
              <ModalBody>
                <RadioGroup
                  label="Pilih Kwitansi"
                  orientation="horizontal"
                  value={selected}
                  onValueChange={setSelected}
                >
                  {/* <Radio value="normal">Normal</Radio> */}
                  <Radio value="bks">BKS</Radio>
                  <Radio value="svt">SVT</Radio>
                </RadioGroup>
                <div
                  ref={componentRef.kwitansi}
                  className="bg-white text-black flex flex-col gap-2 leading-none"
                >
                  <div className="flex">
                    <div className="basis-2/3">
                      {selected == "svt" ? <SVTHeader /> : <BKSHeader />}
                    </div>
                    <div className="text-center basis-1/3">
                      <div className="">KWITANSI</div>
                      <div className="flex gap-2">
                        <div className="basis-1/3">No.</div>
                        <div className="basis-2/4 border border-black">
                          {form.id_custom}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Divider className="bg-black" />
                  {/* <div>{form.id_kustom}</div> */}
                  <ul className="">
                    {content.map((v, i) => (
                      <li key={i} className="flex">
                        <div className="basis-1/4">{v.col}</div>
                        <div>: {v.val}</div>
                      </li>
                    ))}
                  </ul>
                  <Divider className="bg-black" />
                  <div>{form.id_kustom}</div>
                  <div className="flex">
                    <div className="basis-1/2">
                      Terbilang :{" "}
                      <span className="border border-black p-1">
                        Rp <Harga harga={form.nominal} />
                        ,00
                      </span>
                    </div>
                    <div className="text-right basis-1/2">
                      <div>
                        Yogyakarta, {getDateFId(new Date(form.tanggal))}
                      </div>
                      <div>{form.nama_karyawan}</div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button onPress={handlePrintKwitansi} color="primary">
                  Cetak
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// const BKSHeader = () => {
//   return (
//     <div className="flex flex-col">
//       <div>Belga Karya Semesta</div>
//       <div>General Trading - Mechanical Electrical - Supplies - Consultant</div>
//       <div>Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp 08121553765</div>
//     </div>
//   );
// };

// const SVTHeader = () => {
//   return (
//     <div className="flex flex-col">
//       <div>Satu Visi Teknikatama</div>
//       <div>General Trading - Mechanical Electrical - Supplies - Consultant</div>
//       <div>
//         Wonosalam RT. 005 / RW. 009, Sukoharjo, Ngaglik Sleman - Yogyakarta
//         55581 Telp 08121553765 - 081578861740
//       </div>
//     </div>
//   );
// };
