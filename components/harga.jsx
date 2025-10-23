// import { UserIcon, DeleteIcon } from "./icon";

const Harga = ({ className, harga, label, endContent }) => {
  return (
    <span className={`text-right ${className}`}>
      {label} {harga ? (+harga).toLocaleString("id-ID") : 0} {endContent}
    </span>
  );

  // harga ? (
  //   <div className="inline-block text-right">
  //     {label} {harga.toLocaleString("id-ID")} {endContent}
  //   </div>
  // ) : (
  //   0
  // );
};

export default Harga;
