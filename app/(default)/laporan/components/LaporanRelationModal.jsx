"use client";

import {
  AutocompleteCoa,
  AutocompleteCoaFilter,
  AutocompleteCoaSubtype,
  AutocompleteCoaType,
} from "@/components/coa/coa";
import { AutocompleteLaporan } from "@/components/laporan/laporan";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { IoMdAdd, IoMdCreate } from "react-icons/io";
import {
  getLaporanRelation,
  saveLaporanRelation,
} from "@/services/laporan/laporan-relation.service";

const initialForm = {};

const normalizeRelationData = (source = {}) => {
  return {
    ...source,
    id: source.id ?? source.id_laporan_relation,
    id_parent: source.id_parent ?? source.parent,
    id_child: source.id_child ?? source.child,
    id_coa_filter: source.id_coa_filter ?? source.coa_filter,
    id_coa_type: source.id_coa_type ?? source.coa_type,
    id_coa_subtype: source.id_coa_subtype ?? source.coa_subtype,
    id_coa: source.id_coa ?? source.coa,
  };
};

const LaporanRelationForm = ({ form, setForm }) => {
  const isLaporanSelected = form.id_child;
  const isCoasSelected = form.id_coa || form.id_coa_subtype || form.id_coa_type;

  return (
    <>
      <AutocompleteLaporan
        form={form}
        setForm={setForm}
        id="id_child"
        isDisabled={form.id_coa_filter || isCoasSelected}
      />
      <Divider orientation="horizontal" />
      <AutocompleteCoaFilter
        form={form}
        setForm={setForm}
        isDisabled={form.id_child || isCoasSelected}
      />
      <Divider orientation="horizontal" />
      <AutocompleteCoaType
        form={form}
        setForm={setForm}
        isDisabled={isLaporanSelected || form.id_coa_filter}
      />
      <AutocompleteCoaSubtype
        form={form}
        setForm={setForm}
        isDisabled={isLaporanSelected || form.id_coa_filter}
      />
      <AutocompleteCoa
        form={form}
        setForm={setForm}
        isDisabled={isLaporanSelected || form.id_coa_filter}
      />
    </>
  );
};

export default function LaporanRelationModal({ node, onRelationSaved, user }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const action = form.method === "PATCH" ? "Edit" : "Tambah";

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setIsLoading(false);
    }
  }, [isOpen]);

  const openAdd = () => {
    setForm({
      method: "POST",
      id_parent: node.id_laporan,
    });
    onOpen();
  };

  const openEdit = async () => {
    if (!node.id_laporan_relation) return;

    setIsLoading(true);
    onOpen();

    try {
      const res = await getLaporanRelation(node.id_laporan_relation);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Gagal memuat relasi!");

      const data = json?.data ?? json;
      setForm({
        ...normalizeRelationData(data),
        method: "PATCH",
        id: node.id_laporan_relation,
      });
    } catch (error) {
      alert(error.message || "Gagal memuat relasi!");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (onClose) => {
    if (!form.method) {
      return alert("Metode simpan tidak ditentukan.");
    }

    const sessIdKaryawan = user?.id_karyawan;
    if (!sessIdKaryawan) {
      return alert("Session user tidak tersedia.");
    }

    setIsLoading(true);
    try {
      const res = await saveLaporanRelation({
        ...form,
        sessIdKaryawan,
      });
      const json = await res.json();
      if (!res.ok) return alert(json?.message || "Gagal menyimpan relasi!");

      setForm(initialForm);
      onClose();
      onRelationSaved?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {node.id_laporan && (
        <Button onPress={openAdd} color="primary" variant="ghost" size="sm">
          <IoMdAdd className="p-0" />
        </Button>
      )}
      {node.id_laporan_relation && (
        <Button onPress={openEdit} color="secondary" variant="ghost" size="sm">
          <IoMdCreate className="p-0" />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {action} Relasi
              </ModalHeader>
              <ModalBody>
                <div className="mb-4">Simpul : {node.nama}</div>
                {isLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-600">
                    Loading relasi...
                  </div>
                ) : (
                  <LaporanRelationForm form={form} setForm={setForm} />
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                    setForm(initialForm);
                  }}
                  disabled={isLoading}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(onClose)}
                  disabled={isLoading}
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
