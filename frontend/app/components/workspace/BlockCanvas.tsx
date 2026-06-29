type BlockCanvasProps = {
  activeModulation: string;
  carrierFrequency: number;
};

function Block({
  title,
  subtitle,
  emphasis = false,
  topLabel,
}: {
  title: string;
  subtitle?: string;
  emphasis?: boolean;
  topLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          "relative flex h-28 w-44 flex-col items-center justify-center rounded-lg border-2 bg-[color:var(--ui-surface-lowest)] p-3 shadow-sm",
          emphasis
            ? "border-[color:var(--ui-primary)]"
            : "border-[color:var(--ui-outline-variant)]",
        ].join(" ")}
      >
        {topLabel ? (
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-full flex-col items-center pb-2">
            <div className="h-6 w-px bg-[color:var(--ui-outline)]" />
            <div className="rounded border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-high)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[color:var(--ui-outline)]">
              {topLabel}
            </div>
          </div>
        ) : null}
        <span className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ui-primary)]">
          Node
        </span>
        <span className="text-sm font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-1 text-[11px] text-[color:var(--ui-outline)]">
            {subtitle}
          </span>
        ) : null}
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
      </div>
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
}: BlockCanvasProps) {
  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.02)_1px,_transparent_1px)] [background-size:20px_20px]">
      <div className="absolute inset-0 flex items-center justify-center overflow-auto p-8">
        <div className="flex items-center gap-12">
          <Block title="Message Signal" subtitle="SINE 100 Hz" />
          <Arrow />
          <Block
            title={`${activeModulation} Modulator`}
            subtitle={`fc=${carrierFrequency.toFixed(0)} Hz`}
            emphasis
            topLabel="CARRIER"
          />
          <Arrow />
          <Block title="Channel" subtitle="AWGN 10 dB" />
          <Arrow />
          <Block title="Demodulator" />
          <Arrow />
          <Block title="Output" />
        </div>
      </div>
    </div>
  );
}
