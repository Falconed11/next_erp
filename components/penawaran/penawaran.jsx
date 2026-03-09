import { useSession } from "next-auth/react";
import { useState } from "react";
import TambahProduk from "../tambahproduk";
import { Button, Input, NumberInput, Select, SelectItem } from "@heroui/react";
import {
  countPercentProvit,
  countPriceByPercentProfit,
} from "@/app/utils/formula";
import { key2set, renderQueryStates, set2key } from "@/app/utils/tools";
import { useClientFetch } from "@/hooks/useClientFetch";
import { API_PATH } from "@/app/utils/apiconfig";

export const TambahProdukPenawaran = ({
  idProyek,
  isHighRole,
  instalasi,
  mutateKeranjang,
  versi,
}) => {
  const session = useSession();
  const { user: sessUser } = session?.data;
  const rank = sessUser?.rank;
  const [form, setForm] = useState({});
  const tambahButtonPress = async () => {
    const jumlah = form.jumlah;
    if (!form.selectProduk && !form.produk)
      return alert("Silahkan pilih produk");
    if (!jumlah) return alert("Jumlah belum diisi");
    const res = await fetch(`${API_PATH}keranjangproyek`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({
        ...form,
        id_proyek: idProyek,
        versi,
        tanggal: null,
        stok: 0, //
        instalasi,
      }),
    });
    const json = await res.json();
    if (res.status == 400) return alert(json.message);
    const newForm = { namakustom: "" };
    setForm(newForm);
    mutateKeranjang();
  };
  // const QueryState = renderQueryStates({}, session);
  // if (QueryState) return QueryState;
  const hideComponent = isHighRole ? "" : "hidden";
  const defStyleFormWidth = "w-2/12";
  return (
    <>
      <div className={`flex gap-2`}>
        <TambahProduk
          form={form}
          setForm={setForm}
          disableStok
          disableVendor
          rank={rank}
          customInput={
            <>
              <NumberInput
                hideStepper
                isWheelDisabled
                formatOptions={{
                  useGrouping: false,
                }}
                className={`${defStyleFormWidth} ${hideComponent}`}
                value={form.harga - form.hargamodal || ""}
                label={"Provit"}
                placeholder="Masukkan provit!"
                onValueChange={(v) => {
                  setForm({
                    ...form,
                    harga: form.hargamodal + v || "",
                  });
                }}
              />
              <NumberInput
                hideStepper
                isWheelDisabled
                formatOptions={{
                  useGrouping: false,
                }}
                className={`${defStyleFormWidth} ${hideComponent}`}
                value={
                  Math.round(
                    countPercentProvit(form.hargamodal, form.harga) * 100,
                  ) / 100 || ""
                }
                label={"Provit (%)"}
                placeholder="Masukkan provit %!"
                onValueChange={(v) => {
                  setForm({
                    ...form,
                    harga:
                      Math.round(
                        countPriceByPercentProfit(form.hargamodal, v),
                      ) || "",
                  });
                }}
              />
              <Input
                type="text"
                value={form.namakustom}
                label="Nama Kustom"
                placeholder="Masukkan nama kustom! (Opsional)"
                // placeholder="Masukkan jumlah!"
                className={`${defStyleFormWidth}`}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    namakustom: v,
                  })
                }
              />
              <SelectSubProyek
                classNames={defStyleFormWidth}
                proyek={idProyek}
                form={form}
                setForm={setForm}
              />
            </>
          }
        />
      </div>
      <div>
        <Button
          onPress={() => {
            tambahButtonPress(form, setForm);
          }}
          color="primary"
        >
          Tambah
        </Button>
      </div>
    </>
  );
};

export const SelectSubProyek = ({
  classNames = "",
  idProyek,
  form,
  setForm,
}) => {
  const subProyek = useClientFetch(`subproyek?id_proyek=${idProyek}`);
  const queryStates = renderQueryStates({ subProyek });
  if (queryStates) return queryStates;
  return (
    <Select
      className={classNames}
      label="Sub Proyek"
      placeholder="Pilih subproyek! (Opsional)"
      selectedKeys={key2set(form.id_subproyek)}
      onSelectionChange={(v) => {
        setForm({
          ...form,
          id_subproyek: set2key(v),
        });
      }}
    >
      {subProyek.data.map((item) => (
        <SelectItem key={item.id} value={item.id}>
          {item.nama}
        </SelectItem>
      ))}
    </Select>
  );
};

const Penawaran = ({ proyek }) => {
  return (
    <Modal
      scrollBehavior="inside"
      size="4xl"
      isOpen={modal.penawaran.isOpen}
      onOpenChange={modal.penawaran.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Penawaran</ModalHeader>
            <ModalBody>
              <div
                ref={componentRef.penawaran}
                className="bg-white text-black overflow-x-hidden"
              >
                {/* Watermark */}
                {/* <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-10 z-50">
                    <span className="text-[20vw] font-bold rotate-[-30deg] whitespace-nowrap">
                      Draft
                    </span>
                  </div> */}
                {/* {Logo} */}
                {proyek.logoperusahaan ? (
                  <div className="flex flex-row items-center">
                    <Image
                      src={proyek.logoperusahaan || null}
                      alt="Company Logo"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col pl-2 text-xs">
                      <CompanyHeader
                        titleClassname="text-bold text-base"
                        name={proyek.namaperusahaan}
                        description={proyek.deskripsiperusahaan}
                        address={proyek.alamatperusahaan}
                        contact={proyek.kontakperusahaan}
                      />
                    </div>
                  </div>
                ) : (
                  "Perusahaan Belum Dipilih"
                )}
                <Divider className="bg-sky-500 my-1 py-1" />
                {/* <hr className="my-3 bg-sky-500 h-5" /> */}
                <div className="pt-1 text-xs">
                  <div className="flex">
                    <div className="w-1/2">
                      <div>Kepada Yth,</div>
                      <div>{proyek.klien}</div>
                      <div>{proyek.instansi}</div>
                      <div>{proyek.kota}</div>
                    </div>
                    <div className="w-1/2 text-right">
                      <div>
                        Yogyakarta,{" "}
                        {getDateFId(new Date(proyek.tanggal_penawaran))}
                      </div>
                      <div>
                        No :{" "}
                        {penawaran(
                          proyek.id_penawaran,
                          new Date(proyek.tanggal_penawaran),
                          proyek.id_karyawan,
                        )}
                        {/* /{selectedVersion} */}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1">Dengan Hormat,</div>
                  <div>
                    Sehubungan dengan adanya permintaan Bapak/Ibu, bersama ini
                    kami sampaikan penawaran harga/RAB di {proyek.instansi}{" "}
                    {proyek.kota}
                  </div>
                </div>
                {/* peralatan */}
                {dataPenawaran.length > 0 ? (
                  <Table
                    isStriped
                    topContentPlacement="outside"
                    className="border text-xs py-0 my-0"
                    classNames={formatTable}
                    aria-label="Example table with custom cells"
                    shadow="none"
                    topContent={<div className="py-0 my-0">Peralatan</div>}
                    bottomContent={compRekapPeralatan}
                  >
                    <TableHeader className="my-0 py-0" columns={col.penawaran}>
                      {(column) => (
                        <TableColumn className="py-0 my-0" key={column.key}>
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={result}>
                      {(item) => (
                        <TableRow key={item.no}>
                          {(columnKey) => (
                            <TableCell>
                              {renderCell.penawaran(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <></>
                )}
                {/* instalasi */}
                {dataInstalasi.length > 0 ? (
                  <Table
                    isStriped
                    radius="none"
                    topContentPlacement="outside"
                    className="mt-0 border text-xs my-0 py-0"
                    classNames={formatTable}
                    aria-label="Example table with custom cells"
                    shadow="none"
                    topContent={<>Instalasi</>}
                    bottomContent={compRekapInstalasi}
                  >
                    <TableHeader columns={col.penawaran}>
                      {(column) => (
                        <TableColumn key={column.key}>
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={resultInstalasi}>
                      {(item) => (
                        <TableRow key={item.no}>
                          {(columnKey) => (
                            <TableCell>
                              {renderCell.penawaran(item, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <></>
                )}
                {
                  /* Rekapitulasi */
                  <div className="mt-0 border no-break text-xs">
                    {compRekapTotal}
                  </div>
                }
                {/* keterangan */}
                <div className="flex flex-col mt-3 text-xs">
                  <div className="no-break pb-1">
                    Keterangan <br />
                    {dataInstalasi.length < 1 ? (
                      <>
                        - Harga belum termasuk instalasi pemasangan. <br />
                      </>
                    ) : (
                      ""
                    )}
                    {!!rekapPajak && (
                      <>
                        - Harga {keteranganPajak} termasuk pajak-pajak. <br />
                      </>
                    )}
                    - Syarat pembayaran sesuai dengan kesepakatan kedua belah
                    pihak. <br />- Waktu penyerahan barang sesuai jadwal yang
                    disepakati bersama. <br />- Harga tidak terikat dan dapat
                    berubah sewaktu-waktu.
                    {keteranganPenawaran.data.map((v) => {
                      if (v.id_proyek)
                        return <div key={v.id}>- {v.keterangan}</div>;
                    })}
                  </div>
                  <div className="no-break">
                    <div>
                      Demikian penawaran ini kami ajukan, sambil menantikan
                      pesanan Bapak/Ibu, kami ucapkan terima kasih.
                    </div>
                    <div className="pt-1">Hormat kami,</div>
                    <div>{proyek.data[0].namakaryawan}</div>
                    <div className="pt-1">
                      # Penawaran ini dikeluarkan secara otomatis oleh sistem
                      sehingga tidak memerlukan tanda-tangan.
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Tutup
              </Button>
              <Button onPress={handlePrintPenawaran} color="primary">
                Cetak
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
