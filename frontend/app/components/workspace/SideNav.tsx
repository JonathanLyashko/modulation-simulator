import { useState } from "react";

import type { AnalogAmplitudeScheme, AnalogAngleScheme } from "./types";

type SideNavProps = {
  activeAmplitudeScheme: AnalogAmplitudeScheme;
  activeAngleScheme: AnalogAngleScheme;
  onSelectAmplitudeScheme: (scheme: AnalogAmplitudeScheme) => void;
  onSelectAngleScheme: (scheme: AnalogAngleScheme) => void;
};

const AM_VARIANTS = ["DSB-LC", "DSB-SC", "SSB+", "SSB_"] as const;
const ANGLE_VARIANTS = ["FM", "PM"] as const;

function LibraryGroupButton({
  label,
  icon,
  active,
  expanded,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-[4px] px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[color:var(--ui-secondary-container)] text-[color:var(--ui-on-secondary-container)]"
          : "text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]",
      ].join(" ")}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center text-[12px] font-semibold text-[color:var(--ui-primary)]">
        {icon}
      </span>
      <span className={active ? "font-semibold" : ""}>{label}</span>
      <span className="ml-auto text-[10px] text-[color:var(--ui-outline)]">
        {expanded ? "v" : ">"}
      </span>
    </button>
  );
}

export default function SideNav({
  activeAmplitudeScheme,
  activeAngleScheme,
  onSelectAmplitudeScheme,
  onSelectAngleScheme,
}: SideNavProps) {
  const [amExpanded, setAmExpanded] = useState(true);
  const [angleExpanded, setAngleExpanded] = useState(true);

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] px-3 py-4">
      <div className="mb-6 px-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          Component Library
        </p>
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
            active
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
                    activeAmplitudeScheme === variant
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
            active={activeAngleScheme === "FM" || activeAngleScheme === "PM"}
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
                    activeAngleScheme === variant
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

        <div className="mt-4 border-t border-[color:var(--ui-outline-variant)] pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[2px] border border-dashed border-[color:var(--ui-outline-variant)] px-3 py-2 text-sm text-[color:var(--ui-text-muted)]"
          >
            <span className="text-base">+</span>
            Add Block
          </button>
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
