"use client";

import { useEffect, useMemo, useState } from "react";

type PipeType = "round" | "square";
type RoundLenUnit = "ft" | "m";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function clampNonNegative(n: number) {
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export default function PipeWeightPage() {
  const [pipeType, setPipeType] = useState<PipeType>("round");

  // Round (inches)
  const [odIn, setOdIn] = useState(""); // Outer diameter in inches
  const [thIn, setThIn] = useState(""); // Thickness in inches
  const [roundLen, setRoundLen] = useState(""); // length numeric
  const [roundLenUnit, setRoundLenUnit] = useState<RoundLenUnit>("ft");

  // Square (mm)
  const [sideMm, setSideMm] = useState("");
  const [thMm, setThMm] = useState("");
  const [sqLenM, setSqLenM] = useState("");

  // Reset fields when switching type (simple UX)
  useEffect(() => {
    if (pipeType === "round") {
      setSideMm("");
      setThMm("");
      setSqLenM("");
    } else {
      setOdIn("");
      setThIn("");
      setRoundLen("");
      setRoundLenUnit("ft");
    }
  }, [pipeType]);

  const round = useMemo(() => {
    const od = clampNonNegative(num(odIn));
    const t = clampNonNegative(num(thIn));
    const L = clampNonNegative(num(roundLen));

    // validate: OD must be > T and T > 0
    const validDims = Number.isFinite(od) && Number.isFinite(t) && t > 0 && od > t;

    if (!validDims) {
      return {
        ok: false,
        unitLabel: roundLenUnit === "ft" ? "kg/ft" : "kg/m",
        wPerUnit: NaN,
        total: NaN,
        note: "Enter OD and Thickness in inches. OD must be greater than Thickness.",
      };
    }

    // weight per unit
    const wPerUnit =
      roundLenUnit === "ft"
        ? 10.69 * (od - t) * t // kg/ft
        : 24.66 * (od - t) * t; // kg/m

    const hasLen = Number.isFinite(L) && L > 0;
    const total = hasLen ? wPerUnit * L : NaN;

    return {
      ok: true,
      unitLabel: roundLenUnit === "ft" ? "kg/ft" : "kg/m",
      wPerUnit,
      total,
      note: "Approx. steel weight based on a common industry formula.",
    };
  }, [odIn, thIn, roundLen, roundLenUnit]);

  const square = useMemo(() => {
    const S = clampNonNegative(num(sideMm));
    const t = clampNonNegative(num(thMm));
    const L = clampNonNegative(num(sqLenM));

    // validate: side must be > thickness and thickness > 0
    const validDims = Number.isFinite(S) && Number.isFinite(t) && t > 0 && S > t;

    if (!validDims) {
      return {
        ok: false,
        unitLabel: "kg/m",
        wPerUnit: NaN,
        total: NaN,
        note: "Enter Side and Thickness in mm. Side must be greater than Thickness.",
      };
    }

    // Weight (kg/m) = 4 × t × (S − t) × 7.85 / 1000
    // 7.85 = steel density, /1000 to convert g to kg (mm-based simplified formula)
    const wPerUnit = (4 * t * (S - t) * 7.85) / 1000;

    const hasLen = Number.isFinite(L) && L > 0;
    const total = hasLen ? wPerUnit * L : NaN;

    return {
      ok: true,
      unitLabel: "kg/m",
      wPerUnit,
      total,
      note: "Approx. steel weight (7.85 density factor).",
    };
  }, [sideMm, thMm, sqLenM]);

  const active = pipeType === "round" ? round : square;

  function resetAll() {
    setPipeType("round");
    setOdIn("");
    setThIn("");
    setRoundLen("");
    setRoundLenUnit("ft");
    setSideMm("");
    setThMm("");
    setSqLenM("");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Pipe Weight Calculator</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Simple steel pipe weight calculator (frontend-only). Refresh will clear inputs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Inputs</h2>
              <button
                onClick={resetAll}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900"
              >
                Reset
              </button>
            </div>

            {/* Type Switch */}
            <div className="mt-4">
              <label className="text-xs text-zinc-400">Pipe Type</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPipeType("round")}
                  className={[
                    "rounded-xl px-3 py-2 text-sm border",
                    pipeType === "round"
                      ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                      : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  Round Pipe
                </button>
                <button
                  onClick={() => setPipeType("square")}
                  className={[
                    "rounded-xl px-3 py-2 text-sm border",
                    pipeType === "square"
                      ? "border-zinc-200 bg-zinc-100 text-zinc-900"
                      : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900",
                  ].join(" ")}
                >
                  Square Pipe
                </button>
              </div>
            </div>

            {/* Round Form */}
            {pipeType === "round" && (
              <div className="mt-5 space-y-4">
                <Field
                  label="Outer Diameter (OD)"
                  unit="in"
                  value={odIn}
                  onChange={setOdIn}
                  placeholder="e.g., 2"
                />
                <Field
                  label="Thickness (T)"
                  unit="in"
                  value={thIn}
                  onChange={setThIn}
                  placeholder="e.g., 0.1"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Length"
                    unit={roundLenUnit === "ft" ? "ft" : "m"}
                    value={roundLen}
                    onChange={setRoundLen}
                    placeholder={roundLenUnit === "ft" ? "e.g., 20" : "e.g., 6"}
                  />
                  <div>
                    <label className="text-xs text-zinc-400">Length Unit</label>
                    <select
                      value={roundLenUnit}
                      onChange={(e) => setRoundLenUnit(e.target.value as RoundLenUnit)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none focus:border-zinc-500"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-zinc-500">Optional: total weight needs length.</p>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Formula: {roundLenUnit === "ft" ? "10.69 × (OD − T) × T" : "24.66 × (OD − T) × T"}
                </p>
              </div>
            )}

            {/* Square Form */}
            {pipeType === "square" && (
              <div className="mt-5 space-y-4">
                <Field
                  label="Outer Side (S)"
                  unit="mm"
                  value={sideMm}
                  onChange={setSideMm}
                  placeholder="e.g., 50"
                />
                <Field
                  label="Thickness (T)"
                  unit="mm"
                  value={thMm}
                  onChange={setThMm}
                  placeholder="e.g., 2"
                />
                <Field
                  label="Length"
                  unit="m"
                  value={sqLenM}
                  onChange={setSqLenM}
                  placeholder="e.g., 6"
                />

                <p className="text-[11px] text-zinc-500">
                  Formula: 4 × T × (S − T) × 7.85 / 1000
                </p>
              </div>
            )}
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <h2 className="text-base font-semibold">Results</h2>

            <div className="mt-4 grid gap-3">
              <ResultRow
                label={`Weight per unit (${active.unitLabel})`}
                value={`${fmt(active.wPerUnit)} ${active.unitLabel}`}
              />
              <ResultRow
                label="Total weight (kg)"
                value={Number.isFinite(active.total) ? `${fmt(active.total)} kg` : "—"}
              />
            </div>

            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-300">
                {active.ok ? active.note : "Fill required fields to calculate."}
              </p>
              {!active.ok && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Tip: Thickness must be greater than 0, and outer size must be larger than thickness.
                </p>
              )}
            </div>

            <div className="mt-4 text-[11px] text-zinc-500">
              * This is an approximate calculator for quick estimation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <div className="mt-2 flex items-center rounded-xl border border-zinc-800 bg-zinc-950 focus-within:border-zinc-500">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none"
        />
        <span className="select-none pr-3 text-xs text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}
