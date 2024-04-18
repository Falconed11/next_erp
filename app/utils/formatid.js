import { convertToRoman } from "./roman";

const penawaran = (no, date, sales) => {
  const id = `${no}/PNW/${sales}/${convertToRoman(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
  return id;
};

export { penawaran };
