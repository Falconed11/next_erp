"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import {
  saveVendorJenis,
  deleteVendorJenis,
  VENDOR_JENIS_ENDPOINT,
} from "@/services/vendor-jenis.service";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;

  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={VENDOR_JENIS_ENDPOINT}
        rowsPerPage={10}
        name="Vendor Jenis"
        onDelete={deleteVendorJenis}
        onSave={saveVendorJenis}
      />
    </div>
  );
}
