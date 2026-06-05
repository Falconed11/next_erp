"use client";

import { updateForm } from "@/app/utils/tools";
import {
  AutocompleteCoa,
  AutocompleteCoaFilter,
  AutocompleteCoaSubtype,
  AutocompleteCoaType,
} from "@/components/coa/coa";
import Harga from "@/components/harga";
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
import { useState, useRef, useEffect } from "react";
import {
  IoMdAdd,
  IoMdTrash,
  IoIosArrowForward,
  IoIosArrowDown,
} from "react-icons/io";
import {
  saveLaporanRelation,
  deleteLaporanRelation,
} from "@/services/laporan/laporan-relation.service";

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
          key={rootNode.id}
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
  const hasChildren = node.children && node.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);
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
            <AddRelation
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
              key={child.id}
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

const saveRelationWithSession = async ({
  form,
  setForm,
  user,
  onRelationSaved,
  onClose,
}) => {
  if (!form.method) {
    return alert("Metode simpan tidak ditentukan.");
  }

  const sessIdKaryawan = user?.id_karyawan;
  if (!sessIdKaryawan) {
    return alert("Session user tidak tersedia.");
  }

  const res = await saveLaporanRelation({
    ...form,
    sessIdKaryawan,
  });
  const json = await res.json();

  if (!res.ok) {
    return alert(json?.message || "Gagal menyimpan relasi!");
  }
  setForm({});
  onClose();
  onRelationSaved?.();
};

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

const AddRelation = ({ node, onRelationSaved, user }) => {
  const { id: idParent, node_type } = node;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState({});
  const { id_child, id_coa_filter, id_coa_type, id_coa_subtype, id_coa } = form;
  const isCoaSelected = id_coa_type || id_coa_subtype || id_coa;
  const isCoaDisabled = id_child || id_coa_filter;

  const handleSave = async (onClose) => {
    await saveRelationWithSession({
      form,
      setForm,
      user,
      onRelationSaved,
      onClose,
    });
  };

  return (
    <>
      {node_type == "laporan" && (
        <Button
          onPress={() => {
            updateForm(setForm, { method: "POST", id_parent: idParent });
            onOpen();
          }}
          color="primary"
          variant="ghost"
          size="sm"
          className=""
        >
          <IoMdAdd className="p-0" />
        </Button>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {form.method === "POST" ? "Tambah" : "Edit"} Relasi
              </ModalHeader>
              <ModalBody>
                <div>Simpul : {node.nama}</div>
                <AutocompleteLaporan
                  form={form}
                  setForm={setForm}
                  id="id_child"
                  isDisabled={id_coa_filter || isCoaSelected}
                />
                <Divider orientation="horizontal" />
                <AutocompleteCoaFilter
                  form={form}
                  setForm={setForm}
                  isDisabled={id_child || isCoaSelected}
                />
                <Divider orientation="horizontal" />
                <AutocompleteCoaType
                  form={form}
                  setForm={setForm}
                  isDisabled={isCoaDisabled}
                />
                <AutocompleteCoaSubtype
                  form={form}
                  setForm={setForm}
                  isDisabled={isCoaDisabled}
                />
                <AutocompleteCoa
                  form={form}
                  setForm={setForm}
                  isDisabled={isCoaDisabled}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => handleSave(onClose)}>
                  Simpan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
