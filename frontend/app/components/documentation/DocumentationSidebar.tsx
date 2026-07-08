"use client";

import { useState } from "react";

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

function SidebarGroupButton({
  label,
  index,
  expanded,
  onClick,
}: {
  label: string;
  index: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[4px] px-3 py-2 text-sm text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
    >
      <span className="inline-flex min-w-[30px] items-center justify-center text-[12px] font-semibold text-[color:var(--ui-primary)]">
        {index}
      </span>
      <span>{label}</span>
      <ChevronIcon
        direction={expanded ? "down" : "right"}
        className="ml-auto text-[color:var(--ui-outline)]"
      />
    </button>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block w-full rounded-[3px] px-2 py-1 text-left text-[12px] text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-lowest)] hover:text-[color:var(--ui-primary)]"
    >
      {label}
    </a>
  );
}

export default function DocumentationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [runtimeExpanded, setRuntimeExpanded] = useState(true);
  const [pipelineExpanded, setPipelineExpanded] = useState(true);
  const [opsExpanded, setOpsExpanded] = useState(true);

  if (collapsed) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] py-4">
        <button
          type="button"
          onClick={() => {
            setCollapsed(false);
          }}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
          aria-label="Expand documentation sidebar"
        >
          <ChevronIcon direction="right" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:var(--ui-primary-container)] text-[11px] font-bold text-[color:var(--ui-on-primary-container)]">
          DOC
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] px-3 py-4">
      <div className="mb-6 px-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
            Technical Outline
          </p>
          <button
            type="button"
            onClick={() => {
              setCollapsed(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
            aria-label="Collapse documentation sidebar"
          >
            <ChevronIcon direction="left" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[color:var(--ui-primary-container)] text-[11px] font-bold text-[color:var(--ui-on-primary-container)]">
            DOC
          </div>
          <div>
            <div className="text-sm font-semibold">Documentation</div>
            <div className="text-[11px] text-[color:var(--ui-outline)]">
              Runtime and architecture
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        <SidebarLink href="#overview" label="1. System Overview" />

        <SidebarGroupButton
          label="Browser Runtime"
          index="2"
          expanded={runtimeExpanded}
          onClick={() => {
            setRuntimeExpanded((current) => !current);
          }}
        />
        {runtimeExpanded ? (
          <div className="ml-10 mt-1 space-y-1 border-l border-[color:var(--ui-outline-variant)] pl-4">
            <SidebarLink href="#browser-runtime" label="Execution model" />
            <SidebarLink href="#wasm-bridge" label="WASM bridge" />
            <SidebarLink href="#audio-capture" label="Audio capture path" />
          </div>
        ) : null}

        <SidebarGroupButton
          label="Signal Pipeline"
          index="3"
          expanded={pipelineExpanded}
          onClick={() => {
            setPipelineExpanded((current) => !current);
          }}
        />
        {pipelineExpanded ? (
          <div className="ml-10 mt-1 space-y-1 border-l border-[color:var(--ui-outline-variant)] pl-4">
            <SidebarLink href="#signal-generation" label="Generation path" />
            <SidebarLink href="#fft-processing" label="FFT processing" />
            <SidebarLink href="#data-volume" label="Data volume" />
          </div>
        ) : null}

        <SidebarGroupButton
          label="Build and Operations"
          index="4"
          expanded={opsExpanded}
          onClick={() => {
            setOpsExpanded((current) => !current);
          }}
        />
        {opsExpanded ? (
          <div className="ml-10 mt-1 space-y-1 border-l border-[color:var(--ui-outline-variant)] pl-4">
            <SidebarLink href="#build-system" label="Build pipeline" />
            <SidebarLink href="#project-layout" label="Project layout" />
          </div>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
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
