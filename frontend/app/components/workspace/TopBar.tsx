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
        "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-[color:var(--ui-primary)] bg-[color:var(--ui-primary)] text-white"
          : "border-[color:var(--ui-outline)] bg-[color:var(--ui-surface-low)] text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]",
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
        <div>
          <p className="text-lg font-semibold tracking-tight text-[color:var(--ui-primary)]">
            Precision Signal Lab
          </p>
        </div>
        <nav className="flex items-center gap-1">
          <button
            type="button"
            className="border-b-2 border-[color:var(--ui-primary)] px-3 py-5 text-sm font-semibold text-[color:var(--ui-primary)]"
          >
            Workspace
          </button>
          <button
            type="button"
            className="px-3 py-5 text-sm text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
          >
            Analysis
          </button>
          <button
            type="button"
            className="px-3 py-5 text-sm text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
          >
            Library
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <ToolbarButton label="Run" active={isRunning} onClick={onRun} />
        <ToolbarButton label="Pause" onClick={onPause} />
        <ToolbarButton label="Reset" onClick={onReset} />
        <ToolbarButton label="Download" />
        <ToolbarButton label="Save" />
      </div>
    </header>
  );
}
