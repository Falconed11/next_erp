const sampleData = {
  success: true,
  message: "Success",
  data: [
    {
      id: 1,
      id_parent: null,
      nama: "Rugi Laba",
      level: 0,
      total_balance: "6000.00",
    },
    {
      id: 2,
      id_parent: 1,
      nama: "Gross Provit",
      level: 1,
      total_balance: "-6000.00",
    },
    {
      id: 3,
      id_parent: 2,
      nama: "Pendapatan",
      level: 2,
      total_balance: "-6000.00",
    },
    {
      id: 4,
      id_parent: 3,
      nama: "tes",
      level: 3,
      total_balance: "6000.00",
    },
  ],
};

const sampleFullData = {
  success: true,
  message: "Success",
  data: {
    past: 0,
    end: 6000,
    tree: [
      {
        id: 1,
        id_parent: null,
        nama: "Rugi Laba",
        level: 0,
        total_balance: "6000.00",
      },
      {
        id: 2,
        id_parent: 1,
        nama: "Gross Provit",
        level: 1,
        total_balance: "-6000.00",
      },
      {
        id: 3,
        id_parent: 2,
        nama: "Pendapatan",
        level: 2,
        total_balance: "-6000.00",
      },
      {
        id: 4,
        id_parent: 3,
        nama: "tes",
        level: 3,
        total_balance: "6000.00",
      },
    ],
  },
};
