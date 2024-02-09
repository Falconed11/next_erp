"use client";
import { useClientFetchNoInterval } from "@/app/utils/apiconfig";
import Harga from "@/components/harga";
import { getMonthYearFId } from "@/app/utils/date";

export default function App() {
  const kategori = useClientFetchNoInterval("kategorioperasionalkantor");
  if (kategori.error) return <div>failed to load</div>;
  if (kategori.isLoading) return <div>loading...</div>;
  return (
    <>
      <LaporanLR kategori={kategori.data} monthyear={"01-2024"} />
    </>
  );
}

const LaporanLR = ({ kategori, monthyear }) => {
  const operasional = useClientFetchNoInterval(
    `totalOperasional?monthyear=${monthyear}`
  );
  const pendapatan = useClientFetchNoInterval(
    `totalpembayaranproyek?monthyear=${monthyear}`
  );
  const biayaProduksi = useClientFetchNoInterval(
    `pengeluaranproyek?monthyear=${monthyear}`
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
  );
};
