// const nominalToText = (number) => {
//   const nominal = [
//     "",
//     "Satu",
//     "Dua",
//     "Tiga",
//     "Empat",
//     "Lima",
//     "Enam",
//     "Tujuh",
//     "Delapan",
//     "Sembilan",
//   ];
//   const satuan = ["", "Ribu", "Juta", "Miliar", "Triliun"];

//   let result = "";

//   // Function to convert 3-digit numbers to text
//   function convertThreeDigit(num) {
//     let text = "";

//     if (num >= 100) {
//       text += nominal[Math.floor(num / 100)] + " Ratus ";
//       num %= 100;
//     }
//     if (num >= 10 && num <= 19) {
//       text += nominal[num - 10] + " Belas ";
//       num = 0;
//     } else if (num >= 20) {
//       text += nominal[Math.floor(num / 10)] + " Puluh ";
//       num %= 10;
//     }
//     if (num > 0) {
//       text += nominal[num] + " ";
//     }

//     return text;
//   }

//   // Convert the number to text
//   for (let i = 0; number > 0; i++) {
//     let chunk = number % 1000;
//     if (chunk > 0) {
//       result = convertThreeDigit(chunk) + satuan[i] + " " + result;
//     }
//     number = Math.floor(number / 1000);
//   }

//   return result.trim();
// };

const nominalToText = (number) => {
  if (number === 0) return "Nol";

  const nominal = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
  ];
  const satuan = ["", "Ribu", "Juta", "Miliar", "Triliun"];

  let result = "";

  function convertThreeDigit(num) {
    let text = "";

    if (num >= 100) {
      if (num >= 200) {
        text += nominal[Math.floor(num / 100)] + " Ratus ";
      } else {
        text += "Seratus ";
      }
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      if (num === 10) {
        text += "Sepuluh ";
      } else if (num === 11) {
        text += "Sebelas ";
      } else {
        text += nominal[num - 10] + " Belas ";
      }
      num = 0;
    } else if (num >= 20) {
      text += nominal[Math.floor(num / 10)] + " Puluh ";
      num %= 10;
    }
    if (num > 0) {
      text += nominal[num] + " ";
    }

    return text;
  }

  let chunkIndex = 0;
  while (number > 0) {
    let chunk = number % 1000;
    if (chunk > 0) {
      let chunkText = convertThreeDigit(chunk).trim();

      if (chunk === 1 && chunkIndex === 1) {
        result = "Seribu " + result;
      } else {
        result = chunkText + " " + satuan[chunkIndex] + " " + result;
      }
    }
    number = Math.floor(number / 1000);
    chunkIndex++;
  }

  return result.trim();
};

module.exports = { nominalToText };
