const fs = require('fs');
const path = require('path');

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function detectColumns(records) {
  const cols = new Set();
  for (const r of records) {
    if (!r || typeof r !== 'object') continue;
    for (const k of Object.keys(r)) cols.add(k);
  }
  return Array.from(cols);
}

function normalizeRecord(doc) {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject({ depopulate: true }) : doc;
  if (!obj || typeof obj !== 'object') return obj;

  // Convert MongoDB ids to strings
  if (obj._id && typeof obj._id !== 'string') obj._id = obj._id.toString();

  // Convert nested ObjectId to string if possible (best-effort)
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && typeof v.toString === 'function' && k.toLowerCase().includes('id')) {
      obj[k] = v.toString();
    }
  }

  // Move arrays/objects to JSON strings so CSV stays 1 cell per value
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) || (v && typeof v === 'object' && !(v instanceof Date))) {
      obj[k] = v instanceof Date ? v.toISOString() : JSON.stringify(v);
    } else if (v instanceof Date) {
      obj[k] = v.toISOString();
    }
  }

  return obj;
}

async function exportCollectionToCSV({ Model, collectionName, outDir, limit }) {
  const raw = await Model.find({}).limit(limit ?? 100000).lean();
  const records = raw.map(normalizeRecord);
  const columns = detectColumns(records);

  // Ensure outDir exists
  fs.mkdirSync(outDir, { recursive: true });

  const header = columns.map(csvEscape).join(',');
  const lines = records.map((r) => columns.map((c) => csvEscape(r?.[c])).join(','));

  const csv = [header, ...lines].join('\n');

  const filePath = path.join(outDir, `${collectionName}.csv`);
  fs.writeFileSync(filePath, csv, 'utf8');
  return filePath;
}

function getDefaultExportsDir(projectRoot) {
  return path.join(projectRoot, 'exports');
}

module.exports = {
  exportCollectionToCSV,
  getDefaultExportsDir,
};

