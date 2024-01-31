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

function getMonthYearFId(monthyear) {
  // Split the input string into parts
  const [month, year] = monthyear.split("-");

  // Create a Date object with the extracted month and year
  const date = new Date(`${month}-01-${year}`);

  const monthName = monthNamesIndonesian[date.getMonth()];

  // Construct the final output string
  const outputString = `${monthName} ${year}`;

  return outputString;
}

module.exports = { getDate, getDateF, getDateFId, getMonthYearFId };
