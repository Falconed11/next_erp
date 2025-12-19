"use client";
import { getCurFirstLastDay } from "@/app/utils/date";
import { Penawaran, OperasionalKantor } from "@/components/laporan";
import { StatusToDoList, ToDoList } from "@/components/mycomponent";
import { useSession } from "next-auth/react";

import "react-datepicker/dist/react-datepicker.css";
import { highRoleCheck, renderQueryStates } from "../utils/tools";

export default function App() {
  const session = useSession();
  const sessionuser = session?.data?.user;
  const queryStates = renderQueryStates({}, session);
  if (queryStates) return queryStates;
  const isHighRole = highRoleCheck(sessionuser.rank);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const nextMonthFirstDay = new Date(
    currentDate.getFullYear(),
    currentMonth + 1,
    1
  );
  const currentMonthFirstDay = new Date(
    currentDate.getFullYear(),
    currentMonth,
    1
  );
  const lastDayOfCurrentMonth = new Date(nextMonthFirstDay - 1);
  const firstDayOfCurrentMonth = new Date(currentMonthFirstDay);
  const [startDate, endDate] = getCurFirstLastDay();

  return (
    <div className="flex flex-row gap-3">
      {/* penawaran */}
      <div>
        <div className="bg-white p-3 rounded-lg">
          <Penawaran
            start={firstDayOfCurrentMonth}
            end={lastDayOfCurrentMonth}
          />
        </div>
      </div>
      {/* operasional kantor */}
      {isHighRole && (
        <div className="bg-white p-3 rounded-lg">
          <OperasionalKantor startDate={startDate} endDate={endDate} />
        </div>
      )}
      <ToDoList />
      <StatusToDoList />
    </div>
  );
}
