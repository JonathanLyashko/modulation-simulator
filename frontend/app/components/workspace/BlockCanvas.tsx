type BlockCanvasProps = {
  activeModulation: string;
  carrierFrequency: number;
  messageFrequency: number;
  selectedSignalView: "message" | "carrier" | "modulated";
  onSelectSignalView: (view: "message" | "carrier" | "modulated") => void;
};

function Block({
  title,
  subtitle,
  emphasis = false,
  topLabel,
  selected = false,
  onClick,
}: {
  title: string;
  subtitle?: string;
  emphasis?: boolean;
  topLabel?: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        className={[
          "relative flex h-28 w-40 flex-col items-center justify-center rounded-[2px] border-2 bg-[color:var(--ui-surface-lowest)] p-3 text-center shadow-sm transition-colors",
          selected
            ? "border-[color:var(--ui-primary)]"
            : "",
          emphasis
            ? "border-[color:var(--ui-primary)]"
            : "border-[color:var(--ui-outline-variant)]",
        ].join(" ")}
      >
        {topLabel ? (
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full flex-col items-center pb-2">
            <div className="h-6 w-px bg-[color:var(--ui-outline)]" />
            <div className="rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[color:var(--ui-outline)]">
              {topLabel}
            </div>
          </div>
        ) : null}
        <span className="text-sm font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-1 text-[11px] text-[color:var(--ui-outline)]">
            {subtitle}
          </span>
        ) : null}
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
      </button>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="h-4 w-12 overflow-visible" fill="none" aria-hidden="true">
      <path
        d="M0 8H40"
        stroke="var(--ui-outline)"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
      <path d="M40 8L34 5V11L40 8Z" fill="var(--ui-outline)" />
    </svg>
  );
}

export default function BlockCanvas({
  activeModulation,
  carrierFrequency,
  messageFrequency,
  selectedSignalView,
  onSelectSignalView,
}: BlockCanvasProps) {
  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle,_var(--ui-dot-grid)_1.1px,_transparent_1.1px)] [background-size:20px_20px]">
      <div className="absolute inset-0 flex items-center justify-center overflow-auto p-8">
        <div className="flex min-w-[980px] items-center gap-12">
          <Block
            title="Message Signal"
            subtitle={`COS ${messageFrequency.toFixed(0)} Hz`}
            selected={selectedSignalView === "message"}
            onClick={() => onSelectSignalView("message")}
          />
          <Arrow />
          <Block
            title={`${activeModulation} Modulator`}
            subtitle={`fc=${carrierFrequency.toFixed(0)} Hz`}
            emphasis
            topLabel="CARRIER"
            selected={selectedSignalView === "modulated"}
            onClick={() => onSelectSignalView("modulated")}
          />
          <Arrow />
          <Block title="Channel" subtitle="AWGN 10 dB" />
          <Arrow />
          <Block title="Demodulator" />
          <Arrow />
          <Block
            title="Carrier Signal"
            subtitle={`COS ${carrierFrequency.toFixed(0)} Hz`}
            selected={selectedSignalView === "carrier"}
            onClick={() => onSelectSignalView("carrier")}
          />
        </div>
      </div>
    </div>
  );
}
