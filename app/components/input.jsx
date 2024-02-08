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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #ccc",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <input {...getInputProps()} />
      <p>Drag dan drop file excel di sini, atau klik untuk memilih</p>
      {file && <p>File Terpilih: {file.name}</p>}
    </div>
  );
};

export { FileUploader };
