"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
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
  useDisclosure,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";
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
import date, { getDateF, getDate } from "@/app/utils/date";
import number from "@/app/utils/number";
import Harga from "@/components/harga";

const apiPath = getApiPath();

export default function App() {
  const componentRef = {
    kwitansi: useRef(),
  };
  const handlePrintKwitansi = useReactToPrint({
    content: () => componentRef.kwitansi.current,
    // pageStyle: "p-10",
  });

  const kwitansi = useClientFetch("kwitansi");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const modal = {
    kwitansi: useDisclosure(),
  };
  const [form, setForm] = useState({});
  const [method, setMethod] = useState("");
  const saveButtonPress = async (onClose) => {
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
  if (kwitansi.error) return <div>failed to load</div>;
  if (kwitansi.isLoading) return <div>loading...</div>;
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
      key: "keterangan",
      label: "keterangan",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  const a = "7";
  return (
    <>
      <Table
        className="pt-3"
        aria-label="Example table with custom cells"
        topContent={
          <div>
            <Button color="primary" onClick={tambahButtonPress}>
              Tambah
            </Button>
          </div>
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
        <TableBody items={kwitansi.data}>
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
                  label="Uang sebanyak"
                  placeholder="Masukkan Nominal!"
                  value={form.nominal}
                  onValueChange={(val) => setForm({ ...form, nominal: val })}
                />
                <Input
                  type="text"
                  label="Guna membayar"
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
      {/* nota */}
      <Modal
        scrollBehavior="inside"
        size="4xl"
        isOpen={modal.kwitansi.isOpen}
        onOpenChange={modal.kwitansi.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Nota</ModalHeader>
              <ModalBody>
                <div
                  ref={componentRef.kwitansi}
                  className="bg-white text-black leading-7"
                >
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
                      <Harga harga={form.nominal} />
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-28 h-20"></div>
                    <div className="w-101 text-sm leading-7">
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
                    <div>{date.getDateFId(new Date(form.tanggal), "yy")}</div>
                  </div>
                  <div className="h-8"></div>
                  <div className="flex">
                    <div className="w-64"></div>
                    <div className="w-80 text-sm leading-4">
                      {number.nominalToText(form.nominal)}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
                <Button onClick={handlePrintKwitansi} color="primary">
                  Cetak
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}