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
} from "@heroui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
  IconScaleBalanced,
} from "@/components/icon";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { FileUploader } from "@/components/input";
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import Link from "next/link";

const apiPath = getApiPath();

export default function App() {
  const statuskaryawan = useClientFetch(`statuskaryawan`);
  const [form, setForm] = useState({});
  const [json, setJson] = useState([]);
  const [method, setMethod] = useState();
  const tambahButtonPress = () => {
    setForm({});
    setMethod("POST");
    modal.statuskaryawan.onOpen();
  };
  const editButtonPress = (data) => {
    setForm({ ...data, modalmode: "Edit" });
    setMethod("PUT");
    modal.statuskaryawan.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus statuskaryawan?")) {
      const res = await fetch(`${apiPath}statuskaryawan`, {
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
    const res = await fetch(`${apiPath}statuskaryawan`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    statuskaryawan.mutate();
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
          fetch(`${apiPath}statuskaryawan`, {
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
    statuskaryawan: React.useCallback((data, columnKey) => {
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
                  <Link href="statuskaryawan/neraca">
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
    statuskaryawan: [
      {
        key: "status",
        label: "Status",
      },
      {
        key: "keterangan",
        label: "Keterangan",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };
  const modal = {
    statuskaryawan: useDisclosure(),
  };
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();

  if (statuskaryawan.error) return <div>failed to load</div>;
  if (statuskaryawan.isLoading) return <div>loading...</div>;

  return (
    <div>
      <div className="flex flex-row gap-2">
        <Button color="primary" onPress={tambahButtonPress}>
          Tambah
        </Button>
        {/* <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/statuskaryawan.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button color="primary" onPress={handleButtonUploadExcelPress}>
          Upload Excel
        </Button> */}
      </div>
      <Table className="pt-3" aria-label="Example table with custom cells">
        <TableHeader columns={col.statuskaryawan}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="Kosong" items={statuskaryawan.data}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell.statuskaryawan(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.statuskaryawan.isOpen}
        onOpenChange={modal.statuskaryawan.onOpenChange}
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
                  label="Status"
                  placeholder="Masukkan status!"
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val })}
                />
                <Input
                  type="text"
                  label="keterangan"
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
