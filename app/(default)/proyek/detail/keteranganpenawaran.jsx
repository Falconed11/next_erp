import React, { useState } from "react";
import { Button, Checkbox, Input, Tooltip } from "@heroui/react";
import { EditIcon, DeleteIcon } from "@/components/icon";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { API_PATH } from "@/app/utils/apiconfig";

export default function KeteranganPenawaran({
  keteranganPenawaran,
  idProyek,
  isAuthorized,
}) {
  const [form, setForm] = useState();
  const data = keteranganPenawaran.data;

  const simpanButtonPress = async (data, onClose) => {
    // if (data.jumlah <= 0) return alert("Jumlah belum diisi");
    if (!data.keterangan) return alert("Keterangan belum diisi.");
    const res = await fetch(`${API_PATH}keteranganpenawaran`, {
      method: data.mode == "Tambah" ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...data,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    onClose();
    // console.log(json.message);
    //return alert(json.message);
  };

  const renderCell = React.useCallback((data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "status":
        const isChecked = !!data.id_proyek;
        return (
          <Checkbox
            isDisabled={!isAuthorized}
            isSelected={isChecked}
            onValueChange={async (v) => {
              if (v === isChecked) return;
              const res = await fetch(`${API_PATH}proyek_keteranganpenawaran`, {
                method: v ? "POST" : "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                  idProyek,
                  idKeteranganPenawaran: data.id,
                }),
              });
              const json = await res.json();
              // if (res.status == 400) console.log(json.message);
              // if (res.status == 400) return alert(json.message);
              // console.log(json.message);
              //return alert(json.message);
              keteranganPenawaran.mutate();
            }}
          ></Checkbox>
        );
      case "aksi":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit">
              <span
                onClick={() => {
                  setForm({
                    ...form,
                    mode: "Edit",
                    id: data.id,
                    keterangan: data.keterangan,
                  });
                  onOpen();
                }}
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete">
              <span
                onClick={async () => {
                  if (confirm("Hapus keterangan?")) {
                    console.log(data.id);
                    const res = await fetch(`${API_PATH}keteranganpenawaran`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                      },
                      body: JSON.stringify({ id: data.id }),
                    });
                    const json = await res.json();
                    if (res.status == 400) return alert(json.message);
                    return;
                    // return alert(json.message);
                  }
                }}
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const cols = [
    {
      key: "keterangan",
      label: "Keterangan",
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
    <>
      <Table
        isStriped
        isCompact
        className=""
        topContent={
          isAuthorized && (
            <div>
              <Button
                color="primary"
                onPress={() => {
                  setForm({ ...form, mode: "Tambah" });
                  onOpen();
                }}
              >
                Tambah
              </Button>
            </div>
          )
        }
        // bottomContent={}
        aria-label="Example table with custom cells"
      >
        <TableHeader columns={cols}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "aksi" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={data}>
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
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.mode} Keterangan
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Keterangan"
                  placeholder="Masukkan keterangan!"
                  value={form.keterangan}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      keterangan: v,
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
    </>
  );
}
