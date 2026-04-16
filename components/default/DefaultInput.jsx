import { updateForm } from "@/app/utils/tools";
import { NumberInput } from "@heroui/react";

export const DefaultNumberInput = ({
  variant,
  field,
  form,
  setForm,
  label,
  placeholder,
  className,
  endContent,
  value = form[field] || "",
  onValueChange = (v) => setForm((prev) => updateForm(prev, { [field]: v })),
}) => (
  <NumberInput
    isRequired
    variant={variant}
    hideStepper
    isWheelDisabled
    formatOptions={{
      useGrouping: false,
    }}
    value={value}
    label={label}
    placeholder={placeholder}
    className={className}
    endContent={endContent}
    onValueChange={onValueChange}
  />
);
