import { capitalizeEachWord } from "@/app/utils/tools";
import {
  renderDateTimeComp,
  getDateColumnSortValue,
} from "@/app/utils/dateColumns";

// Column handlers provide a single source for render and sort logic.
// Each handler can be either:
// - a function (legacy) used for rendering; or
// - an object { render: fn, sortValue: fn }

export const columnHandlers = {
  nama: {
    render: (val) => capitalizeEachWord(val),
    sortValue: (item) => {
      const v = capitalizeEachWord(item?.nama || "") || "";
      return typeof v === "string" ? v.toLowerCase() : v;
    },
  },
  creationdate: {
    render: (val, item) => renderDateTimeComp(item?.created_at ?? val),
    sortValue: (item) => getDateColumnSortValue(item, "creationdate"),
  },
  lastupdate: {
    render: (val, item) => renderDateTimeComp(item?.updated_at ?? val),
    sortValue: (item) => getDateColumnSortValue(item, "lastupdate"),
  },
  created_at: {
    render: (val, item) => renderDateTimeComp(item?.created_at ?? val),
    sortValue: (item) => getDateColumnSortValue(item, "created_at"),
  },
  updated_at: {
    render: (val, item) => renderDateTimeComp(item?.updated_at ?? val),
    sortValue: (item) => getDateColumnSortValue(item, "updated_at"),
  },
};

export default columnHandlers;
