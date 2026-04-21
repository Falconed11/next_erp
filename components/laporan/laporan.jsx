import { LAPORAN_ENDPOINT } from "@/services/laporan/laporan.service";
import { useAutocompleteField } from "../myautocomplete";

export const AutocompleteLaporan = (props) => {
  const { component } = useAutocompleteField({
    endpoint: `${LAPORAN_ENDPOINT}?aktif=1`,
    title: "Parent",
    field: "parent",
    id: "id_parent",
    disableCustomValue: true,
    ...props,
  });
  return component;
};
