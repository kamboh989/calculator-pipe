"use client";

import { useMemo, useState } from "react";

type PipeType = "round" | "square" | "rectangle";
type Unit = "mm" | "in";

const IN_TO_MM = 25.4;

function n(v: string) {
  const x = Number(v);
  return Number.isFinite(x) ? x : NaN;
}

function fmt(v: number) {
  return Number.isFinite(v) ? v.toFixed(2) : "—";
}

export default function PipeWeightPage() {
  const [pipeType, setPipeType] = useState<PipeType>("round");
  const [unit, setUnit] = useState<Unit>("mm");

  const [od, setOd] = useState("");
  const [side, setSide] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [thickness, setThickness] = useState("");
  const [length, setLength] = useState("");

  const mm = (v: number) => (unit === "in" ? v * IN_TO_MM : v);

  const result = useMemo(() => {
    const T = mm(n(thickness));
    const L = n(length);

    if (!(T > 0)) return invalid();

    let wPerM = NaN;

    // ROUND PIPE
    if (pipeType === "round") {
      const OD = mm(n(od));
      if (!(OD > 2 * T)) return invalid();

      // Industry standard shortcut (image based)
      wPerM = 0.02466 * (OD - T) * T;
    }

    // SQUARE PIPE
    if (pipeType === "square") {
      const S = mm(n(side));
      if (!(S > 2 * T)) return invalid();

      wPerM = (4 * T * (S - T) * 7.85) / 1000;
    }

    // RECTANGLE PIPE
    if (pipeType === "rectangle") {
      const W = mm(n(width));
      const H = mm(n(height));
      if (!(W > 2 * T && H > 2 * T)) return invalid();

      wPerM = (2 * T * ((W + H) - 2 * T) * 7.85) / 1000;
    }

    const total = Number.isFinite(L) && L > 0 ? wPerM * L : NaN;

    return {
      ok: true,
      wPerM,
      total,
    };
  }, [pipeType, unit, od, side, width, height, thickness, length]);

  function invalid() {
    return { ok: false, wPerM: NaN, total: NaN };
  }

  function reset() {
    setOd("");
    setSide("");
    setWidth("");
    setHeight("");
    setThickness("");
    setLength("");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">Steel Pipe Weight Calculator</h1>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={pipeType}
            onChange={(e) => {
              setPipeType(e.target.value as PipeType);
              reset();
            }}
            className="rounded-xl bg-zinc-900 p-3"
          >
            <option value="round">Round Pipe</option>
            <option value="square">Square Pipe</option>
            <option value="rectangle">Rectangle Pipe</option>
          </select>

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-xl bg-zinc-900 p-3"
          >
            <option value="mm">Millimeter (mm)</option>
            <option value="in">Inches (in)</option>
          </select>
        </div>

        {/* Inputs */}
        <div className="grid gap-4">

          {pipeType === "round" && (
            <Input label="Outer Diameter (OD)" value={od} set={setOd} unit={unit} />
          )}

          {pipeType === "square" && (
            <Input label="Side (S)" value={side} set={setSide} unit={unit} />
          )}

          {pipeType === "rectangle" && (
            <>
              <Input label="Width (W)" value={width} set={setWidth} unit={unit} />
              <Input label="Height (H)" value={height} set={setHeight} unit={unit} />
            </>
          )}

          <Input label="Thickness (T)" value={thickness} set={setThickness} unit={unit} />
          <Input label="Length (optional)" value={length} set={setLength} unit="m" />
        </div>

        {/* Results */}
        <div className="rounded-xl bg-zinc-900 p-4 space-y-2">
          <div>Weight per meter: <b>{fmt(result.wPerM)} kg/m</b></div>
          <div>Total weight: <b>{fmt(result.total)} kg</b></div>

          {!result.ok && (
            <p className="text-xs text-zinc-400">
              Enter valid dimensions (outer size must be &gt; 2 × thickness)
            </p>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          * Approximate industrial steel calculation (Density 7.85)
        </p>

      </div>
    </div>
  );
}

function Input({
  label,
  value,
  set,
  unit,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  unit: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <div className="flex items-center rounded-xl bg-zinc-900 p-3">
        <input
          value={value}
          onChange={(e) => set(e.target.value)}
          className="bg-transparent w-full outline-none"
        />
        <span className="text-xs text-zinc-400 ml-2">{unit}</span>
      </div>
    </div>
  );
}
