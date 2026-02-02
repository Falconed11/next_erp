"use client";
import { useClientFetch } from "@/hooks/useClientFetch";
import Harga from "@/components/harga";
import {
  getDateFId,
  getMonthsInRange,
  getMonthYearFId,
} from "@/app/utils/date";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@heroui/react";

export default function App() {
  const kategori = useClientFetch("kategorioperasionalkantor");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  const months = getMonthsInRange(startDate, endDate);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        Selected months : {months.map((month) => getDateFId(month)).join(", ")}
      </div>
      <div>
        <div className="flex">
          <RangeMonthPicker
            currentStartDate={startDate}
            setCurrentStartDate={setStartDate}
            currentEndDate={endDate}
            setCurrentEndDate={setEndDate}
          />
        </div>
      </div>
      <LaporanLR kategori={kategori.data} monthyear={"01-2024"} />
    </div>
  );
}

const LaporanLR = ({ kategori, monthyear }) => {
  const operasional = useClientFetch(`totalOperasional?monthyear=${monthyear}`);
  const pendapatan = useClientFetch(
    `totalpembayaranproyek?monthyear=${monthyear}`,
  );
  const biayaProduksi = useClientFetch(
    `pengeluaranproyek?monthyear=${monthyear}`,
  );
  if (operasional.error) return <div>failed to load</div>;
  if (operasional.isLoading) return <div>loading...</div>;
  if (pendapatan.error) return <div>failed to load</div>;
  if (pendapatan.isLoading) return <div>loading...</div>;
  if (biayaProduksi.error) return <div>failed to load</div>;
  if (biayaProduksi.isLoading) return <div>loading...</div>;
  const totalBiayaProduksi = biayaProduksi.data.reduce((total, v) => {
    return (total += v.hargakustom ? v.hargakustom : v.hargamodal);
  }, 0);
  const totalOperasional = operasional.data.reduce((total, v) => {
    return (total += v.biaya ? parseInt(v.biaya) : 0);
  }, 0);
  const totalBiaya = totalBiayaProduksi + totalOperasional;
  const labaRugiSebelumPajak = pendapatan.data[0].total - totalBiaya;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col bg-white rounded-lg p-3">
        <div className="">Periode {getMonthYearFId(monthyear)}</div>
        <div className="flex flex-row gap-3">
          <div className="flex-col">
            <div>Keterangan</div>
            {kategori.map((v) => {
              return <div key={v.id}>{v.nama}</div>;
            })}
            <div>Biaya Produksi</div>
            <div>Jumlah Biaya</div>
            <div>Pendapatan</div>
            <div>Laba/Rugi Sebelum Pajak</div>
          </div>
          <div>Jumlah</div>
          <div className="flex-col">
            <div>Saldo</div>
            <div className="text-right">
              {operasional.data.map((v) => {
                return (
                  <div key={v.id}>
                    <Harga harga={parseInt(v.biaya ? v.biaya : 0)} />
                  </div>
                );
              })}
            </div>
            <div>
              <Harga harga={totalBiayaProduksi} />
            </div>
            <div>
              <Harga harga={totalBiaya} />
            </div>
            <div>
              <Harga harga={parseInt(pendapatan.data[0].total)} />
            </div>
            <div>
              <Harga harga={labaRugiSebelumPajak} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RangeMonthPicker = ({
  currentStartDate = new Date(),
  currentEndDate = new Date(),
  setCurrentStartDate,
  setCurrentEndDate,
}) => {
  const [startDate, setStartDate] = useState(new Date(currentStartDate));
  const [endDate, setEndDate] = useState(new Date(currentEndDate));
  const sDatePicker = "px-1 rounded-lg shadow-md border-gray-200 border";
  console.log({ startDate, currentStartDate, endDate, currentEndDate });
  return (
    <div className="flex flex-col gap-2 bg-white p-2 rounded-lg">
      <div className="font-bold">Pilih Periode Bulan!</div>
      {/* <div>{new Date(currentStartDate)?.toString()}</div>
      <div>{new Date(currentEndDate)?.toString()}</div> */}
      <DatePicker
        className={sDatePicker}
        selected={startDate}
        onChange={setStartDate}
        onSelect={(val) => {
          setStartDate(val);
          setCurrentStartDate(val);
        }}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="MM/yyyy"
        showMonthYearPicker
      />
      <DatePicker
        className={sDatePicker}
        selected={endDate}
        onChange={setEndDate}
        onSelect={(val) => {
          setEndDate(val);
          setCurrentEndDate(val);
        }}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        dateFormat="MM/yyyy"
        showMonthYearPicker
      />
      <div className="text-end">
        <Button
          color="primary"
          isDisabled={
            startDate.getTime() === currentStartDate?.getTime() &&
            endDate.getTime() === currentEndDate?.getTime()
          }
          onPress={() => {
            setCurrentStartDate(startDate);
            setCurrentEndDate(endDate);
          }}
        >
          Cari
        </Button>
      </div>
    </div>
  );
};
