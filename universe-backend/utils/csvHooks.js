const fs = require('fs');
const path = require('path');
const { exportCollectionToCSV, getDefaultExportsDir } = require('./exportToCSV');
const { csvEscape } = require('./userCsvEscape');

let wiringDone = false;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function attachHooks(models, options = {}) {
  if (wiringDone) return;
  wiringDone = true;

  const exportsDir = options.exportsDir || getDefaultExportsDir(process.cwd());
  const limit = options.limit;

  const modelEntries = [
    { name: 'users', Model: models.User },
    { name: 'courses', Model: models.Course },
    { name: 'attendance', Model: models.Attendance },
    { name: 'marks', Model: models.Marks },
    { name: 'exams', Model: models.Exam },
    { name: 'examResults', Model: models.ExamResult },
    { name: 'assignments', Model: models.Assignment },
    { name: 'fees', Model: models.Fee },
    { name: 'notices', Model: models.Notice },
    { name: 'departments', Model: models.Department },
  ].filter((x) => x.Model);

  for (const { name, Model } of modelEntries) {
    // Trigger after save
    Model.schema.post('save', async function () {
      await exportAffectedCollectionWithUserProjection(Model, name, exportsDir, limit);
    });

    // Trigger after updates
    Model.schema.post('findOneAndUpdate', async function () {
      await exportAffectedCollectionWithUserProjection(Model, name, exportsDir, limit);
    });

    Model.schema.post('updateOne', async function () {
      await exportAffectedCollectionWithUserProjection(Model, name, exportsDir, limit);
    });
  }
}

async function exportAffectedCollectionWithUserProjection(Model, name, exportsDir, limit) {
  try {
    ensureDir(exportsDir);

    // Special case: Users - do not export password
    if (Model.modelName === 'User') {
      const raw = await Model.find({})
        .select('-password')
        .limit(limit ?? 100000)
        .lean();

      const records = raw.map((d) => {
        if (d?._id && typeof d._id !== 'string') d._id = d._id.toString();
        for (const [k, v] of Object.entries(d)) {
          if (v instanceof Date) d[k] = v.toISOString();
          else if (Array.isArray(v)) d[k] = JSON.stringify(v);
          else if (v && typeof v === 'object' && !(v instanceof Date)) d[k] = JSON.stringify(v);
        }
        return d;
      });

      const columnsSet = new Set();
      for (const r of records) {
        if (!r || typeof r !== 'object') continue;
        for (const k of Object.keys(r)) columnsSet.add(k);
      }
      const columns = Array.from(columnsSet);

      const header = columns.map(csvEscape).join(',');
      const lines = records.map((r) => columns.map((c) => csvEscape(r?.[c])).join(','));
      const csv = [header, ...lines].join('\n');

      const filePath = path.join(exportsDir, `${name}.csv`);
      fs.writeFileSync(filePath, csv, 'utf8');
      return filePath;
    }

    // Default export for non-User collections
    return await exportCollectionToCSV({
      Model,
      collectionName: name,
      outDir: exportsDir,
      limit,
    });
  } catch (err) {
    console.error('[CSV export] failed for', name, err?.message || err);
  }
}

module.exports = { attachHooks };

