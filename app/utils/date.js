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

module.exports = { getDate, getDateF, getDateFId };
