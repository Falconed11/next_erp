import { capitalizeEachWord } from "@/app/utils/tools";
import { Tooltip } from "@heroui/react";
import { DangerTriangleBrokenIcon } from "./icon";

const BadgeStatusProyek = ({ idStatusProyek, data, versi }) => {
  return idStatusProyek == -1 ? (
    <span className="p-2 rounded-sm bg-red-600 text-white font-bold">
      Reject
    </span>
  ) : idStatusProyek == 1 ? (
    !data.jumlahbarangkeluar ? (
      <span className="p-2 rounded-sm bg-blue-500 shadow-lg text-white font-bold">
        {capitalizeEachWord(data.statusproyek)}
      </span>
    ) : versi ? (
      "Selesai"
    ) : (
      <Tooltip color="warning" content="Proyek Berjalan. Penawaran belum deal.">
        <div
          // onClick={() => editButtonPress(data)}
          className="text-4xl text-warning cursor-help active:opacity-50 text-center"
        >
          <DangerTriangleBrokenIcon />
        </div>
      </Tooltip>
    )
  ) : data.progress == 100 ? (
    <span
      className={`p-2 rounded-sm shadow-lg bg-green-500 text-white font-bold`}
    >
      {capitalizeEachWord(data.statusproyek)}
    </span>
  ) : data.jumlahbarangkeluar > 0 ? (
    <Tooltip color="warning" content="Proyek Berjalan. Belum ada penawaran.">
      <div
        // onClick={() => editButtonPress(data)}
        className="text-4xl text-warning cursor-help active:opacity-50 text-center"
      >
        <DangerTriangleBrokenIcon />
      </div>
    </Tooltip>
  ) : (
    <span
      className={`p-2 rounded-sm shadow-lg bg-secondary text-white font-bold`}
    >
      {capitalizeEachWord(data.statusproyek)}
    </span>
  );
};

export { BadgeStatusProyek };
