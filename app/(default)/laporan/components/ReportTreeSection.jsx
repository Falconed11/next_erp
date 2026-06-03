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
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

export default function ReportTreeSection({
  reportType,
  reportSummary,
  reportTree,
  showModifier = false,
  data = {},
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
        />
      ))}
    </div>
  );
}

const ReportRow = ({ node, depth = 0, showModifier = false }) => {
  const hasChildren = node.children && node.children.length > 0;
  const modifierText =
    showModifier && node.modifier != null
      ? ` (${+node.modifier > 0 ? "+" : "-"})`
      : "";

  return (
    <div className={`flex flex-col ${depth > 0 ? "mt-2" : "mt-4"}`}>
      <div className="flex gap-2">
        <div
          className={`flex justify-between items-center p-3 rounded-t-lg border-b
          ${hasChildren ? "bg-slate-100 font-bold" : "bg-white font-medium"}
          ${depth === 0 ? "border-l-4 shadow-sm" : "border-l-2 border-l-slate-300"}
        `}
        >
          <span className="text-slate-700">
            {node.nama}
            {modifierText}
          </span>
          <span className="text-slate-900">
            <Harga harga={node.total_balance} />
          </span>
        </div>
        <div className="content-center">
          <AddRelation node={node} />
        </div>
      </div>

      {hasChildren && (
        <div className="border-l border-r border-b border-slate-200 rounded-b-lg bg-slate-50/30 pl-2 pb-2 shadow-inner">
          {node.children.map((child) => (
            <ReportRow
              key={child.id}
              node={child}
              depth={depth + 1}
              showModifier={showModifier}
            />
          ))}
        </div>
      )}
    </div>
  );
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

const AddRelation = ({ node }) => {
  const { id: idParent } = node;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState({});
  console.log("Form Data:", form);
  const { id_child, id_coa_filter, id_coa_type, id_coa_subtype, id_coa } = form;
  const isCoaSelected = id_coa_type || id_coa_subtype || id_coa;
  const isCoaDisabled = id_child || id_coa_filter;
  return (
    <>
      <Button
        onPress={() => {
          updateForm(setForm, { method: "POST", id_parent: idParent });
          onOpen();
        }}
        color="primary"
        size="sm"
      >
        <IoMdAdd /> Tambah
      </Button>
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
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
