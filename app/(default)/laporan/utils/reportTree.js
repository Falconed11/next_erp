export const createInitialReportForm = () => ({
  laporan: "",
  id_laporan: null,
  id_perusahaan: null,
  startDate: null,
  endDate: null,
  reportType: "simple",
});

export const addDays = (date, days) => {
  if (!date) return null;

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const normalizeReportResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return {
      tree: payload,
      summary: null,
    };
  }

  if (payload && typeof payload === "object") {
    return {
      tree: Array.isArray(payload.tree) ? payload.tree : [],
      summary: payload,
    };
  }

  return {
    tree: [],
    summary: null,
  };
};

export const buildReportTree = (response) => {
  const { tree: rows } = normalizeReportResponse(response);
  if (!Array.isArray(rows)) return [];

  const normalizedRows = rows.map((row, index) => ({
    ...row,
    id: row.id,
    id_parent: row.id_parent,
    nama: row.nama,
    level: row.level ?? 0,
    total_balance: Number(row.total_balance ?? 0),
    orderIndex: index,
  }));

  const availableIds = new Set(normalizedRows.map((row) => row.id));

  const childrenByParent = normalizedRows.reduce((acc, row) => {
    const key = row.id_parent ?? "root";
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(row);
    return acc;
  }, new Map());

  const buildTree = (parentId) =>
    (childrenByParent.get(parentId) ?? [])
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((row) => ({
        ...row,
        children: buildTree(row.id),
      }));

  return normalizedRows
    .filter((row) => row.id_parent == null || !availableIds.has(row.id_parent))
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((row) => ({
      ...row,
      children: buildTree(row.id),
    }));
};

export const formatActionTimestamp = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(value);
};
