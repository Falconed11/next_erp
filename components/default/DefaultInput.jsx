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
}) => (
  <NumberInput
    isRequired
    variant={variant}
    hideStepper
    isWheelDisabled
    formatOptions={{
      useGrouping: false,
    }}
    value={form[field] || ""}
    label={label}
    placeholder={placeholder}
    className={className}
    endContent={endContent}
    onValueChange={(v) => setForm((prev) => updateForm(prev, { [field]: v }))}
  />
);
