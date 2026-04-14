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
import { Tooltip, useDisclosure } from "@heroui/react";
import DefaultModal from "@/components/default/DefaultModal";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useSWRConfig } from "swr";

export default function App() {
  const session = useSession();
  const { user: sessionUser } = session?.data || {};
  const { mutate } = useSWRConfig();
  const [form, setForm] = useState({});
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const onTambah = ({ id, nama }) => {
    setForm({ nama, method: "POST", id_coa_filter: id });
    onOpen();
  };
  const onSave = patchCoaFilterMap;

  const queryStates = renderQueryStates({}, session);
  if (queryStates) return queryStates;
  const { id_karyawan } = sessionUser;

  const coaFilterDisableNama = true;
  const renderCoaFilterExtraFields = (form, setForm) => (
    <>
      <div>Nama COA Filter : {form.nama || form.coa_filter}</div>
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

  console.log(form);

  return (
    <>
      <div className="flex gap-2">
        <TableWithActiveStatus
          endPoint={COA_FILTER_ENDPOINT}
          rowsPerPage={10}
          name={"COA Filter"}
          onDelete={deleteCoaFilter}
          onSave={patchCoaFilter}
          extraFields={(form, setForm) => (
            <>
              <AutocompleteCoaType
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
              />
            </>
          )}
          extraColumns={[]}
          renderActionButton={(data) => (
            <Tooltip content="Tambah Filter Map">
              <span
                onClick={() => onTambah(data)}
                className="cursor-pointer text-default-400"
              >
                <AddIcon />
              </span>
            </Tooltip>
          )}
        />
        <TableWithActiveStatus
          endPoint={COA_FILTER_MAP_ENDPOINT}
          rowsPerPage={10}
          name={"COA Filter Map"}
          onDelete={deleteCoaFilterMap}
          onSave={onSave}
          isRemoveAddButton
          extraFields={renderCoaFilterExtraFields}
          extraColumns={[
            { key: "coa_filter", label: "COA Filter" },
            // { key: "coa", label: "COA" },
            // { key: "coa_type", label: "Type" },
            // { key: "coa_subtype", label: "Subtype" },
            { key: "type", label: "Tipe" },
            { key: "nama", label: "Nama" },
          ]}
          disableNama={coaFilterDisableNama}
        />
      </div>
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
    </>
  );
}
