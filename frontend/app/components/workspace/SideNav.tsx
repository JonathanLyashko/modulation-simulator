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
        <div className="rounded-[10px] border border-[color:var(--ui-outline-variant)] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-outline)]">
          Mode
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
      <div className="flex-1 space-y-1 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
            Analog
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
        <a
          href="https://github.com/JonathanLyashko/modulation-simulator"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 fill-current"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.1c.58.1.79-.25.79-.56v-2.15c-3.18.69-3.85-1.35-3.85-1.35-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.54-.29-5.21-1.27-5.21-5.64 0-1.25.45-2.27 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.14 1.18a10.9 10.9 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.08 0 4.38-2.68 5.34-5.23 5.63.42.36.78 1.05.78 2.12v3.15c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          GitHub
        </a>
      </div>
    </aside>
  );
}


