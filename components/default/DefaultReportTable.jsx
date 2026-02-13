import Harga from "@/components/harga";
import {
  getMonthsInRange,
  getYearMonth,
  monthNamesIndonesian,
} from "@/app/utils/date";
import { useState } from "react";
import { RangeMonthPicker } from "../input";
import { SelectPerusahaan } from "../perusahaan/perusahaan";
const CustomTDLabelValue = ({ label = "Label", value, valueStyle = "" }) => {
  return (
    <>
      <td className="font-bold">{label}</td>
      <td className="text-right pl-2">
        <Harga className={`text-blue-600 ${valueStyle}`} harga={value} />
      </td>
    </>
  );
};

export const ReportTableBody = ({ rows, cells, calculationRows, topRows }) => {
  const CustomTd = ({ className, children }) => (
    <td className={className}>{children}</td>
  );
  return (
    <>
      {topRows?.map((row, i) => (
        <tr key={i}>
          {row.map(({ style, cell }, i) => (
            <CustomTd className={style} key={i}>
              {cell}
            </CustomTd>
          ))}
        </tr>
      ))}
      {calculationRows?.map(({ label, value, valueStyle }, i) => (
        <tr key={i} className="text-nowrap">
          <CustomTDLabelValue
            label={label}
            value={value}
            valueStyle={valueStyle}
          />
        </tr>
      ))}
      {rows.map((row, i) => (
        <tr key={i} className={i % 2 == 0 ? "bg-gray-200" : ""}>
          {cells.map(({ style, renderCell }, i) => (
            <CustomTd className={style} key={i}>
              {renderCell(row)}
            </CustomTd>
          ))}
        </tr>
      ))}
    </>
  );
};

export const MonthlyReport = ({ renderReport }) => {
  const [form, setForm] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const months = getMonthsInRange(startDate, endDate);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <div className="flex flex-col gap-2 bg-white p-2 rounded-lg">
          <SelectPerusahaan form={form} setForm={setForm} />
          <RangeMonthPicker
            currentStartDate={startDate}
            setCurrentStartDate={setStartDate}
            currentEndDate={endDate}
            setCurrentEndDate={setEndDate}
          />
        </div>
      </div>
      <div className="flex gap-2">
        {months.map((month) => (
          <div key={month}>{renderReport(getYearMonth(month), form)}</div>
        ))}
      </div>
    </div>
  );
};

export const ReportTable = ({ yearMonth, children, topContent }) => {
  const [year, month] = yearMonth?.split("-") || [null, null];
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 ">
      {topContent || (
        <div className="font-bold">{`${monthNamesIndonesian[+month - 1]} ${year}`}</div>
      )}
      <table className="table-auto">
        <thead></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
