'use client';

import { useState } from "react";
import type { ReactNode } from "react";

import type { ModulatorSettings, OscillatorSettings, PlotSettings } from "./types";

type InspectorPanelProps = {
  settings: ModulatorSettings;
  plotSettings: PlotSettings;
  selectedSignalLabel: string;
  isAudioPlaying: boolean;
  audioStatus: string;
  onCarrierAmplitudeChange: (value: number) => void;
  onCarrierFrequencyChange: (value: number) => void;
  onCarrierPhaseChange: (value: number) => void;
  onMessageAmplitudeChange: (value: number) => void;
  onMessageFrequencyChange: (value: number) => void;
  onMessagePhaseChange: (value: number) => void;
  onModulationIndexChange: (value: number) => void;
  onPlotXScaleChange: (value: number) => void;
  onPlotYScaleChange: (value: number) => void;
  onResetSignals: () => void;
  onResetPlot: () => void;
  onPlayAudio: () => void;
  onStopAudio: () => void;
};

function RangeField({
  title,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  title: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[color:var(--ui-text-muted)]">{title}</span>
        <span className="rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-2 py-0.5 font-mono text-sm">
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="w-full accent-[color:var(--ui-primary)]"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-2 text-center font-mono"
      />
    </div>
  );
}

function AmplitudeGauge({
  amplitude,
  onChange,
}: {
  amplitude: number;
  onChange: (value: number) => void;
}) {
  const amplitudePercent = Math.max(0, Math.min(100, (amplitude / 2) * 100));

  return (
    <div className="space-y-3">
      <div className="text-sm text-[color:var(--ui-text-muted)]">Amplitude (Peak)</div>
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
              {amplitude.toFixed(2)}
            </span>
            <span className="text-[11px] text-[color:var(--ui-outline)]">Volts</span>
          </div>
        </div>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.05"
          value={amplitude}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="w-full accent-[color:var(--ui-primary)]"
        />
        <input
          type="number"
          min="0.1"
          max="2"
          step="0.05"
          value={amplitude}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
          className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] px-3 py-2 text-center font-mono"
        />
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultExpanded = true,
  children,
}: {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)]">
      <button
        type="button"
        onClick={() => {
          setExpanded((current) => !current);
        }}
        className="flex w-full items-center justify-between border-b border-[color:var(--ui-outline-variant)] px-4 py-3 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
          {title}
        </span>
        <span className="font-mono text-sm text-[color:var(--ui-outline)]">
          {expanded ? "-" : "+"}
        </span>
      </button>
      {expanded ? <div className="space-y-5 p-4">{children}</div> : null}
    </section>
  );
}

function OscillatorSection({
  settings,
  frequencyRange,
  frequencyStep,
  onAmplitudeChange,
  onFrequencyChange,
  onPhaseChange,
}: {
  settings: OscillatorSettings;
  frequencyRange: { min: number; max: number };
  frequencyStep: number;
  onAmplitudeChange: (value: number) => void;
  onFrequencyChange: (value: number) => void;
  onPhaseChange: (value: number) => void;
}) {
  return (
    <>
      <RangeField
        title="Frequency"
        valueLabel={`${settings.frequency.toFixed(settings.frequency < 10 ? 1 : 0)} Hz`}
        min={frequencyRange.min}
        max={frequencyRange.max}
        step={frequencyStep}
        value={settings.frequency}
        onChange={onFrequencyChange}
      />
      <AmplitudeGauge amplitude={settings.amplitude} onChange={onAmplitudeChange} />
      <RangeField
        title="Phase Offset"
        valueLabel={`${settings.phase.toFixed(0)} deg`}
        min={0}
        max={360}
        step={5}
        value={settings.phase}
        onChange={onPhaseChange}
      />
    </>
  );
}

export default function InspectorPanel({
  settings,
  plotSettings,
  selectedSignalLabel,
  isAudioPlaying,
  audioStatus,
  onCarrierAmplitudeChange,
  onCarrierFrequencyChange,
  onCarrierPhaseChange,
  onMessageAmplitudeChange,
  onMessageFrequencyChange,
  onMessagePhaseChange,
  onModulationIndexChange,
  onPlotXScaleChange,
  onPlotYScaleChange,
  onResetSignals,
  onResetPlot,
  onPlayAudio,
  onStopAudio,
}: InspectorPanelProps) {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)]">
      <div className="flex items-center justify-between border-b border-[color:var(--ui-outline-variant)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-tight">
          DSB-LC Parameters
        </h2>
        <button type="button" className="rounded p-1 text-[color:var(--ui-outline)]">
          i
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <CollapsibleSection title="Carrier Settings">
          <OscillatorSection
            settings={settings.carrier}
            frequencyRange={{ min: 100, max: 5000 }}
            frequencyStep={50}
            onAmplitudeChange={onCarrierAmplitudeChange}
            onFrequencyChange={onCarrierFrequencyChange}
            onPhaseChange={onCarrierPhaseChange}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Message Settings">
          <OscillatorSection
            settings={settings.message}
            frequencyRange={{ min: 0.1, max: 5000 }}
            frequencyStep={0.1}
            onAmplitudeChange={onMessageAmplitudeChange}
            onFrequencyChange={onMessageFrequencyChange}
            onPhaseChange={onMessagePhaseChange}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Modulator Settings">
          <RangeField
            title="Modulation Index"
            valueLabel={`a = ${settings.modulationIndex.toFixed(2)}`}
            min={0}
            max={1.5}
            step={0.05}
            value={settings.modulationIndex}
            onChange={onModulationIndexChange}
          />
          <button
            type="button"
            onClick={onResetSignals}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Revert Signal Defaults
          </button>
        </CollapsibleSection>

        <CollapsibleSection title="Graph Settings">
          <RangeField
            title="X Axis Scale"
            valueLabel={`${(plotSettings.xScaleSecondsPerDivision * 1000).toFixed(2)} ms/div`}
            min={0.0005}
            max={0.05}
            step={0.0005}
            value={plotSettings.xScaleSecondsPerDivision}
            onChange={onPlotXScaleChange}
          />
          <RangeField
            title="Y Axis Scale"
            valueLabel={`${plotSettings.yScaleVoltsPerDivision.toFixed(2)} V/div`}
            min={0.05}
            max={2}
            step={0.05}
            value={plotSettings.yScaleVoltsPerDivision}
            onChange={onPlotYScaleChange}
          />
          <button
            type="button"
            onClick={onResetPlot}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Reset Plot Settings
          </button>
        </CollapsibleSection>

        <CollapsibleSection title="Audio Preview" defaultExpanded={false}>
          <div className="space-y-3">
            <div className="rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
                Active Signal
              </div>
              <div className="mt-2 font-mono text-sm text-[color:var(--ui-text)]">
                {selectedSignalLabel}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPlayAudio}
                className="flex-1 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Play
              </button>
              <button
                type="button"
                onClick={onStopAudio}
                className="flex-1 rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
              >
                Stop
              </button>
            </div>
            <div className="text-sm text-[color:var(--ui-text-muted)]">
              Status: {isAudioPlaying ? "Playing" : audioStatus}
            </div>
          </div>
        </CollapsibleSection>
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
