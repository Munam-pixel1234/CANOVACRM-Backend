import fs from "fs";
import csv from "csv-parser";

/**
 * Parse CSV file and normalize data
 * Allowed columns:
 * Name, Email, Source, Date, Location, Language
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const name = row.Name || row.name;
        const email = row.Email || row.email;
        const language = row.Language || row.language;

        // ❗ Skip invalid rows
        if (!name || !email || !language) return;

        results.push({
          name: name.trim(),
          email: email.trim(),
          source: row.Source || row.source || "CSV",
          date: row.Date ? new Date(row.Date) : new Date(),
          location: (row.Location || row.location || "").trim(),

          // ✅ CRITICAL FIX: normalize language
          language: language.trim().toLowerCase(),
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

export default parseCSV;
