"use client";
import { renderQueryStates } from "@/app/utils/tools";
import {
  deleteTransferBank,
  saveTransferBank,
} from "@/services/transfer-bank.service";
import { TransferBankTable } from "@/components/transfer-bank/TransferBankTable";

export default function App() {
  // const queryStates = renderQueryStates({});
  // if (queryStates) return queryStates;
  console.log("parent");
  return (
    <div className="flex flex-col gap-2">
      <TransferBankTable
        rowsPerPage={10}
        onDelete={deleteTransferBank}
        onSave={saveTransferBank}
      />
    </div>
  );
}
