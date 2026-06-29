type SideNavProps = {
  activeModulation: string;
};

function LibraryItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[color:var(--ui-secondary-container)] text-[color:var(--ui-on-secondary-container)]"
          : "text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]",
      ].join(" ")}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] text-[11px] font-bold">
        {label.slice(0, 1)}
      </span>
      <span className={active ? "font-semibold" : ""}>{label}</span>
    </button>
  );
}

export default function SideNav({ activeModulation }: SideNavProps) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)] px-3 py-4">
      <div className="mb-6 px-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          Component Library
        </p>
        <div className="flex items-center gap-3 rounded-xl bg-[color:var(--ui-surface-lowest)] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--ui-primary-container)] text-sm font-bold text-[color:var(--ui-on-primary-container)]">
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
          Standard Modulations
        </p>
        <LibraryItem label="AM" active={activeModulation === "AM"} />
        <LibraryItem label="FM" active={activeModulation === "FM"} />
        <LibraryItem label="PM" active={activeModulation === "PM"} />
        <LibraryItem label="QAM" active={activeModulation === "QAM"} />

        <div className="mt-4 border-t border-[color:var(--ui-outline-variant)] pt-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--ui-outline)] px-3 py-2 text-sm text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
          >
            <span className="text-base">+</span>
            Add Block
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
        >
          Settings
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
        >
          Docs
        </button>
      </div>
    </aside>
  );
}
