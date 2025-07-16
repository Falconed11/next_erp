const InputProvitMargin = ({ classNames, form, setForm }) => {
  return (
    <Input
      type="number"
      max={99}
      value={form.provitmarginpersen || 0}
      label={"Provit Margin (%)"}
      placeholder="Masukkan provit margin persen!"
      className={classNames ?? ""}
      onValueChange={(v) =>
        setForm({
          ...form,
          harga: Math.ceil(
            (form.temphargamodal || form.hargamodal || 0) / (1 - v / 100)
          ),
          provitmarginpersen: Math.ceil(v * 100) / 100 || "",
        })
      }
    />
  );
};

const InputProvit = ({ classNames, form, setForm, defPersenProvit }) => {
  const [persenProvit, setPersenProvit] = useState(defPersenProvit);
  const terapkanButtonRef = useRef(null);
  return (
    <NumberInput
      hideStepper
      isWheelDisabled
      formatOptions={{
        useGrouping: false,
      }}
      value={persenProvit}
      label={"Provit (%)"}
      placeholder="Masukkan provit!"
      className={classNames || ""}
      endContent={
        <Button
          ref={terapkanButtonRef}
          color="primary"
          size="sm"
          onPress={() => {
            setForm({
              ...form,
              harga: Math.ceil(
                (form.hargamodal || 0) * (1 + (persenProvit || 0) / 100)
              ),
            });
          }}
        >
          Terapkan
        </Button>
      }
      onKeyDown={(e) => {
        if (e.key == "Enter") {
          e.preventDefault();
          terapkanButtonRef.current?.click();
        }
      }}
      onValueChange={setPersenProvit}
    />
  );
};

export { InputProvitMargin };
