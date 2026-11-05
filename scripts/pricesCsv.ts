/**
 * Freezed — shared bits for the price scripts
 *
 * `prices-template.ts` writes the CSV, `prices-import.ts` reads it back. Both
 * agree on the columns and file locations defined here.
 */

import path from 'node:path';

export const ROOT = path.resolve(__dirname, '..');
export const TEMPLATE_PATH = path.join(ROOT, 'data', 'prices-template.csv');
export const PRICES_JSON_PATH = path.join(ROOT, 'data', 'prices.json');

/** How old a check date can get before the import report flags it. */
export const STALE_AFTER_DAYS = 14;

export const COLUMNS = [
  'itemId',
  'brand',
  'name',
  'retailerId',
  'region',
  'currency',
  'price',
  'priceFrom',
  'checkedAt',
  'sourceUrl',
  'url',
] as const;

export type Column = (typeof COLUMNS)[number];
export type CsvRow = Record<Column, string>;

const needsQuoting = (value: string) => /[",\r\n]/.test(value) || value !== value.trim();

const quote = (value: string) => (needsQuoting(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** RFC 4180 CSV with a UTF-8 BOM so Excel shows `Völkl` and `—` correctly. */
export const toCsv = (rows: string[][]): string => `﻿${rows.map((row) => row.map(quote).join(',')).join('\r\n')}\r\n`;

/**
 * Minimal RFC 4180 parser: quoted fields, escaped quotes, commas and newlines
 * inside quotes, CRLF or LF line endings, optional BOM. Returns each record
 * with the 1-based line number it started on, for error messages.
 */
export const parseCsv = (text: string): { line: number; fields: string[] }[] => {
  const input = text.replace(/^﻿/, '');
  const records: { line: number; fields: string[] }[] = [];
  let fields: string[] = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        if (char === '\n') line += 1;
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      fields.push(field);
      records.push({ line: recordLine, fields });
      fields = [];
      field = '';
      line += 1;
      recordLine = line;
    } else {
      field += char;
    }
  }
  if (field !== '' || fields.length > 0) {
    fields.push(field);
    records.push({ line: recordLine, fields });
  }
  // Spreadsheet apps often append blank lines.
  return records.filter((record) => record.fields.some((value) => value.trim() !== ''));
};

/** Today's date as `YYYY-MM-DD` in local time. */
export const todayIso = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Whole days between two `YYYY-MM-DD` dates (`later - earlier`). */
export const daysBetween = (earlier: string, later: string): number =>
  Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / 86_400_000);
