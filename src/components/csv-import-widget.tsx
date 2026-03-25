"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";

type ColumnMapping = {
  title: string;
  platform: string;
  status: string;
  playtimeHours: string;
  notes: string;
  externalId: string;
};

const fieldOptions: Array<{
  key: keyof ColumnMapping;
  label: string;
  required?: boolean;
}> = [
  { key: "title", label: "Title", required: true },
  { key: "platform", label: "Platform" },
  { key: "status", label: "Status" },
  { key: "playtimeHours", label: "Hours Played" },
  { key: "notes", label: "Notes" },
  { key: "externalId", label: "External ID" },
];

function createInitialMapping(headers: string[]): ColumnMapping {
  const lowerHeaders = headers.map((header) => header.toLowerCase());
  const findHeader = (patterns: string[]) => {
    const index = lowerHeaders.findIndex((header) =>
      patterns.some((pattern) => header.includes(pattern)),
    );
    return index >= 0 ? headers[index] : "";
  };

  return {
    title: findHeader(["title", "name", "game"]),
    platform: findHeader(["platform", "store"]),
    status: findHeader(["status", "state"]),
    playtimeHours: findHeader(["hours", "playtime"]),
    notes: findHeader(["note", "review", "comment"]),
    externalId: findHeader(["id", "appid"]),
  };
}

export function CsvImportWidget({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    title: "",
    platform: "",
    status: "",
    playtimeHours: "",
    notes: "",
    externalId: "",
  });
  const [error, setError] = useState("");

  const previewRows = useMemo(() => {
    if (!rows.length || !mapping.title) {
      return [];
    }

    return rows
      .slice(0, 5)
      .map((row) => ({
        title: row[mapping.title] ?? "",
        platform: mapping.platform ? row[mapping.platform] ?? "" : "",
        status: mapping.status ? row[mapping.status] ?? "" : "owned",
        playtimeHours: mapping.playtimeHours
          ? row[mapping.playtimeHours] ?? ""
          : "",
      }))
      .filter((row) => row.title.trim().length > 0);
  }, [mapping, rows]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const text = await selectedFile.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length) {
      setError(parsed.errors[0]?.message ?? "Could not parse CSV.");
      setHeaders([]);
      setRows([]);
      setCsvText("");
      return;
    }

    const nextHeaders = parsed.meta.fields ?? [];
    setError("");
    setFileName(selectedFile.name);
    setCsvText(text);
    setHeaders(nextHeaders);
    setRows(parsed.data.slice(0, 25));
    setMapping(createInitialMapping(nextHeaders));
  }

  return (
    <div className="grid gap-[18px]">
      {/* File upload zone */}
      <div className="p-[18px] border-2 border-dashed border-ink/35 rounded-[24px] bg-white/60">
        <label className="block mb-3 font-bold" htmlFor="csv-upload">
          Drop in a CSV export
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="w-full file:mr-3 file:px-4 file:py-2 file:border-3 file:border-ink file:rounded-pill file:bg-yellow file:font-bold file:cursor-pointer hover:file:bg-peach file:transition-colors"
        />
        <p className="text-ink/70 mt-2 text-sm leading-relaxed">
          Supports generic exports. We will map your columns before import.
        </p>
      </div>

      {/* Error display */}
      {error ? (
        <p className="text-[#9b1f00] font-bold" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {/* Column mapping + preview + submit */}
      {headers.length ? (
        <form action={action} className="grid gap-[18px]">
          <input type="hidden" name="fileName" value={fileName} />
          <input type="hidden" name="csvText" value={csvText} />
          <input type="hidden" name="mapping" value={JSON.stringify(mapping)} />

          <div className="grid grid-cols-2 gap-3.5 max-lg:grid-cols-1">
            {fieldOptions.map((field) => (
              <label className="grid gap-2" key={field.key}>
                <span className="font-medium">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <select
                  value={mapping[field.key]}
                  aria-required={field.required ? "true" : undefined}
                  onChange={(event) =>
                    setMapping((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="min-h-11 px-3 border-3 border-ink rounded-[16px] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                >
                  <option value="">Not mapped</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="grid gap-2.5" aria-live="polite">
            <div className="section-label">Preview</div>
            {previewRows.length ? (
              previewRows.map((row, index) => (
                <div
                  className="grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] items-center gap-3.5 border-3 border-ink rounded-[24px] p-5 bg-white shadow-hard-sm"
                  key={`${row.title}-${index}`}
                >
                  <strong>{row.title}</strong>
                  <span>{row.platform || "Unknown platform"}</span>
                  <span>{row.status || "owned"}</span>
                  <span>{row.playtimeHours || "0"}h</span>
                </div>
              ))
            ) : (
              <p className="text-ink/70 leading-relaxed">
                Map the title column to preview the normalized rows.
              </p>
            )}
          </div>

          <button
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:translate-x-0"
            type="submit"
            disabled={!mapping.title || !csvText}
          >
            Import catalog data
          </button>
        </form>
      ) : null}
    </div>
  );
}
