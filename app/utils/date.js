const monthNamesIndonesian = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getDate = (date) => {
  if (date === "0000-00-00") return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Note that months are zero-based
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateF = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Note that months are zero-based
  const day = date.getDate().toString().padStart(2, "0");
  return `${day}-${month}-${year}`;
};

const getDateFId = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthNameIndonesian = monthNamesIndonesian[month];
  const day = date.getDate();
  return `${day} ${monthNameIndonesian} ${year}`;
};

const getMonthYear = (date) => {
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let year = date.getFullYear();
  return `${month}-${year}`;
};

const getMonthYearFId = (monthyear) => {
  // Split the input string into parts
  const [month, year] = monthyear.split("-");

  // Create a Date object with the extracted month and year
  const date = new Date(`${month}-01-${year}`);

  const monthName = monthNamesIndonesian[date.getMonth()];

  // Construct the final output string
  const outputString = `${monthName} ${year}`;

  return outputString;
};

const getCurFirstLastDay = () => {
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
  return [firstDayOfCurrentMonth, lastDayOfCurrentMonth];
};

module.exports = {
  getDate,
  getDateF,
  getDateFId,
  getMonthYear,
  getMonthYearFId,
  getCurFirstLastDay,
};
