"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import {
  deleteCoaFilter,
  COA_FILTER_ENDPOINT,
  patchCoaFilter,
} from "@/services/coa/coa-filter.service";
import {
  deleteCoaFilterMap,
  COA_FILTER_MAP_ENDPOINT,
  patchCoaFilterMap,
} from "@/services/coa/coa-filter-map.service";
import {
  AutocompleteCoaType,
  AutocompleteCoaSubtype,
  AutocompleteCoa,
} from "@/components/coa/coa";
import { AddIcon } from "@/components/icon";
import {
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import DefaultModal from "@/components/default/DefaultModal";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import CoaNavigation from "@/components/coa/CoaNavigation";

export default function App() {
  const session = useSession();
  const { user: sessionUser } = session?.data || {};
  const { mutate } = useSWRConfig();
  const [form, setForm] = useState({});
  const [viewMode, setViewMode] = useState(null); // 'add' or 'view'
  const [selectedFilterId, setSelectedFilterId] = useState(null);
  const [selectedFilterNama, setSelectedFilterNama] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const onTambah = ({ id, nama }) => {
    setViewMode("add");
    setSelectedFilterId(id);
    setSelectedFilterNama(nama);
    setForm({ nama, method: "POST", id_coa_filter: id });
    onOpen();
  };

  const onShowMaps = ({ id, nama }) => {
    setViewMode("view");
    setSelectedFilterId(id);
    setSelectedFilterNama(nama);
    setForm({ id_coa_filter: id, nama });
    onOpen();
  };

  const onSave = patchCoaFilterMap;

  const queryStates = renderQueryStates({}, session);
  if (queryStates) return queryStates;
  const { id_karyawan } = sessionUser;

  const coaFilterDisableNama = true;
  const renderCoaFilterExtraFields = (form, setForm) => (
    <>
      <div>
        Nama COA Filter : {selectedFilterNama || form.nama || form.coa_filter}
      </div>
      <AutocompleteCoaType form={form} setForm={setForm} />
      <AutocompleteCoaSubtype
        id_coa_type={form.id_coa_type}
        form={form}
        setForm={setForm}
      />
      <AutocompleteCoa
        id_coa_type={form.id_coa_type}
        id_coa_subtype={form.id_coa_subtype}
        form={form}
        setForm={setForm}
      />
    </>
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <CoaNavigation />
        <TableWithActiveStatus
          endPoint={COA_FILTER_ENDPOINT}
          rowsPerPage={10}
          name={"COA Filter"}
          onDelete={deleteCoaFilter}
          onSave={patchCoaFilter}
          extraFields={(form, setForm) => (
            <>
              {/* <AutocompleteCoaType
                disallowEmptySelection
                form={form}
                setForm={setForm}
              />
              <AutocompleteCoaSubtype
                id_coa_type={form.id_coa_type}
                disallowEmptySelection
                form={form}
                setForm={setForm}
              />
              <AutocompleteCoa
                id_coa_type={form.id_coa_type}
                id_coa_subtype={form.id_coa_subtype}
                disallowEmptySelection
                form={form}
                setForm={setForm}
              /> */}
            </>
          )}
          extraColumns={[]}
          renderActionButton={(data) => (
            <div className="flex gap-2">
              <Tooltip content="Lihat Filter Map">
                <span
                  onClick={() => onShowMaps(data)}
                  className="cursor-pointer text-default-400"
                >
                  📋
                </span>
              </Tooltip>
              <Tooltip content="Tambah Filter Map">
                <span
                  onClick={() => onTambah({ id: data.id, nama: data.nama })}
                  className="cursor-pointer text-default-400"
                >
                  <AddIcon />
                </span>
              </Tooltip>
            </div>
          )}
        />
      </div>
      {viewMode === "add" ? (
        <DefaultModal
          data={{ mutate: () => mutate(COA_FILTER_MAP_ENDPOINT) }}
          form={form}
          id_karyawan={id_karyawan}
          isOpen={isOpen}
          name="COA Filter Map"
          onOpenChange={onOpenChange}
          onSave={onSave}
          setForm={setForm}
          extraFields={renderCoaFilterExtraFields}
          disableNama={coaFilterDisableNama}
        />
      ) : (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Filter Map: {selectedFilterNama}
            </ModalHeader>
            <ModalBody>
              <TableWithActiveStatus
                endPoint={`${COA_FILTER_MAP_ENDPOINT}?id_coa_filter=${selectedFilterId}`}
                rowsPerPage={10}
                name={"COA Filter Map"}
                onDelete={deleteCoaFilterMap}
                onSave={onSave}
                extraFields={renderCoaFilterExtraFields}
                extraColumns={[
                  { key: "coa_filter", label: "COA Filter" },
                  { key: "tipe", label: "Tipe" },
                  { key: "nama", label: "Nama" },
                ]}
                disableNama={coaFilterDisableNama}
                addExtraColumnHandlers={(data) => {
                  const fields = ["coa", "coa_subtype", "coa_type"];
                  const activeField = fields.find((field) => data[field]);
                  return {
                    tipe: () => activeField || "",
                    nama: () => (activeField ? data[activeField] : ""),
                  };
                }}
                extraDataBeforeAdd={{ id_coa_filter: form.id_coa_filter }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
