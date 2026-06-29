import type { ModulatorSettings, SignalView } from "./types";

type BlockCanvasProps = {
  activeModulation: string;
  settings: ModulatorSettings;
  selectedSignalView: SignalView;
  onSelectSignalView: (view: SignalView) => void;
};

function formatFrequencyLabel(frequency: number) {
  if (frequency < 10) {
    return frequency.toFixed(1);
  }

  return frequency.toFixed(0);
}

function SignalBlock({
  nodeLabel,
  title,
  expression,
  selected = false,
  onClick,
}: {
  nodeLabel: string;
  title: string;
  expression: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        className={[
          "relative flex h-32 w-44 flex-col items-center justify-center rounded-[2px] border-2 bg-[color:var(--ui-surface-lowest)] px-4 py-3 text-center shadow-sm transition-colors",
          selected
            ? "border-[color:var(--ui-primary)]"
            : "border-[color:var(--ui-outline-variant)] hover:border-[color:var(--ui-primary)]",
        ].join(" ")}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-primary)]">
          {nodeLabel}
        </span>
        <span className="mt-3 text-sm font-semibold">{title}</span>
        <span className="mt-2 px-2 text-[11px] leading-5 text-[color:var(--ui-outline)]">
          {expression}
        </span>
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
      </button>
    </div>
  );
}

function UtilityBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-32 w-44 flex-col items-center justify-center rounded-[2px] border-2 border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-4 py-3 text-center shadow-sm">
        <span className="text-sm font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-2 px-2 text-[11px] leading-5 text-[color:var(--ui-outline)]">
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

function CarrierFeed({
  expression,
  selected,
  onClick,
}: {
  expression: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-[calc(100%+28px)] flex-col items-center">
      <SignalBlock
        nodeLabel="CARRIER"
        title="Carrier Signal"
        expression={expression}
        selected={selected}
        onClick={onClick}
      />
      <div className="h-8 w-px bg-[color:var(--ui-outline)]" />
    </div>
  );
}

export default function BlockCanvas({
  activeModulation,
  settings,
  selectedSignalView,
  onSelectSignalView,
}: BlockCanvasProps) {
  const messageExpression = `m(t) = ${settings.message.amplitude.toFixed(2)} cos(2pi ${formatFrequencyLabel(settings.message.frequency)} t)`;
  const carrierExpression = `c(t) = ${settings.carrier.amplitude.toFixed(2)} cos(2pi ${formatFrequencyLabel(settings.carrier.frequency)} t)`;
  const modulatedExpression = `u(t) = A_c [1 + a m_n(t)] cos(2pi f_c t)`;

  return (
    <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle,_var(--ui-dot-grid)_1.1px,_transparent_1.1px)] [background-size:20px_20px]">
      <div className="absolute inset-0 flex items-center justify-center overflow-auto p-8">
        <div className="flex min-w-[1120px] items-center gap-12">
          <SignalBlock
            nodeLabel="MESSAGE"
            title="Message Signal"
            expression={messageExpression}
            selected={selectedSignalView === "message"}
            onClick={() => onSelectSignalView("message")}
          />
          <Arrow />
          <div className="relative">
            <CarrierFeed
              expression={carrierExpression}
              selected={selectedSignalView === "carrier"}
              onClick={() => onSelectSignalView("carrier")}
            />
            <SignalBlock
              nodeLabel="MODULATOR"
              title={`${activeModulation} Modulator`}
              expression={modulatedExpression}
              selected={selectedSignalView === "modulated"}
              onClick={() => onSelectSignalView("modulated")}
            />
          </div>
          <Arrow />
          <UtilityBlock title="Channel" subtitle="AWGN 10 dB" />
          <Arrow />
          <UtilityBlock title="Demodulator" />
        </div>
      </div>
    </div>
  );
}
