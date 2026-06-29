import type { CarrierSettings } from "./types";

type InspectorPanelProps = {
  draftSettings: CarrierSettings;
  appliedSettings: CarrierSettings;
  onAmplitudeChange: (value: number) => void;
  onFrequencyChange: (value: number) => void;
  onApply: () => void;
  onReset: () => void;
  sampleCount: number;
  sampleRate: number;
  samplePreview: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
        {title}
      </label>
      {children}
    </div>
  );
}

export default function InspectorPanel({
  draftSettings,
  appliedSettings,
  onAmplitudeChange,
  onFrequencyChange,
  onApply,
  onReset,
  sampleCount,
  sampleRate,
  samplePreview,
}: InspectorPanelProps) {
  const amplitudePercent = Math.max(
    0,
    Math.min(100, (draftSettings.amplitude / 2) * 100)
  );

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)]">
      <div className="flex items-center justify-between border-b border-[color:var(--ui-outline-variant)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-tight">
          Modulator Parameters
        </h2>
        <button
          type="button"
          className="rounded p-1 text-[color:var(--ui-outline)] hover:text-[color:var(--ui-text)]"
        >
          Info
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <Section title="Carrier Frequency">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--ui-text-muted)]">Current</span>
            <span className="rounded border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-2 py-0.5 font-mono text-sm">
              {draftSettings.frequency.toFixed(0)} Hz
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={draftSettings.frequency}
            onChange={(event) => {
              onFrequencyChange(Number(event.target.value));
            }}
            className="w-full accent-[color:var(--ui-primary)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFrequencyChange(Math.max(100, draftSettings.frequency - 50))}
              className="h-8 w-8 rounded border border-[color:var(--ui-outline-variant)] hover:bg-[color:var(--ui-surface-high)]"
            >
              -
            </button>
            <input
              type="number"
              min="100"
              max="5000"
              step="50"
              value={draftSettings.frequency}
              onChange={(event) => {
                onFrequencyChange(Number(event.target.value));
              }}
              className="flex-1 rounded border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-1 text-center font-mono"
            />
            <button
              type="button"
              onClick={() => onFrequencyChange(Math.min(5000, draftSettings.frequency + 50))}
              className="h-8 w-8 rounded border border-[color:var(--ui-outline-variant)] hover:bg-[color:var(--ui-surface-high)]"
            >
              +
            </button>
          </div>
        </Section>

        <Section title="Amplitude (Peak)">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--ui-outline-variant)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--ui-primary)"
                  strokeWidth="6"
                  strokeDasharray={`${amplitudePercent * 2.51} 251`}
                  strokeLinecap="square"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-lg font-semibold">
                  {draftSettings.amplitude.toFixed(2)}
                </span>
                <span className="text-[11px] text-[color:var(--ui-outline)]">Volts</span>
              </div>
            </div>

            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={draftSettings.amplitude}
              onChange={(event) => {
                onAmplitudeChange(Number(event.target.value));
              }}
              className="w-full accent-[color:var(--ui-primary)]"
            />
            <input
              type="number"
              min="0.1"
              max="2"
              step="0.05"
              value={draftSettings.amplitude}
              onChange={(event) => {
                onAmplitudeChange(Number(event.target.value));
              }}
              className="w-full rounded border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-2 text-center font-mono"
            />
          </div>
        </Section>

        <Section title="Modulation Index">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--ui-text-muted)]">Reserved</span>
            <span className="font-mono text-sm text-[color:var(--ui-outline)]">beta = 0.8</span>
          </div>
          <div className="relative h-6">
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[color:var(--ui-surface-highest)]" />
            <div className="absolute top-1/2 h-1 w-[80%] -translate-y-1/2 rounded-full bg-[color:var(--ui-primary)]" />
            <div className="absolute left-[80%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color:var(--ui-surface)] bg-[color:var(--ui-primary)]" />
          </div>
        </Section>

        <Section title="Phase Offset">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[color:var(--ui-text-muted)]">
              Shift carrier start phase
            </div>
            <div className="rounded-full bg-[color:var(--ui-surface-highest)] px-3 py-1 text-xs text-[color:var(--ui-outline)]">
              Off
            </div>
          </div>
          <div className="rounded-lg border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-3 text-sm text-[color:var(--ui-outline)]">
            Phase control placeholder. DSP support can be enabled later.
          </div>
        </Section>

        <div className="space-y-3 border-t border-[color:var(--ui-outline-variant)] pt-6">
          <div className="rounded-lg border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
              Applied Carrier
            </div>
            <div className="mt-2 font-mono text-sm text-[color:var(--ui-primary)]">
              {`c(t)=${appliedSettings.amplitude.toFixed(2)}*cos(2pi*${appliedSettings.frequency.toFixed(0)}*t)`}
            </div>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={onApply}
              className="rounded-md bg-[color:var(--ui-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--ui-primary-container)]"
            >
              Apply Parameters
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
            >
              Revert to Default
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
            DSP Status
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[color:var(--ui-text-muted)]">Samples</span>
              <span className="font-semibold">{sampleCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[color:var(--ui-text-muted)]">Sample Rate</span>
              <span className="font-semibold">{sampleRate.toLocaleString()} Hz</span>
            </div>
            <div>
              <div className="mb-1 text-[color:var(--ui-text-muted)]">First 8 Samples</div>
              <div className="font-mono text-xs leading-6 text-[color:var(--ui-primary)]">
                {samplePreview}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] p-3 font-mono text-[11px] text-[color:var(--ui-outline)]">
        <div className="flex justify-between">
          <span>CPU LOAD: 12%</span>
          <span>BUFFER: OK</span>
        </div>
      </div>
    </aside>
  );
}
