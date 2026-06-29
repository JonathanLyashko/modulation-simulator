type TopBarProps = {
  isRunning: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
};

function ToolbarButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[3px] border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-[color:var(--ui-primary)] bg-[color:var(--ui-primary)] text-white"
          : "border-transparent bg-[color:var(--ui-surface-high)] text-[color:var(--ui-text)] hover:bg-[#e7ebf1]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function TopBar({
  isRunning,
  onRun,
  onPause,
  onReset,
}: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-6">
      <div className="flex items-center gap-6">
        <div className="pr-5 border-r border-[color:var(--ui-outline-variant)]">
          <p className="text-[18px] font-semibold tracking-tight text-[color:var(--ui-primary)]">
            Precision Signal Lab
          </p>
        </div>
        <nav className="flex items-center gap-4">
          <button
            type="button"
            className="border-b-[3px] border-[color:var(--ui-primary)] px-2 py-[19px] text-sm font-semibold text-[color:var(--ui-primary)]"
          >
            Workspace
          </button>
          <button
            type="button"
            className="px-2 py-[19px] text-sm text-[color:var(--ui-text)]"
          >
            Analysis
          </button>
          <button
            type="button"
            className="px-2 py-[19px] text-sm text-[color:var(--ui-text)]"
          >
            Library
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ToolbarButton label="Run" active={isRunning} onClick={onRun} />
        <ToolbarButton label="Pause" onClick={onPause} />
        <button type="button" onClick={onReset} className="px-3 py-2 text-[color:var(--ui-text)]">⟳</button>
        <button type="button" className="px-3 py-2 text-[color:var(--ui-text)]">↓</button>
        <button type="button" className="px-3 py-2 text-[color:var(--ui-text)]">💾</button>
      </div>
    </header>
  );
}
