"use client";

import Harga from "@/components/harga";
import { Button, Divider, useDisclosure } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import {
  IoMdTrash,
  IoIosArrowForward,
  IoIosArrowDown,
  IoMdCreate,
  IoMdAdd,
} from "react-icons/io";
import {
  deleteLaporanRelation,
  getLaporanRelation,
  saveLaporanRelation,
} from "@/services/laporan/laporan-relation.service";
import { LaporanRelationForm } from "@/components/laporan/laporan";
import DefaultModal from "@/components/default/DefaultModal";
import { useDefaultFetch } from "@/hooks/useDefault";
import { apiFetch } from "@/app/utils/fetchHelper";

export default function ReportTreeSection({
  reportType,
  reportSummary,
  reportTree,
  showModifier = false,
  onRelationSaved,
  isTemplate = false,
  user,
}) {
  return (
    <div className="space-y-4">
      {reportType === "full" && reportSummary ? (
        <FullReportSummary summary={reportSummary} />
      ) : null}
      {reportTree.map((rootNode) => (
        <ReportRow
          key={rootNode.path}
          node={rootNode}
          showModifier={showModifier}
          onRelationSaved={onRelationSaved}
          isTemplate={isTemplate}
          user={user}
        />
      ))}
    </div>
  );
}

const ReportRow = ({
  node,
  depth = 0,
  showModifier = false,
  isTemplate = false,
  onRelationSaved,
  user,
}) => {
  const isLaporanLeaf = !node.children?.[0]?.id_laporan_relation;
  const hasChildren = node.children && node.children.length > 0;
  const [isOpen, setIsOpen] = useState(isLaporanLeaf ? false : true);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(isOpen ? undefined : "0px");

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      // expand to content's scrollHeight, then clear restriction after transition
      const sh = el.scrollHeight;
      setMaxHeight(`${sh}px`);
    } else {
      // collapse: set to current height then to 0 to animate
      const sh = el.scrollHeight;
      setMaxHeight(`${sh}px`);
      requestAnimationFrame(() => setMaxHeight("0px"));
    }
  }, [isOpen, node.children]);

  const modifierText =
    showModifier && node.modifier != null
      ? ` (${+node.modifier > 0 ? "+" : "-"})`
      : "";

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-2" : "mt-4"}`}>
      <div className="flex gap-2">
        <div
          className={`flex justify-between items-center p-3 gap-2 rounded-t-lg border-b
          ${hasChildren ? "bg-slate-100 font-bold" : "bg-white font-medium"}
          ${depth === 0 ? "border-l-4 shadow-sm" : "border-l-2 border-l-slate-300"}
        `}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsOpen((s) => !s)}
                aria-label={isOpen ? "Collapse" : "Expand"}
                className="text-slate-600 cursor-pointer hover:bg-slate-300 p-1 rounded-full"
              >
                {isOpen ? <IoIosArrowDown /> : <IoIosArrowForward />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="text-slate-700">
              {node.nama}
              {node.level ? modifierText : null}
            </span>
          </div>
          <span className="text-slate-900">
            <Harga harga={node.total_balance} />
          </span>
        </div>
        {isTemplate && (
          <div className="flex items-center gap-2">
            <LaporanRelationModal
              node={node}
              onRelationSaved={onRelationSaved}
              user={user}
            />
            {node.id_laporan_relation && (
              <Button
                color="danger"
                variant="ghost"
                size="sm"
                onPress={async () => {
                  if (!confirm("Hapus relasi ini?")) return;
                  const res = await deleteLaporanRelation(
                    node.id_laporan_relation,
                  );
                  const json = await res.json();
                  if (!res.ok)
                    return alert(json?.message || "Gagal menghapus relasi!");
                  onRelationSaved?.();
                }}
              >
                <IoMdTrash />
              </Button>
            )}
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          ref={contentRef}
          onTransitionEnd={(e) => {
            if (e.propertyName === "max-height" && isOpen) {
              setMaxHeight(undefined);
            }
          }}
          style={{
            maxHeight: maxHeight === undefined ? undefined : maxHeight,
            transition: "max-height 220ms ease",
          }}
          className="border-l border-r border-b border-slate-200 rounded-b-lg bg-slate-50/30 pl-2 pb-2 shadow-inner overflow-hidden"
        >
          {node.children.map((child) => (
            <ReportRow
              key={child.path}
              node={child}
              depth={depth + 1}
              showModifier={showModifier}
              onRelationSaved={onRelationSaved}
              isTemplate={isTemplate}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function LaporanRelationModal({ node, onRelationSaved, user }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const action = form.method === "PATCH" ? "Edit" : "Tambah";

  const openAdd = () => {
    setForm({
      method: "POST",
      parent: node.nama,
      id_parent: node.id_laporan,
    });
    onOpen();
  };

  // const openEdit = async () => {
  //   if (!node.id_laporan_relation) return;

  //   setIsLoading(true);
  //   onOpen();

  //   try {
  //     const res = await getLaporanRelation(node.id_laporan_relation);
  //     const json = await res.json();
  //     if (!res.ok) throw new Error(json?.message || "Gagal memuat relasi!");

  //     const data = json?.data ?? json;
  //     setForm({
  //       ...normalizeRelationData(data),
  //       method: "PATCH",
  //       id: node.id_laporan_relation,
  //     });
  //   } catch (error) {
  //     alert(error.message || "Gagal memuat relasi!");
  //     onOpenChange(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const openEdit = async () => {
    setIsLoading(true);
    onOpen();
    const res = await getLaporanRelation(node.id_laporan_relation);
    const json = await res.json();
    if (!res.ok) {
      alert(json?.message || "Gagal memuat relasi!");
      return;
    }
    const { data } = json || {};
    // console.log(data);
    setForm({ ...data, method: "PATCH" });
    setIsLoading(false);
  };

  // useEffect(() => {
  //   console.log(form);
  // }, [form]);

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
      <DefaultModal
        extraFields={(form, setForm) => (
          <LaporanRelationForm
            form={form}
            setForm={setForm}
            isDisabledLaporan
          />
        )}
        form={form}
        setForm={setForm}
        id_karyawan={user.id_karyawan}
        name="Relasi Laporan"
        user={user}
        data={{ mutate: onRelationSaved }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onSave={saveLaporanRelation}
        isRequiredNama={false}
        isLoading={isLoading}
      />
      {/* <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
      </Modal> */}
    </>
  );
}

const FullReportSummary = ({ summary }) => {
  const summaryItems = [
    { label: "Past", value: Number(summary?.past ?? 0) },
    { label: "End", value: Number(summary?.end ?? 0) },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="text-sm font-medium text-slate-500">{item.label}</div>
          <div className="mt-1 text-lg font-bold text-slate-800">
            <Harga harga={item.value} />
          </div>
        </div>
      ))}
    </div>
  );
};
