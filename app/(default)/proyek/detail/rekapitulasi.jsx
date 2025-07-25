import { useState } from "react";
import Harga from "@/components/harga";
import { countRecapitulation } from "@/app/utils/formula";

export default function Rekapitulasi({ peralatan, instalasi, rekapitulasi }) {
  const [form, setForm] = useState({});
  const rekapPeralatan = countRecapitulation(
    peralatan,
    rekapitulasi.diskon,
    rekapitulasi.pajak
  );
  const rekapInstalasi = countRecapitulation(
    instalasi,
    rekapitulasi.diskoninstalasi,
    0
  );
  const createRecapTable = (rekap, diskon, pajak) => {
    return [
      { key: "Sub Total Modal", val: rekap.modal, info: null },
      { key: "Sub Total Harga", val: rekap.jual, info: null },
      {
        key: "Maks Diskon",
        val: rekap.maksDiskon,
        info: rekap.maksDiskonPersen,
      },
      {
        key: "Diskon",
        val: diskon,
        info: rekap.diskonPersen,
      },
      {
        key: "Harga Setelah Diskon",
        val: rekap.hargaDiskon,
        info: null,
      },
      { key: "Pajak", val: rekap.pajak, info: pajak },
      { key: "Harga Setelah Pajak", val: rekap.hargaPajak, info: null },
      {
        key: "Estimasi Provit",
        val: rekap.provit,
        info: rekap.provitPersen,
      },
    ];
  };
  const dataTabelPeralatan = createRecapTable(
    rekapPeralatan,
    rekapitulasi.diskon,
    rekapitulasi.pajak
  );
  const dataTabelInstalasi = createRecapTable(
    rekapInstalasi,
    rekapitulasi.diskoninstalasi,
    0
  );
  return (
    <div className="bg-white rounded-lg p-3 w- text-nowrap">
      <div>Rekapitulasi</div>
      <div className="flex gap-2">
        <RecapTable title={"Peralatan"} tableData={dataTabelPeralatan} />
        <RecapTable title={"Instalasi"} tableData={dataTabelInstalasi} />
      </div>
    </div>
  );
}

const RekapHarga = () => {
  return (
    <>
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        isInvalid={
          formRekapitulasi.diskon > rekapProduk.maksDiskon ? true : false
        }
        errorMessage={
          formRekapitulasi.diskon > rekapProduk.maksDiskon
            ? "Diskon melebihi batas"
            : undefined
        }
        value={formRekapitulasi.diskon}
        label="Diskon"
        placeholder="Masukkan diskon!"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">
              ({((formRekapitulasi.diskon / totalHarga) * 100).toFixed(2)}
              %)
            </span>
          </div>
        }
        onValueChange={(v) =>
          setFormRekapitulasi({
            ...formRekapitulasi,
            diskon: v,
            hargadiskon: rekapProduk.jual - v,
          })
        }
      />
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        value={formRekapitulasi.hargadiskon}
        label="Harga Setelah Diskon"
        placeholder="Masukkan harga diskon!"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">
              <Harga harga={formRekapitulasi.hargadiskon} />
            </span>
          </div>
        }
        onValueChange={(v) =>
          setFormRekapitulasi({
            ...formRekapitulasi,
            hargadiskon: v,
            diskon: totalHarga - v,
          })
        }
      />
      <NumberInput
        hideStepper
        isWheelDisabled
        formatOptions={{
          useGrouping: false,
        }}
        value={formRekapitulasi.pajak}
        label="Pajak (%)"
        placeholder="Masukkan pajak!"
        endContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">
              <Harga
                harga={
                  (formRekapitulasi.pajak *
                    (rekapProduk.jual - formRekapitulasi.diskon)) /
                  100
                }
              />
            </span>
          </div>
        }
        onValueChange={(v) =>
          setFormRekapitulasi({
            ...formRekapitulasi,
            pajak: v,
          })
        }
      />
      <div>
        Total Harga :{" "}
        <Harga
          harga={
            (formRekapitulasi.hargadiskon *
              (100 + parseInt(formRekapitulasi.pajak))) /
            100
          }
        />
      </div>
    </>
  );
};

const RecapTable = ({ title, tableData }) => {
  return (
    <div>
      <div>{title}</div>
      {tableData.map((v, i) => (
        <div key={i} className="grid grid-cols-2 gap- pl-2">
          <div className="basis-1/2-">{v.key}</div>
          <div className="basis-1/2- text-right">
            {v.info ? `(${v.info}%) ` : ""}
            <Harga harga={v.val} />
          </div>
        </div>
      ))}
    </div>
  );
};
