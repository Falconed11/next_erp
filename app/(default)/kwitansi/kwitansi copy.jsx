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
} from "@/components/icon";
import { useClientFetch, getApiPath } from "@/app/utils/apiconfig";
import date, { getDateF, getDate, getCurFirstLastDay } from "@/app/utils/date";
import number from "@/app/utils/number";
import Harga from "@/components/harga";
import { RangeDate } from "@/components/input";
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
    // pageStyle: "p-10",
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
  const [selected, setSelected] = React.useState("normal");
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
            <Tooltip content="Print">
              <span
                onClick={() => printButtonPress(data)}
                // onClick={() => detailButtonPress(data)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <PrinterIcon />
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
  const a = "f";
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Button color="primary" onClick={tambahButtonPress}>
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
                  <Radio value="normal">Normal</Radio>
                  <Radio value="bks">BKS</Radio>
                  <Radio value="svt">SVT</Radio>
                </RadioGroup>
                <div
                  ref={componentRef.kwitansi}
                  className="bg-white text-black leading-8"
                >
                  {Logo}
                  <div className="flex flex-row items-center">
                    {selected == "bks" ? (
                      <>
                        {/* <Image
                          src={logoBks}
                          alt="Company Logo"
                          width={70}
                          // height={500} automatically provided
                          // blurDataURL="data:..." automatically provided
                          // placeholder="blur" // Optional blur-up while loading
                        /> */}
                        <div className="flex flex-col pl-2">
                          <div>Belga Karya Semesta</div>
                          <div>
                            General Trading - Mechanical Electrical - Supplies -
                            Consultant
                          </div>
                          <div>
                            Jogokaryan MJ 3/789, Mantrijeron - Yogyakarta Telp
                            08121553765
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                    {selected == "svt" ? (
                      <>
                        {/* <Image
                          src={logoSvt}
                          alt="Company Logo"
                          width={100}
                          // height={500} automatically provided
                          // blurDataURL="data:..." automatically provided
                          // placeholder="blur" // Optional blur-up while loading
                        /> */}
                        <div className="flex flex-col pl-2">
                          <div>Satu Visi Teknikatama</div>
                          <div>
                            General Trading - Mechanical Electrical - Supplies -
                            Consultant
                          </div>
                          <div>
                            Wonosalam RT. 005 / RW. 009, Sukoharjo, Ngaglik
                            Sleman - Yogyakarta 55581 Telp 08121553765 -
                            081578861740
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  {selected == "normal" ? (
                    <>
                      <div className="h-12"></div>
                      <div className="flex">
                        <div className="w-36"></div>
                        <div>
                          <span className="invisible">a</span>
                          {form.id_kustom}
                        </div>
                      </div>
                      <div className="h-1"></div>
                      <div className="flex">
                        <div className="w-72"></div>
                        <div>{form.nama_pembayar}</div>
                      </div>
                      <div className="h-1"></div>
                      <div className="flex">
                        <div className="w-64"></div>
                        <div>
                          Rp <Harga harga={form.nominal} />
                          ,00
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-28 h-20"></div>
                        <div className="w-101 leading-7">
                          <span className="invisible">aaaaaaaaaaaaaaaaaa</span>
                          {form.keterangan}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-90"></div>
                        <div className="w-28">Yogyakarta</div>
                        <div className="w-32">
                          {date.getDateFId(new Date(form.tanggal), "dd-month")}
                        </div>
                        <div>
                          {date.getDateFId(new Date(form.tanggal), "yy")}
                        </div>
                      </div>
                      <div className="h-8"></div>
                      <div className="flex">
                        <div className="w-64"></div>
                        <div className="w-80 text-sm leading-4">
                          {number.nominalToText(form.nominal)} Rupiah
                        </div>
                      </div>
                    </>
                  ) : selected == "bks" ? (
                    <>
                      <div className="h-32"></div>
                      <div className="h-3"></div>
                      <div className="flex">
                        <div className="w-36"></div>
                        <div className="w-416p">
                          <div>{form.nama_pembayar}</div>
                          <div className="text-xs h-6 content-center">
                            {`${number.nominalToText(form.nominal)} Rupiah`}
                          </div>
                          <div className="h-1"></div>
                          <div className="text-sm leading-8 h-16">
                            {form.keterangan}
                          </div>
                        </div>
                      </div>
                      <div className="h-2"></div>
                      <div className="flex">
                        <div className="w-548p"></div>
                        <div className="w-28 text-xs self-center">
                          {date.getDateFId(new Date(form.tanggal), "dd-month")}
                        </div>
                        <div>
                          {date.getDateFId(new Date(form.tanggal), "yy")}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-24"></div>
                        <div className="w-96 text-sm leading-4">
                          <div className="h-4"></div>
                          <Harga harga={form.nominal} />
                        </div>
                        <div className="w-4"></div>
                        <div>
                          <div className="h-8"></div>
                          <div className=" w-40 text-center">
                            {form.nama_karyawan}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-32"></div>
                      <div className="h-3"></div>
                      <div className="flex">
                        <div className="w-36"></div>
                        <div className="w-416p">
                          <div>{form.nama_pembayar}</div>
                          <div className="text-xs h-6 content-center">
                            {`${number.nominalToText(form.nominal)} Rupiah`}
                          </div>
                          <div className="text-sm leading-8 h-16">
                            {form.keterangan}
                          </div>
                        </div>
                      </div>
                      <div className="h-3"></div>
                      <div className="flex">
                        <div className="w-548p"></div>
                        <div className="w-2"></div>
                        <div className="w-24 text-xs leading-8">
                          {date.getDateFId(new Date(form.tanggal), "dd-month")}
                        </div>
                        <div>
                          {date.getDateFId(new Date(form.tanggal), "yy")}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-24"></div>
                        <div className="w-96 text-sm leading-4">
                          <div className="h-2"></div>
                          <Harga harga={form.nominal} />
                        </div>
                        <div className="w-4"></div>
                        <div>
                          <div className="h-8"></div>
                          <div className="w-44 text-center">
                            {form.nama_karyawan}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
