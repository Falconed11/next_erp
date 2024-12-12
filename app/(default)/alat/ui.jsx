"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { TemplateImport } from "@/components/input";
import { Button } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import {
  getDate,
  getDateF,
  getCurFirstLastDay,
  excelToJSDate,
} from "@/app/utils/date";
import { useClientFetch, getApiPath } from "../../utils/apiconfig";
import { useSession } from "next-auth/react";

const apiPath = getApiPath();

export default function App() {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(0);
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();
  if (isLoading) return <>Loading...</>;
  if (session.status === "loading") return <>Loading...</>;
  if (!["super"].includes(session.data.user.peran))
    return <>Anda tidak memiliki akses pada laman ini.</>;
  return (
    <div className="flex flex-col gap-2">
      <TemplateImport
        report={report}
        setReportList={setReportList}
        name={"Pengeluaran Proyek"}
        apiendpoint={"importpengeluaranproyek"}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <TemplateImport
        report={report}
        setReportList={setReportList}
        name={"Pembayaran Proyek"}
        apiendpoint={"importpembayaranproyek"}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      <TemplateImport
        report={report}
        setReportList={setReportList}
        name={"Operasional Kantor"}
        apiendpoint={"importoperasionalkantor"}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {/* upload report */}
      <Modal
        isOpen={report.isOpen}
        onOpenChange={report.onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Hasil Upload
              </ModalHeader>
              <ModalBody>
                {reportList.map((r, i) => (
                  <div key={i}>
                    {i + 1}. {r}
                  </div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
