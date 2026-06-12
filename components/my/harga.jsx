// import { UserIcon, DeleteIcon } from "./icon";

import { number2Nominal } from "@/app/utils/number";

const Harga = ({ className, harga, label, endContent }) => {
  return (
    <span className={`text-right ${className}`}>
      {label} {number2Nominal(harga)} {endContent}
    </span>
  );
};

export const NumberComp = ({ value, label }) => {
  return (
    <div className="text-right">
      <Harga label={label} harga={value} />
    </div>
  );
};

export default Harga;
