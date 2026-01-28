"use client";

import { useEffect, useMemo, useState } from "react";

type PipeType = "round" | "square";
type LenUnit = "ft" | "m";

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

/** ====== PROFESSIONAL / ORIGINAL METHOD ======
 * Weight per length = density * area
 * Steel density = 7850 kg/m^3 = 7.85e-6 kg/mm^3
 */
const IN_TO_MM = 25.4;
const FT_TO_MM = 304.8;
const M_TO_MM = 1000;
const STEEL_DENSITY_KG_PER_MM3 = 7.85e-6;

function inchesToMm(xIn: number) {
  return xIn * IN_TO_MM;
}

function areaRoundMm2(odMm: number, tMm: number) {
  // ID = OD - 2t
  const idMm = odMm - 2 * tMm;
  if (!(idMm > 0)) return NaN;
  return (Math.PI / 4) * (odMm * odMm - idMm * idMm);
}

function areaSquareTubeMm2(sideMm: number, tMm: number) {
  // inner = side - 2t
  const inner = sideMm - 2 * tMm;
  if (!(inner > 0)) return NaN;
  return sideMm * sideMm - inner * inner;
}

function kgPerUnitFromArea(areaMm2: number, unit: LenUnit) {
  const lenMm = unit === "ft" ? FT_TO_MM : M_TO_MM; // per 1 ft OR per 1 m
  const volMm3 = areaMm2 * lenMm;
  return volMm3 * STEEL_DENSITY_KG_PER_MM3; // kg per unit
}

export default function PipeWeightPage() {
  const [pipeType, setPipeType] = useState<PipeType>("round");

  // Round: OD inches, Thickness mm, Length + unit
  const [odIn, setOdIn] = useState("");
  const [thMmRound, setThMmRound] = useState(""); // thickness in mm (round)
  const [roundLen, setRoundLen] = useState("");
  const [roundLenUnit, setRoundLenUnit] = useState<LenUnit>("ft");

  // Square: Side inches, Thickness mm, Length + unit
  const [sideIn, setSideIn] = useState("");
  const [thMmSq, setThMmSq] = useState("");
  const [sqLen, setSqLen] = useState("");
  const [sqLenUnit, setSqLenUnit] = useState<LenUnit>("m");

  // Reset fields when switching type
  useEffect(() => {
    if (pipeType === "round") {
      setSideIn("");
      setThMmSq("");
      setSqLen("");
      setSqLenUnit("m");
    } else {
      setOdIn("");
      setThMmRound("");
      setRoundLen("");
      setRoundLenUnit("ft");
    }
  }, [pipeType]);

  const round = useMemo(() => {
    const odInVal = clampNonNegative(num(odIn));        // inches
    const tMm = clampNonNegative(num(thMmRound));       // mm
    const L = clampNonNegative(num(roundLen));          // ft or m (based on unit)

    const odMm = Number.isFinite(odInVal) ? inchesToMm(odInVal) : NaN;

    // Professional validation
    const validDims =
      Number.isFinite(odMm) &&
      Number.isFinite(tMm) &&
      tMm > 0 &&
      odMm > 2 * tMm;

    if (!validDims) {
      return {
        ok: false,
        unitLabel: roundLenUnit === "ft" ? "kg/ft" : "kg/m",
        wPerUnit: NaN,
        total: NaN,
        note: "Round: OD must be in inches, Thickness in mm, and OD > 2×Thickness.",
      };
    }

    const area = areaRoundMm2(odMm, tMm);
    const wPerUnit = kgPerUnitFromArea(area, roundLenUnit); // kg/ft OR kg/m

    const hasLen = Number.isFinite(L) && L > 0;
    const total = hasLen ? wPerUnit * L : NaN;

    return {
      ok: true,
      unitLabel: roundLenUnit === "ft" ? "kg/ft" : "kg/m",
      wPerUnit,
      total,
      note: "Calculated using geometry + steel density (7850 kg/m³).",
    };
  }, [odIn, thMmRound, roundLen, roundLenUnit]);

  const square = useMemo(() => {
    const sideInVal = clampNonNegative(num(sideIn));     // inches
    const tMm = clampNonNegative(num(thMmSq));           // mm
    const L = clampNonNegative(num(sqLen));              // ft or m (based on unit)

    const sideMm = Number.isFinite(sideInVal) ? inchesToMm(sideInVal) : NaN;

    const validDims =
      Number.isFinite(sideMm) &&
      Number.isFinite(tMm) &&
      tMm > 0 &&
      sideMm > 2 * tMm;

    if (!validDims) {
      return {
        ok: false,
        unitLabel: sqLenUnit === "ft" ? "kg/ft" : "kg/m",
        wPerUnit: NaN,
        total: NaN,
        note: "Square: Side must be in inches, Thickness in mm, and Side > 2×Thickness.",
      };
    }

    const area = areaSquareTubeMm2(sideMm, tMm);
    const wPerUnit = kgPerUnitFromArea(area, sqLenUnit); // kg/ft OR kg/m

    const hasLen = Number.isFinite(L) && L > 0;
    const total = hasLen ? wPerUnit * L : NaN;

    return {
      ok: true,
      unitLabel: sqLenUnit === "ft" ? "kg/ft" : "kg/m",
      wPerUnit,
      total,
      note: "Calculated using geometry + steel density (7850 kg/m³).",
    };
  }, [sideIn, thMmSq, sqLen, sqLenUnit]);

  const active = pipeType === "round" ? round : square;

  function resetAll() {
    setPipeType("round");
    setOdIn("");
    setThMmRound("");
    setRoundLen("");
    setRoundLenUnit("ft");
    setSideIn("");
    setThMmSq("");
    setSqLen("");
    setSqLenUnit("m");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Pipe Weight Calculator</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Professional steel weight calculator (geometry + density). Refresh will clear inputs.
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
                <Field label="Outer Diameter (OD)" unit="in" value={odIn} onChange={setOdIn} placeholder="e.g., 2" />
                <Field label="Thickness (T)" unit="mm" value={thMmRound} onChange={setThMmRound} placeholder="e.g., 2" />

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
                      onChange={(e) => setRoundLenUnit(e.target.value as LenUnit)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none focus:border-zinc-500"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-zinc-500">Optional: total weight needs length.</p>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Method: Cross-section area × density (7850 kg/m³)
                </p>
              </div>
            )}

            {/* Square Form */}
            {pipeType === "square" && (
              <div className="mt-5 space-y-4">
                <Field label="Outer Side (S)" unit="in" value={sideIn} onChange={setSideIn} placeholder="e.g., 2" />
                <Field label="Thickness (T)" unit="mm" value={thMmSq} onChange={setThMmSq} placeholder="e.g., 2" />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Length"
                    unit={sqLenUnit === "ft" ? "ft" : "m"}
                    value={sqLen}
                    onChange={setSqLen}
                    placeholder={sqLenUnit === "ft" ? "e.g., 20" : "e.g., 6"}
                  />
                  <div>
                    <label className="text-xs text-zinc-400">Length Unit</label>
                    <select
                      value={sqLenUnit}
                      onChange={(e) => setSqLenUnit(e.target.value as LenUnit)}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none focus:border-zinc-500"
                    >
                      <option value="ft">Feet (ft)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                    <p className="mt-1 text-[11px] text-zinc-500">Optional: total weight needs length.</p>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  Method: Cross-section area × density (7850 kg/m³)
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
                  Tip: Thickness &gt; 0 and outer size must be &gt; 2×thickness.
                </p>
              )}
            </div>

            <div className="mt-4 text-[11px] text-zinc-500">
              * Accurate for estimation using standard density method.
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
