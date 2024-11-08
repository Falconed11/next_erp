import { useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { Button } from "@nextui-org/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const RangeDate = ({ current, setCurrent }) => {
  const [filter, setFilter] = useState(current);
  const cariOnPress = () => {
    setCurrent(filter);
  };
  return (
    <div className="flex flex-col bg-gray-100 p-3 rounded-lg gap-1">
      <div>Periode</div>
      <DatePicker
        dateFormat="dd/MM/yyyy"
        selected={filter.startDate}
        onChange={(date) => setFilter({ ...filter, startDate: date })}
        selectsStart
        startDate={filter.startDate}
        endDate={filter.endDate}
      />
      <DatePicker
        dateFormat="dd/MM/yyyy"
        selected={filter.endDate}
        onChange={(date) => setFilter({ ...filter, endDate: date })}
        selectsEnd
        startDate={filter.startDate}
        endDate={filter.endDate}
        minDate={filter.startDate}
      />
      <div className="justify-end flex">
        <Button
          color="primary"
          onPress={cariOnPress}
          isDisabled={filter === current ? true : null}
        >
          Cari
        </Button>
      </div>
    </div>
  );
};

export { FileUploader, RangeDate };
