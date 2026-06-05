import { getDateFId, getTime } from "./date";

/**
 * Centralized date column configuration and utilities
 * Prevents duplication between rendering and sorting logic
 */

// Map column keys to their actual data fields
const DATE_COLUMN_MAP = {
  creationdate: { dataField: "created_at", fallback: "creationdate" },
  lastupdate: { dataField: "updated_at", fallback: "lastupdate" },
  created_at: { dataField: "created_at" },
  updated_at: { dataField: "updated_at" },
};

/**
 * Get the actual date value from an item for a given column key
 */
export const getDateFieldValue = (item, columnKey) => {
  const config = DATE_COLUMN_MAP[columnKey];
  if (!config) return null;
  return item[config.dataField] || item[config.fallback];
};

/**
 * Check if a column key is a date-based column
 */
export const isDateColumn = (columnKey) => {
  return columnKey in DATE_COLUMN_MAP;
};

/**
 * Format date for display in table (rendering)
 */
export const renderDateTimeComp = (date) => {
  if (!date) return "";
  return `${getDateFId(date)} ${getTime(date)}`;
};

/**
 * Format date for sorting comparison (returns comparable value)
 */
export const formatDateForSort = (date) => {
  if (!date) return "";
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : String(date);
};

/**
 * Get sort value for a date column
 */
export const getDateColumnSortValue = (item, columnKey) => {
  const dateValue = getDateFieldValue(item, columnKey);
  return formatDateForSort(dateValue);
};
