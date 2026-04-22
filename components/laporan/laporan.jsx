import { LAPORAN_ENDPOINT } from "@/services/laporan/laporan.service";
import { useAutocompleteField } from "../myautocomplete";

export const AutocompleteLaporan = (props) => {
  const { component } = useAutocompleteField({
    endpoint: props.endpoint ?? `${LAPORAN_ENDPOINT}?aktif=1`,
    title: props.title ?? "Parent",
    field: props.field ?? "parent",
    id: props.id ?? "id_parent",
    disableCustomValue: props.disableCustomValue ?? true,
    variant: props.variant,
    ...props,
  });
  return component;
};
