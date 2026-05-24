const SHEET_ID = "1GPIzJZTPB2URv-63fZMEXaBKCsHiaf09x6-xvRyFAUE";

// Converts a gviz cell value to a plain string.
// Handles date cells (e.g. Date(2024,4,15)) by preferring the formatted value.
function parseCell(cell: { v: unknown; f?: string } | null): string {
  if (cell == null || cell.v == null) return "";
  if (typeof cell.v === "string" && cell.v.startsWith("Date(")) {
    if (cell.f) return cell.f;
    const m = cell.v.match(/Date\((\d+),(\d+),(\d+)/);
    if (m) return new Date(+m[1], +m[2], +m[3]).toISOString().slice(0, 10);
  }
  return String(cell.v);
}

export async function fetchSheet(tabName: string): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${tabName}`);
  const text = await res.text();
  // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const json = text.replace(/^[^{]*/, "").replace(/\);?\s*$/, "");
  const parsed = JSON.parse(json);
  const rows: { c: ({ v: unknown; f?: string } | null)[] }[] = parsed.table.rows ?? [];
  if (rows.length === 0) return [];

  let cols: string[];
  let dataRows: typeof rows;
  if ((parsed.table.parsedNumHeaders ?? 0) >= 1) {
    // Headers were auto-detected — col labels are correct, all rows are data.
    cols = parsed.table.cols.map((c: { label: string }) => c.label);
    dataRows = rows;
  } else {
    // No header detection — first row contains the header values.
    cols = (rows[0].c ?? []).map(cell => parseCell(cell));
    dataRows = rows.slice(1);
  }

  return dataRows.map(row => {
    const obj: Record<string, string> = {};
    (row.c ?? []).forEach((cell, i) => {
      if (cols[i]) obj[cols[i]] = parseCell(cell);
    });
    return obj;
  });
}
