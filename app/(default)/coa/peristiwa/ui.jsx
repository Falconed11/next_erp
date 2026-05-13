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
import CoaNavigation from "@/app/(default)/coa/components/CoaNavigation";

export default function App({ user }) {
  const queryStates = renderQueryStates({});
  if (queryStates) return queryStates;
  return (
    <div className="flex flex-col gap-2">
      <TableWithActiveStatus
        endPoint={PERISTIWA_ENDPOINT}
        rowsPerPage={10}
        name={"Peristiwa"}
        onDelete={deletePeristiwa}
        onSave={patchPeristiwa}
        user={user}
      />
    </div>
  );
}
