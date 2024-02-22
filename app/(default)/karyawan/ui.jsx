"use client";
import React, { useState } from "react";
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
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  IconScaleBalanced,
} from "../../../components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { FileUploader } from "@/components/input";
import { Button } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import Link from "next/link";

const apiPath = getApiPath();

export default function App() {
  const karyawan = useClientFetch(`karyawan`);
  const [form, setForm] = useState({});
  const [json, setJson] = useState([]);
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({ id: "", nama: "", modalmode: "Tambah" });
    setMethod("POST");
    modal.karyawan.onOpen();
  };
  const editButtonPress = (data) => {
    setForm({ ...data, modalmode: "Edit" });
    setMethod("PUT");
    modal.karyawan.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus karyawan?")) {
      const res = await fetch(`${apiPath}karyawan`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      // return alert(json.message);
    }
  };
  const simpanButtonPress = async (data, onClose) => {
    const res = await fetch(`${apiPath}karyawan`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // return alert(json.message);
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
          fetch(`${apiPath}karyawan`, {
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
      setReportList(dataArray.map((v, i) => `${i + 1}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };

  const renderCell = {
    karyawan: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "totalharga-beli":
          return data.jumlah * data.harga;
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
              {/* <Tooltip content="Neraca">
                <span
                  // onClick={() => alert("Clicked")}
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                >
                  <Link href="karyawan/neraca">
                    <IconScaleBalanced />
                  </Link>
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
    }, []),
    invoice: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "total":
          return data.jumlah * data.harga;
        default:
          return cellValue;
      }
    }, []),
  };
  const col = {
    karyawan: [
      {
        key: "nama",
        label: "Nama",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    karyawan: useDisclosure(),
  };
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  if (karyawan.error) return <div>failed to load</div>;
  if (karyawan.isLoading) return <div>loading...</div>;

  return (
    <div>
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/karyawan.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button>
      </div>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.karyawan}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={karyawan.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.karyawan(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.karyawan.isOpen}
        onOpenChange={modal.karyawan.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.modalmode} Karyawan
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Nama"
                  placeholder="Masukkan nama!"
                  value={form.nama}
                  onValueChange={(val) => setForm({ ...form, nama: val })}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => simpanButtonPress(form, onClose)}
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
