"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/input";
import { Button } from "@nextui-org/react";
import { Input, Textarea } from "@nextui-org/react";
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

import Link from "next/link";

const apiPath = getApiPath();

export default function App() {
  const [isLoading, setIsLoading] = useState(0);
  const [reportList, setReportList] = useState([]);
  const report = useDisclosure();
  if (isLoading) return <>Loading...</>;
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

function TemplateImport({
  setReportList,
  report,
  name,
  apiendpoint,
  isLoading,
  setIsLoading,
}) {
  const [customInputCode, setCustomInputCode] = useState([]);
  const [json, setJson] = useState([]);
  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
  };
  const handleButtonUploadExcelPress = async (apiendpoint) => {
    if (!customInputCode) return alert("Kode input wajib diisi!");
    if (json.length == 0) return alert("File belum dipilih");
    setIsLoading(1);
    setReportList([]);
    const res = await fetch(`${apiPath}${apiendpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ customInputCode, json }),
    });
    const json2 = await res.json();
    if (res.status == 400) return alert(json2?.message ?? "no msg");
    setReportList(json2.result);
    console.log(json2);

    setJson([]);
    setIsLoading(0);
    report.onOpen();
  };

  // const handleButtonUploadExcelPress = async (apiendpoint) => {
  //   if (json.length == 0) return alert("File belum dipilih");
  //   setIsLoading(1);
  //   setReportList([]);
  //   try {
  //     const responses = await Promise.all(
  //       json.map((v) =>
  //         fetch(`${apiPath}${apiendpoint}`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             // 'Content-Type': 'application/x-www-form-urlencoded',
  //           },
  //           body: JSON.stringify(v),
  //         })
  //       )
  //     );
  //     const dataArray = await Promise.all(
  //       responses.map((response) => response.json())
  //     );
  //     setReportList(dataArray.map((v, i) => `${i}. ${v.message}`));
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   setJson([]);
  //   setIsLoading(0);
  //   report.onOpen();
  // };

  return (
    <div className=" border bg-white rounded-lg p-2">
      {name}
      <div className="flex gap-2">
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={"/produk.xlsx"}
          >
            Download Format
          </Link>
        </div>
        <div>
          <Input
            type="text"
            label="Kode Input"
            placeholder="Masukkan kode input!"
            value={customInputCode}
            onValueChange={setCustomInputCode}
          />
        </div>
        <FileUploader onFileUpload={handleFileUpload} />
        <Button
          color="primary"
          onPress={() => handleButtonUploadExcelPress(apiendpoint)}
        >
          Upload Excel
        </Button>
      </div>
    </div>
  );
}
