import React, { useState } from "react";
import { Button, Checkbox, Chip, Input, Tooltip } from "@heroui/react";
import { EditIcon, DeleteIcon } from "@/components/my/icon";
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
import { getApiPath } from "@/app/utils/apiconfig";
import { useClientFetch } from "@/hooks/useClientFetch";
import { apiFetch } from "@/app/utils/fetchHelper";

const api_path = getApiPath();

export default function SubProyek({ id, selectedProyek, isAuthorized }) {
  const [form, setForm] = useState({});
  const modal = useDisclosure();

  const subProyek = useClientFetch(`subproyek?id_proyek=${id}`);

  const tambahSubProyekButtonPress = async () => {
    if (!form.namaSubProyek) return alert("Silahkan masukkan nama sub proyek!");
    try {
      const json = await apiFetch(`${api_path}subproyek`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          id_proyek: id,
          nama: form.namaSubProyek,
        }),
      });
      subProyek.mutate();
      setForm({ namaSubProyek: "" });
    } catch (error) {
      alert(error.message || "An error occurred while adding sub proyek.");
    }
  };
  const editButtonPress = (data, onOpen) => {
    setForm(data);
    modal.onOpen();
  };
  const simpanButtonPress = async (data, onClose) => {
    try {
      const json = await apiFetch(`${api_path}subproyek`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data),
      });
      subProyek.mutate();
      onClose();
    } catch (error) {
      alert(error.message || "An error occurred while saving sub proyek.");
    }
  };
  const deleteButtonPress = async (data) => {
    if (confirm(`Hapus sub proyek ${data.nama}?`)) {
      try {
        const res = await apiFetch(`${api_path}subproyek`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({ id: data.id }),
        });
        subProyek.mutate();
      } catch (error) {
        alert(error.message || "An error occurred while deleting sub proyek.");
      }
    }
  };

  if (subProyek.error) return <div>failed to load</div>;
  if (subProyek.isLoading) return <div>loading...</div>;
  return (
    <div className="bg-white rounded-lg flex flex-col gap-2 p-3">
      <div>Sub Proyek</div>
      {isAuthorized && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={form.namaSubProyek}
            label="Nama"
            placeholder="Masukkan nama Sub Proyek!"
            className="w-3/12"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small"></span>
              </div>
            }
            onValueChange={(v) =>
              setForm({
                ...form,
                namaSubProyek: v,
              })
            }
          />
          <div>
            <Button
              onClick={() => {
                tambahSubProyekButtonPress();
              }}
              color="primary"
              variant="solid"
            >
              Tambah
            </Button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        {subProyek.data.map((data, i) => (
          <Chip
            key={i}
            endContent={
              isAuthorized && (
                <div className="flex gap-2">
                  <Tooltip content="Edit">
                    <span
                      onClick={() => editButtonPress(data)}
                      className="text-lg text-default-400 cursor-pointer active:opacity-50"
                    >
                      <EditIcon />
                    </span>
                  </Tooltip>
                  <Tooltip color="danger" variant="solid" content="Delete">
                    <span
                      onClick={() => deleteButtonPress(data)}
                      className="text-lg text-danger cursor-pointer active:opacity-50"
                    >
                      <DeleteIcon />
                    </span>
                  </Tooltip>
                </div>
              )
            }
          >
            {data.nama}
          </Chip>
        ))}
      </div>
      <Modal
        scrollBehavior="inside"
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Sub Proyek
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  value={form.nama}
                  label="Nama Sub Proyek"
                  placeholder="Masukkan nama sub proyek!"
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      nama: v,
                    })
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onClick={() => {
                    setForm({ nama: "" });
                    onClose();
                  }}
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onClick={() => simpanButtonPress(form, onClose)}
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
