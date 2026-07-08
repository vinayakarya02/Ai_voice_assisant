"use client";

/**
 * A labelled range slider with a live value readout. Uses the browser's
 * native range input (styled via `accent-color`) for full keyboard support.
 */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  format,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
  label: string;
  format?: (value: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-40 cursor-pointer accent-indigo-500"
      />
      <span className="w-12 text-right text-sm tabular-nums text-muted">
        {format ? format(value) : value}
      </span>
    </div>
  );
}
