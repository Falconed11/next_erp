// import { UserIcon, DeleteIcon } from "./icon";

export default function App({ harga, label, endContent }) {
  return (
    <div className="inline-block text-right">
      {label} {harga.toLocaleString("id-ID")} {endContent}
    </div>
  );
}
