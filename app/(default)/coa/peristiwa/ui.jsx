"use client";
import { renderQueryStates } from "@/app/utils/tools";
import { TableWithActiveStatus } from "@/components/default/DefaultTable";
import {
  deletePeristiwa,
  PERISTIWA_ENDPOINT,
  patchPeristiwa,
} from "@/services/coa/peristiwa.service";
import Link from "next/link";
import { Button } from "@heroui/react";
import CoaNavigation from "@/components/coa/CoaNavigation";

export default function App() {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <CoaNavigation />
      <TableWithActiveStatus
        endPoint={PERISTIWA_ENDPOINT}
        rowsPerPage={10}
        name={"Peristiwa"}
        onDelete={deletePeristiwa}
        onSave={patchPeristiwa}
      />
    </div>
  );
}
