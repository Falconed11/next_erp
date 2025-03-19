import { convertToRoman } from "./roman";

const penawaran = (no, date) => {
  const id = `${no}/PNW/${convertToRoman(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
  return id;
};

const invoice = (no, date) => {
  const id = `${no}/INV/${convertToRoman(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
  return id;
};

const fIdProyek = (no, date) => {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${no}`;
};

export { penawaran, fIdProyek, invoice };
