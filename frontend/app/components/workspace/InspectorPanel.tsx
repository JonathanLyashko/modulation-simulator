import type { ModulatorSettings, SignalView } from "./types";

type InspectorPanelProps = {
  selectedSignalView: SignalView;
  settings: ModulatorSettings;
  onAmplitudeChange: (value: number) => void;
  onFrequencyChange: (value: number) => void;
  onPhaseChange: (value: number) => void;
  onModulationIndexChange: (value: number) => void;
  onReset: () => void;
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
  selectedSignalView,
  settings,
  onAmplitudeChange,
  onFrequencyChange,
  onPhaseChange,
  onModulationIndexChange,
  onReset,
}: InspectorPanelProps) {
  const selectedOscillator =
    selectedSignalView === "message" ? settings.message : settings.carrier;
  const amplitudePercent = Math.max(
    0,
    Math.min(100, (selectedOscillator.amplitude / 2) * 100)
  );
  const panelTitle =
    selectedSignalView === "message"
      ? "Message Signal Parameters"
      : selectedSignalView === "carrier"
        ? "Carrier Signal Parameters"
        : "Modulator Parameters";
  const frequencyLabel =
    selectedSignalView === "message" ? "Message Frequency" : "Carrier Frequency";
  const amplitudeLabel =
    selectedSignalView === "message" ? "Message Amplitude (Peak)" : "Amplitude (Peak)";
  const phaseLabel =
    selectedSignalView === "message" ? "Message Phase Offset" : "Phase Offset";

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)]">
      <div className="flex items-center justify-between border-b border-[color:var(--ui-outline-variant)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-tight">
          {panelTitle}
        </h2>
        <button type="button" className="rounded p-1 text-[color:var(--ui-outline)]">
          i
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        <Section title={frequencyLabel}>
          <div className="flex items-center justify-between">
            <span className="sr-only">Current</span>
            <span className="rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-2 py-0.5 font-mono text-sm">
              {selectedOscillator.frequency.toFixed(0)} Hz
            </span>
          </div>
          <input
            type="range"
            min={selectedSignalView === "message" ? "0.1" : "100"}
            max="5000"
            step={selectedSignalView === "message" ? "0.1" : "50"}
            value={selectedOscillator.frequency}
            onChange={(event) => {
              onFrequencyChange(Number(event.target.value));
            }}
            className="w-full accent-[color:var(--ui-primary)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onFrequencyChange(
                  selectedSignalView === "message"
                    ? Math.max(0.1, selectedOscillator.frequency - 0.1)
                    : Math.max(100, selectedOscillator.frequency - 50)
                )
              }
              className="h-8 w-8 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)]"
            >
              -
            </button>
            <input
              type="number"
              min={selectedSignalView === "message" ? "0.1" : "100"}
              max="5000"
              step={selectedSignalView === "message" ? "0.1" : "50"}
              value={selectedOscillator.frequency}
              onChange={(event) => {
                onFrequencyChange(Number(event.target.value));
              }}
              className="flex-1 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-1 text-center font-mono"
            />
            <button
              type="button"
              onClick={() =>
                onFrequencyChange(
                  selectedSignalView === "message"
                    ? Math.min(5000, selectedOscillator.frequency + 0.1)
                    : Math.min(5000, selectedOscillator.frequency + 50)
                )
              }
              className="h-8 w-8 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)]"
            >
              +
            </button>
          </div>
        </Section>

        <Section title={amplitudeLabel}>
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
                  {selectedOscillator.amplitude.toFixed(2)}
                </span>
                <span className="text-[11px] text-[color:var(--ui-outline)]">Volts</span>
              </div>
            </div>

            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={selectedOscillator.amplitude}
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
              value={selectedOscillator.amplitude}
              onChange={(event) => {
                onAmplitudeChange(Number(event.target.value));
              }}
              className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-2 text-center font-mono"
            />
          </div>
        </Section>

        {selectedSignalView === "modulated" ? (
          <Section title="Modulation Index">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--ui-text-muted)]">Current</span>
              <span className="font-mono text-sm text-[color:var(--ui-outline)]">
                a = {settings.modulationIndex.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={settings.modulationIndex}
              onChange={(event) => {
                onModulationIndexChange(Number(event.target.value));
              }}
              className="w-full accent-[color:var(--ui-primary)]"
            />
          </Section>
        ) : null}

        <Section title={phaseLabel}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-[color:var(--ui-text-muted)]">
              {selectedSignalView === "message"
                ? "Shift message signal start phase"
                : "Shift carrier start phase"}
            </div>
            <div className="rounded-full bg-[color:var(--ui-surface-highest)] px-3 py-1 text-xs text-[color:var(--ui-outline)]">
              {selectedOscillator.phase === 0 ? "Off" : "On"}
            </div>
          </div>
          <div className="rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-3 text-sm text-[color:var(--ui-outline)]">
            <div className="flex items-center gap-3">
              <span className="text-lg">R</span>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={selectedOscillator.phase}
                onChange={(event) => {
                  onPhaseChange(Number(event.target.value));
                }}
                className="w-full accent-[color:var(--ui-primary)]"
              />
              <span className="w-14 text-right font-mono">
                {selectedOscillator.phase.toFixed(0)} deg
              </span>
            </div>
          </div>
        </Section>

        <div className="space-y-3 border-t border-[color:var(--ui-outline-variant)] pt-6">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Revert to Default
          </button>
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
