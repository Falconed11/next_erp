import { useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { Input, Textarea } from "@heroui/react";
import { getDate, excelToJSDate, getDateF } from "@/app/utils/date";
import { getApiPath } from "@/app/utils/apiconfig";

const apiPath = getApiPath();

const FileUploader = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      onFileUpload(jsonData);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="p-2 bg-white border-2 border-dashed border-gray-700 rounded-lg block cursor-pointer"
    >
      <input {...getInputProps()} />
      <div>Drag dan drop file excel di sini, atau klik untuk memilih file</div>
      {file && <div>File Terpilih: {file.name}</div>}
    </div>
  );
};

const FileUploaderV2 = ({ file, setFile, onFileUpload }) => {
  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      onFileUpload(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
  });
  return (
    <div
      {...getRootProps()}
      className="p-2 bg-white border-2 border-dashed border-gray-700 rounded-lg block cursor-pointer"
    >
      <input {...getInputProps()} />
      <div>Drag dan drop file excel di sini, atau klik untuk memilih file</div>
      {file && <div>File Terpilih: {file.name}</div>}
    </div>
  );
};

const RangeDate = ({ current, setCurrent, setPage }) => {
  const [filter, setFilter] = useState(current);
  const cariOnPress = (e) => {
    e.preventDefault();
    setCurrent(filter);
    setPage(1);
  };
  const theme = "bg-white";
  return (
    <div className="flex flex-col bg-gray-100 p-3 rounded-lg gap-1 z-50">
      <div>Periode</div>
      <form onSubmit={cariOnPress} className="flex flex-col gap-2">
        <DatePicker
          className={theme}
          dateFormat="dd/MM/yyyy"
          selected={filter.startDate}
          onChange={(date) => setFilter({ ...filter, startDate: date })}
          onSelect={(date) => {
            setCurrent({ ...filter, startDate: date });
            setPage(1);
          }}
          selectsStart
          startDate={filter.startDate}
          endDate={filter.endDate}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents the Date Picker from opening
            }
          }}
        />
        <DatePicker
          className={theme}
          dateFormat="dd/MM/yyyy"
          selected={filter.endDate}
          onChange={(date) => setFilter({ ...filter, endDate: date })}
          onSelect={(date) => {
            setCurrent({ ...filter, endDate: date });
          }}
          selectsEnd
          startDate={filter.startDate}
          endDate={filter.endDate}
          minDate={filter.startDate}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents the Date Picker from opening
            }
          }}
        />
        <div className="justify-end flex">
          <Button
            type="submit"
            color="primary"
            // onPress={cariOnPress}
            isDisabled={filter == current ? true : null}
          >
            Cari
          </Button>
        </div>
      </form>
    </div>
  );
};

function TemplateImport({
  setReportList,
  report,
  name,
  apiendpoint,
  isLoading,
  setIsLoading,
  formatLink,
}) {
  formatLink = formatLink ?? "";
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
    setJson([]);
    setIsLoading(0);
    report.onOpen();
  };

  return (
    <div className=" border bg-white rounded-lg p-2">
      {name}
      <div className="flex gap-2">
        <div>
          <Link
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={formatLink}
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
function TemplateImportV2({
  children,
  json,
  setJson,
  name,
  apiendpoint,
  isLoading,
  isDisabled,
  setIsLoading,
  formatLink,
  editRow,
}) {
  formatLink = formatLink ?? "";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [customInputCode, setCustomInputCode] = useState([]);
  const [file, setFile] = useState();
  const [reportList, setReportList] = useState();
  const handleFileUpload = (jsonData) => {
    // console.log(jsonData);
    // Do something with the converted JSON object, e.g., send it to an API
    jsonData = jsonData.map((v) => {
      v.tanggal = getDate(excelToJSDate(v.tanggal));
      if (editRow) v = editRow(v);
      return v;
    });
    setJson(jsonData);
  };
  const handleButtonUploadExcelPress = async (apiendpoint) => {
    // if (!customInputCode) return alert("Kode input wajib diisi!");
    if (json.length == 0) return alert("File belum dipilih");
    setIsLoading(1);
    setReportList([]);
    const res = await fetch(`${apiPath}${apiendpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        customInputCode: customInputCode || getDateF(new Date()),
        json,
      }),
    });
    const json2 = await res.json();
    if (res.status == 400) return alert(json2?.message ?? "no msg");
    setReportList(json2.result);
    setJson([]);
    setFile();
    setIsLoading(0);
    onOpen();
  };

  return (
    <div className=" border bg-white rounded-lg p-2">
      {name}
      <div className="flex gap-2">
        <div>
          <a
            className="bg-primary text-white p-2 rounded-lg inline-block"
            href={formatLink}
          >
            Download Format
          </a>
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
        <FileUploaderV2
          file={file}
          setFile={setFile}
          onFileUpload={handleFileUpload}
        />
        {children}
        <Button
          color="primary"
          onPress={() => handleButtonUploadExcelPress(apiendpoint)}
          isDisabled={isDisabled}
        >
          Upload Excel
        </Button>
      </div>
      {/* upload report */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
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

export { FileUploader, RangeDate, TemplateImport, TemplateImportV2 };
