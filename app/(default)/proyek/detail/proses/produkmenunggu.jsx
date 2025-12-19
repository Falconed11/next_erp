import DatePicker from "react-datepicker";
import {
  Input,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { getDate } from "@/app/utils/date";
import Harga from "@/components/harga";
import { getApiPath, useClientFetch } from "@/app/utils/apiconfig";
import { key2set, set2key, renderQueryStates } from "@/app/utils/tools";
const apiPath = getApiPath();

const ProdukMenunggu = ({ id_proyek }) => {
  const pendingGoods = useClientFetch(`v2/proyek/${id_proyek}/produkmenunggu`);
  const queryStates = renderQueryStates({ pendingGoods });
  if (queryStates) return queryStates;
  console.log(pendingGoods);
  return <>Produk Menunggu</>;
};

export default ProdukMenunggu;
