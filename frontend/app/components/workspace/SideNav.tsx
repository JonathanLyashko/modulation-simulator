import { useState } from "react";

import type { AnalogAmplitudeScheme, AnalogAngleScheme } from "./types";

type SideNavProps = {
  activeFamily: "amplitude" | "angle";
  activeAmplitudeScheme: AnalogAmplitudeScheme;
  activeAngleScheme: AnalogAngleScheme;
  collapsed: boolean;
  onSelectAmplitudeScheme: (scheme: AnalogAmplitudeScheme) => void;
  onSelectAngleScheme: (scheme: AnalogAngleScheme) => void;
  onToggleCollapsed: () => void;
};

const AM_VARIANTS = ["DSB-LC", "DSB-SC", "SSB"] as const;
const ANGLE_VARIANTS = ["FM", "PM"] as const;

function ChevronIcon({
  direction,
  className = "",
}: {
  direction: "left" | "right" | "down";
  className?: string;
}) {
  const rotationClass =
    direction === "left"
      ? "rotate-180"
      : direction === "down"
        ? "rotate-90"
        : "";

  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`h-3.5 w-3.5 ${rotationClass} ${className}`.trim()}
      fill="none"
    >
      <path
        d="M4 2.5L7.5 6L4 9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LibraryGroupButton({
  label,
  icon,
  expanded,
  onClick,
}: {
  label: string;
  icon: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-[4px] px-3 py-2 text-sm transition-colors",
        "text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]",
      ].join(" ")}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center text-[12px] font-semibold text-[color:var(--ui-primary)]">
        {icon}
      </span>
      <span>{label}</span>
      <ChevronIcon
        direction={expanded ? "down" : "right"}
        className="ml-auto text-[color:var(--ui-outline)]"
      />
    </button>
  );
}

export default function SideNav({
  activeFamily,
  activeAmplitudeScheme,
  activeAngleScheme,
  collapsed,
  onSelectAmplitudeScheme,
  onSelectAngleScheme,
  onToggleCollapsed,
}: SideNavProps) {
  const [amExpanded, setAmExpanded] = useState(true);
  const [angleExpanded, setAngleExpanded] = useState(true);

  if (collapsed) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] py-4">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
          aria-label="Expand left sidebar"
          title="Expand library"
        >
          <ChevronIcon direction="right" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:var(--ui-primary-container)] text-[11px] font-bold text-[color:var(--ui-on-primary-container)]">
          DSP
        </div>
        <div className="mt-6 flex flex-1 flex-col items-center gap-3">
          <div
            className="rounded-full bg-[color:var(--ui-secondary-container)] px-2 py-1 text-[10px] font-semibold text-[color:var(--ui-on-secondary-container)]"
            title={`Amplitude modulation: ${activeAmplitudeScheme}`}
          >
            AM
          </div>
          <div
            className="rounded-full border border-[color:var(--ui-outline-variant)] px-2 py-1 text-[10px] font-semibold text-[color:var(--ui-text-muted)]"
            title={`Angle modulation: ${activeAngleScheme}`}
          >
            PM
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] px-3 py-4">
      <div className="mb-6 px-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
            Component Library
          </p>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
            aria-label="Collapse left sidebar"
            title="Collapse library"
          >
            <ChevronIcon direction="left" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:var(--ui-primary-container)] text-[11px] font-bold text-[color:var(--ui-on-primary-container)]">
            DSP
          </div>
          <div>
            <div className="text-sm font-semibold">Presets</div>
            <div className="text-[11px] text-[color:var(--ui-outline)]">
              Signal Modulation
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          Analog
        </p>

        <div>
          <LibraryGroupButton
            label="Amplitude Modulation"
            icon="AM"
            expanded={amExpanded}
            onClick={() => {
              setAmExpanded((current) => !current);
            }}
          />
          {amExpanded ? (
            <div className="ml-10 mt-1 space-y-1 border-l border-[color:var(--ui-outline-variant)] pl-4">
              {AM_VARIANTS.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => {
                    onSelectAmplitudeScheme(variant);
                  }}
                  className={[
                    "block w-full rounded-[3px] px-2 py-1 text-left text-[12px]",
                    activeFamily === "amplitude" && activeAmplitudeScheme === variant
                      ? "bg-[color:var(--ui-secondary-container)] font-semibold text-[color:var(--ui-on-secondary-container)]"
                      : "text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-lowest)]",
                  ].join(" ")}
                >
                  {variant}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <LibraryGroupButton
            label="Angle Modulation"
            icon="PM"
            expanded={angleExpanded}
            onClick={() => {
              setAngleExpanded((current) => !current);
            }}
          />
          {angleExpanded ? (
            <div className="ml-10 mt-1 space-y-1 border-l border-[color:var(--ui-outline-variant)] pl-4">
              {ANGLE_VARIANTS.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => {
                    onSelectAngleScheme(variant);
                  }}
                  className={[
                    "block w-full rounded-[3px] px-2 py-1 text-left text-[12px]",
                    activeFamily === "angle" && activeAngleScheme === variant
                      ? "bg-[color:var(--ui-secondary-container)] font-semibold text-[color:var(--ui-on-secondary-container)]"
                      : "text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-lowest)]",
                  ].join(" ")}
                >
                  {variant}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <p className="px-3 py-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          Digital
        </p>
        <div className="px-3 text-[12px] text-[color:var(--ui-text-muted)]">
          Coming later
        </div>
      </div>

      <div className="mt-auto space-y-1 pt-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--ui-text)]"
        >
          Settings
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--ui-text)]"
        >
          Docs
        </button>
      </div>
    </aside>
  );
}


