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
} from "../../components/icon";
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
import Link from "next/link";

export default function app({ proyek, keranjangproyek }) {
  const [tempProyek, setTempProyek] = useState(proyek);
  const [tempKeranjangProyek, setTempKeranjangProyek] =
    useState(keranjangproyek);
  const [hargaJual, setHargaJual] = useState(0);
  const renderCell = {
    stok: React.useCallback((data, columnKey) => {
      const cellValue = data[columnKey];
      switch (columnKey) {
        case "totalharga-beli":
          return data.jumlah * data.harga;
        case "totalharga-jual":
          return data.jumlah * data.hargajual;
        case "profit":
          return data.jumlah * data.hargajual - data.jumlah * data.harga;
        case "aksi":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Edit">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete">
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    }, []),
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const col = {
    keranjangproyek: [
      {
        key: "nama",
        label: "Nama",
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
        key: "satuan",
        label: "Satuan",
      },
      {
        key: "jumlah",
        label: "Jumlah",
      },
      {
        key: "harga",
        label: "Harga Beli",
      },
      {
        key: "hargajual",
        label: "Harga Jual",
      },
      {
        key: "totalharga-beli",
        label: "Total Harga Beli",
      },
      {
        key: "totalharga-jual",
        label: "Total Harga Jual",
      },
      {
        key: "profit",
        label: "Profit",
      },
      {
        key: "aksi",
        label: "Aksi",
      },
    ],
  };

  return (
    <div>
      <div className="flex flex-row">
        <div className="bg-white rounded-lg p-3">
          <div>Nama: {tempProyek.nama} </div>
          <div>Klien: {tempProyek.klien} </div>
          <div>Status: {tempProyek.status} </div>
        </div>
      </div>
      <Table
        topContent={
          <>
            <div>Produk</div>
            <div>
              <Link href={`/stok?id_proyek=${proyek.id}`}>
                <Button color="primary">Tambah</Button>
              </Link>
            </div>
          </>
        }
        className="pt-3"
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={col.keranjangproyek}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={tempKeranjangProyek}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell.stok(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tambah Produk
              </ModalHeader>
              <ModalBody></ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
