import { useClientFetch } from "@/app/utils/apiconfig";
import { Select, SelectItem } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { Input } from "@heroui/react";

const FilterProduk = ({
  id,
  setId,
  nama,
  setNama,
  selectKategori,
  setSelectKategori,
  page,
  setPage,
  isReadyStock,
  setIsReadyStock,
  kategori,
}) => {
  return (
    <>
      <div>Filter</div>
      <div className="flex gap-3">
        <Checkbox
          isSelected={isReadyStock}
          onValueChange={(v) => {
            setIsReadyStock(v);
            setPage(1);
          }}
        >
          Stok Siap
        </Checkbox>
        <Select
          label="Kategori"
          variant="bordered"
          placeholder="Pilih kategori!"
          selectedKeys={selectKategori}
          className="max-w-xs"
          onSelectionChange={(v) => {
            setSelectKategori(v);
            setPage(1);
          }}
        >
          {kategori.data.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {`${item.nama}`}
            </SelectItem>
          ))}
        </Select>
        <Input
          isClearable
          type="text"
          label="Produk"
          placeholder="Cari produk"
          className="max-w-xs"
          value={nama}
          onValueChange={(v) => {
            setNama(v);
            setPage(1);
          }}
        />
        <Input
          isClearable
          type="text"
          label="Id"
          placeholder="Masukkan id!"
          className="max-w-xs"
          value={id}
          onValueChange={(v) => {
            setId(v);
            setNama(nama);
            setSelectKategori(selectKategori);
            setPage(1);
          }}
        />
      </div>
    </>
  );
};

export { FilterProduk };
