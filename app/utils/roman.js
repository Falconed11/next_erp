const convertToRoman = (num) => {
  if (num <= 0 || num > 3999) {
    return "Invalid number for Roman numeral conversion";
  }
  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];
  let result = "";
  for (const numeral of romanNumerals) {
    while (num >= numeral.value) {
      result += numeral.numeral;
      num -= numeral.value;
    }
  }
  return result;
};
module.exports = { convertToRoman };
