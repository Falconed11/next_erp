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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import Link from "next/link";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { excelToJSDate, getDateF, getDateFId, getDate } from "@/app/utils/date";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";
import { FileUploader } from "@/components/input";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  EyeIcon,
  UserIcon,
} from "@/components/icon";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const api_path = getApiPath();

export default function UI() {
  const pengeluaran = useClientFetch(`pengeluaranproyek`);
  const [form, setForm] = useState({});
  const [json, setJson] = useState([]);

  const editButtonPress = (data) => {
    const startdate = new Date(data.tanggal);
    setForm({
      ...form,
      ...data,
      harga: data.hargakustom,
      modalmode: "Edit",
      tanggal: getDate(startdate),
      startdate,
    });
    modal.onOpen();
  };
  const deleteButtonPress = async (id) => {
    if (confirm("Hapus produk?")) {
      const res = await fetch(`${api_path}pengeluaranproyek`, {
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
    const res = await fetch(`${api_path}pengeluaranproyek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
        id: data.id_pengeluaranproyek,
        keterangan: data.keterangan ? data.keterangan : "",
        status: data.status ? data.status : "",
        tanggal: getDate(new Date(data.startdate)),
        // harga: data.hargajual,
      }),
    });
    const json = await res.json();
    onClose();
    // console.log(json.message);
    // return alert(json.message);
  };

  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
    console.log(jsonData);
  };
  const handleButtonUploadExcelPress = () => {
    json.map(async (v) => {
      const res = await fetch(`${api_path}pengeluaranproyek`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ ...v, id_second: v.id }),
      });
      const json = await res.json();
      console.log(json.message);
      // return alert(json.message);
    });
    setJson([]);
    return alert("Upload berhasil");
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    let harga = 0;
    if (data.hargakustom) harga = data.hargakustom;
    if (data.hargamodal && !data.hargakustom) harga = data.hargamodal;
    switch (columnKey) {
      case "tanggal":
        return getDateF(new Date(data.tanggal));
      case "harga":
        return <Harga harga={harga} />;
      case "totalharga":
        return <Harga harga={data.jumlah * harga} />;
      case "totalharga-jual":
        return <Harga harga={data.jumlah * data.hargajual} />;
      case "profit":
        return <Harga harga={data.hargajual - data.hargamodal} />;
      case "totalprofit":
        return (
          <Harga
            harga={data.jumlah * data.hargajual - data.jumlah * data.hargamodal}
          />
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
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
                onClick={() => deleteButtonPress(data.id_pengeluaranproyek)}
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

  const modal = useDisclosure();

  if (pengeluaran.error) return <div>failed to load</div>;
  if (pengeluaran.isLoading) return <div>loading...</div>;

  const col = [
    {
      key: "tanggal",
      label: "tanggal",
    },
    {
      key: "id_proyek",
      label: "Id Proyek",
    },
    {
      key: "namaproyek",
      label: "Nama Proyek",
    },
    {
      key: "instansi",
      label: "Instansi",
    },
    {
      key: "namakaryawan",
      label: "Karyawan",
    },
    {
      key: "nama",
      label: "Produk",
    },
    {
      key: "keteranganpp",
      label: "Keterangan",
    },
    {
      key: "merek",
      label: "Merek",
    },
    {
      key: "tipe",
      label: "Tipe",
    },
    {
      key: "vendor",
      label: "Vendor",
    },
    {
      key: "jumlah",
      label: "Jumlah",
    },
    {
      key: "harga",
      label: "Harga Satuan",
    },
    {
      key: "totalharga",
      label: "Tota Harga",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "aksi",
      label: "Aksi",
    },
  ];
  return (
    <div>
      <div className="flex flex-row gap-2">
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/pengeluaranproyek.xlsx"}
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
        <TableHeader columns={col}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={pengeluaran.data}>
          {(item) => (
            <TableRow key={item.id_pengeluaranproyek}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Pengeluaran Proyek
              </ModalHeader>
              <ModalBody>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div>Tanggal</div>
                  <DatePicker
                    placeholderText="Pilih tanggal"
                    dateFormat="dd/MM/yyyy"
                    selected={form.startdate}
                    onChange={(v) => setForm({ ...form, startdate: v })}
                  />
                </div>
                <div>Karyawan : {form.namakaryawan}</div>
                <div>Produk : {form.nama}</div>
                <Input
                  type="text"
                  value={form.keterangan}
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      keterangan: v,
                    })
                  }
                />
                <div>Merek : {form.merek}</div>
                <div>Tipe : {form.tipe}</div>
                <Input
                  type="number"
                  label="Jumlah"
                  placeholder="Masukkan jumlah!"
                  value={form.jumlah}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      jumlah: v,
                    })
                  }
                />
                <div>Harga Modal : {form.hargamodal}</div>
                <Input
                  type="number"
                  value={form.harga}
                  label="Harga Kustom"
                  placeholder="Masukkan harga!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      harga: v,
                    })
                  }
                />
                {/* <div>
                  Total Harga :{" "}
                  {form.jumlah *
                    (form.hargakustom ? form.hargakustom : form.hargamodal)}
                </div> */}
                <Input
                  type="text"
                  value={form.status}
                  label="Status"
                  placeholder="Masukkan status!"
                  className=""
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      status: v,
                    })
                  }
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
    </div>
  );
}
