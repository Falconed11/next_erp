export const tableClassName = ``;
export const tableClassNames = {
  wrapper: "gap-0",
  table: "m-0 p-0 border-collapse ",
  //   thead: " bg-transparent [&>tr:last-child]:hidden",
  th: "",
  td: "py-0 align-top",
  tr: "",
  base: "",
};
export const buildTableClassNames = ({ customTd, sWrapper }) => ({
  wrapper: sWrapper,
  table: "border-collapse",
  //   thead: " bg-transparent [&>tr:last-child]:hidden",
  th: "",
  td: `py-0 align-top ${customTd}`,
  tr: "",
  base: "",
});
export const styleActionButton =
  "text-lg text-default-400 cursor-pointer active:opacity-50";
