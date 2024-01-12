import { convertToRoman } from "./roman";

const penawaran = (no, date) => {
  const id = `${no}/PNW/${convertToRoman(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
  return id;
};

export { penawaran };
