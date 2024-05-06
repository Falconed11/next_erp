"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/input";
import { getApiPath, useClientFetch } from "../../utils/apiconfig";
import { Button } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

import Link from "next/link";

export default function App() {
  const [json, setJson] = useState([]);
  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      return v;
    });
    setJson(jsonData);
    console.log(json);
  };
  const handleButtonUploadExcelPress = async () => {
    if (json.length == 0) return alert("File belum dipilih");
    setReportList([]);
    try {
      const responses = await Promise.all(
        json.map((v) =>
          fetch(`${apiPath}produk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(v),
          })
        )
      );
      const dataArray = await Promise.all(
        responses.map((response) => response.json())
      );
      setReportList(dataArray.map((v, i) => `${i}. ${v.message}`));
    } catch (e) {
      console.error(e);
    }
    setJson([]);
    report.onOpen();
  };

  return (
    <div>
      <div className=" border bg-white rounded-lg p-2">
        <div className="flex gap-2">
          Omset
          <div>
            <Link
              className="bg-primary text-white p-2 rounded-lg inline-block"
              href={"/produk.xlsx"}
            >
              Download Format
            </Link>
          </div>
          <FileUploader onFileUpload={handleFileUpload} />
          <Button color="primary" onPress={handleButtonUploadExcelPress}>
            Upload Excel
          </Button>
        </div>
      </div>
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
                  <div key={i}>{r}</div>
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
