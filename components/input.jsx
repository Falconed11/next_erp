import { useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";

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
      className="p-2 bg-white border-2 border-dashed border-gray-700 rounded-lg block"
    >
      <input {...getInputProps()} />
      <p>Drag dan drop file excel di sini, atau klik untuk memilih file</p>
      {file && <p>File Terpilih: {file.name}</p>}
    </div>
  );
};

export { FileUploader };
