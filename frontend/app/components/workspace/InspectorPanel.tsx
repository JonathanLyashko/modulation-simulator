'use client';

import { useState } from "react";
import type { ReactNode } from "react";

import type {
  AnalogAmplitudeScheme,
  FrequencyPlotSettings,
  MessageComponent,
  MessageComponentType,
  ModulatorSettings,
  OscillatorSettings,
  PlotSettings,
  SignalView,
  SpectrumDisplayMode,
} from "./types";

type InspectorPanelProps = {
  activeAmplitudeScheme: AnalogAmplitudeScheme;
  settings: ModulatorSettings;
  plotSettings: PlotSettings;
  frequencyPlotSettings: FrequencyPlotSettings;
  selectedSignalLabel: string;
  isAudioPlaying: boolean;
  audioStatus: string;
  messageComponents: MessageComponent[];
  collapsed: boolean;
  onCarrierAmplitudeChange: (value: number) => void;
  onCarrierFrequencyChange: (value: number) => void;
  onCarrierPhaseChange: (value: number) => void;
  onAddMessageComponent: (type: MessageComponentType) => void;
  onUpdateMessageComponent: (
    componentId: string,
    field: "amplitude" | "frequency" | "phase",
    value: number
  ) => void;
  onRemoveMessageComponent: (componentId: string) => void;
  onModulationIndexChange: (value: number) => void;
  onPlotSignalVisibilityChange: (view: SignalView, visible: boolean) => void;
  onPlotSignalXScaleChange: (view: SignalView, value: number) => void;
  onPlotSignalYScaleChange: (view: SignalView, value: number) => void;
  onFrequencyPlotCenterChange: (value: number) => void;
  onFrequencyPlotSpanChange: (value: number) => void;
  onFrequencyPlotYScaleChange: (value: number) => void;
  spectrumDisplayMode: SpectrumDisplayMode;
  onSpectrumDisplayModeChange: (mode: SpectrumDisplayMode) => void;
  onResetSignals: () => void;
  onResetPlot: () => void;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  onToggleCollapsed: () => void;
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

function FrequencyPlotSettingsSection({
  frequencyPlotSettings,
  spectrumDisplayMode,
  onCenterChange,
  onSpanChange,
  onYScaleChange,
  onSpectrumDisplayModeChange,
}: {
  frequencyPlotSettings: FrequencyPlotSettings;
  spectrumDisplayMode: SpectrumDisplayMode;
  onCenterChange: (value: number) => void;
  onSpanChange: (value: number) => void;
  onYScaleChange: (value: number) => void;
  onSpectrumDisplayModeChange: (mode: SpectrumDisplayMode) => void;
}) {
  const frequencyPerDivision = frequencyPlotSettings.spanHz / 10;

  return (
    <div className="space-y-4 rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white p-3">
      <div className="text-sm font-medium text-[color:var(--ui-text)]">
        FFT Display
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onSpectrumDisplayModeChange("magnitude");
          }}
          className={[
            "rounded-[2px] border px-3 py-2 text-sm font-medium transition-colors",
            spectrumDisplayMode === "magnitude"
              ? "border-[color:var(--ui-primary)] bg-[color:var(--ui-primary)] text-white"
              : "border-[color:var(--ui-outline-variant)] bg-white text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]",
          ].join(" ")}
        >
          Raw Magnitude
        </button>
        <button
          type="button"
          onClick={() => {
            onSpectrumDisplayModeChange("db");
          }}
          className={[
            "rounded-[2px] border px-3 py-2 text-sm font-medium transition-colors",
            spectrumDisplayMode === "db"
              ? "border-[color:var(--ui-primary)] bg-[color:var(--ui-primary)] text-white"
              : "border-[color:var(--ui-outline-variant)] bg-white text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]",
          ].join(" ")}
        >
          dB
        </button>
      </div>
      <RangeField
        title="Span"
        valueLabel={`${frequencyPlotSettings.spanHz.toFixed(0)} Hz`}
        min={100}
        max={20000}
        step={50}
        value={frequencyPlotSettings.spanHz}
        onChange={onSpanChange}
      />
      <RangeField
        title="Center"
        valueLabel={`${frequencyPlotSettings.centerHz.toFixed(0)} Hz`}
        min={-20000}
        max={20000}
        step={50}
        value={frequencyPlotSettings.centerHz}
        onChange={onCenterChange}
      />
      <RangeField
        title="Frequency / Div"
        valueLabel={`${frequencyPerDivision.toFixed(0)} Hz/div`}
        min={10}
        max={2000}
        step={5}
        value={frequencyPerDivision}
        onChange={(value) => {
          onSpanChange(value * 10);
        }}
      />
      <RangeField
        title="Y Axis Scale"
        valueLabel={
          spectrumDisplayMode === "magnitude"
            ? `${frequencyPlotSettings.yScale.toFixed(2)} mag/div`
            : `${frequencyPlotSettings.yScale.toFixed(1)} dB/div`
        }
        min={spectrumDisplayMode === "magnitude" ? 0.02 : 1}
        max={spectrumDisplayMode === "magnitude" ? 2 : 40}
        step={spectrumDisplayMode === "magnitude" ? 0.02 : 1}
        value={frequencyPlotSettings.yScale}
        onChange={onYScaleChange}
      />
    </div>
  );
}

function MessageExpressionSummary({
  messageComponents,
}: {
  messageComponents: MessageComponent[];
}) {
  return (
    <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-text-muted)]">
        Message Expression
      </div>
      {messageComponents.length === 0 ? (
        <div className="mt-3 font-serif text-lg text-[color:var(--ui-text)]">
          m(t) = 0
        </div>
      ) : (
        <>
          <div className="mt-3 space-y-1 font-serif text-[color:var(--ui-text)]">
            {messageComponents.map((component, index) => {
              const sign = component.amplitude < 0 ? "-" : "+";
              const magnitude = Math.abs(component.amplitude).toFixed(2);
              const basis = component.type === "sine" ? "sin" : "cos";
              const sizeClass =
                index === 0
                  ? "text-[1.02rem]"
                  : index === 1
                    ? "text-[0.95rem]"
                    : index === 2
                      ? "text-[0.88rem]"
                      : "text-[0.81rem]";

              return (
                <div
                  key={component.id}
                  className={`flex items-start gap-2 leading-7 ${sizeClass}`}
                >
                  <span className="w-12 shrink-0 text-right">
                    {index === 0 ? (
                      <>
                        <span className="italic">m</span>
                        <span>(t) =</span>
                      </>
                    ) : (
                      sign
                    )}
                  </span>
                  <span className="min-w-0 break-words">
                    <span>{magnitude}</span>
                    <span className="ml-1 italic">{basis}</span>
                    <span>(2π</span>
                    <span className="italic">f</span>
                    <sub>{index + 1}</sub>
                    <span>t</span>
                    {component.phase !== 0 ? (
                      <>
                        <span> + </span>
                        <span>φ</span>
                        <sub>{index + 1}</sub>
                      </>
                    ) : null}
                    <span>)</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid gap-y-1 text-xs text-[color:var(--ui-text-muted)]">
            {messageComponents.map((component, index) => (
              <span key={component.id}>
                <span className="font-mono">f{index + 1}</span>
                <span>
                  {" "}
                  = {component.frequency.toFixed(component.frequency < 10 ? 1 : 0)} Hz,
                  {" "}φ{index + 1} = {component.phase.toFixed(0)}°
                </span>
              </span>
            ))}
          </div>
        </>
      )}
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
  defaultExpanded = false,
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

function MessageComponentEditor({
  component,
  canRemove,
  onUpdate,
  onRemove,
}: {
  component: MessageComponent;
  canRemove: boolean;
  onUpdate: (
    componentId: string,
    field: "amplitude" | "frequency" | "phase",
    value: number
  ) => void;
  onRemove: (componentId: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color:var(--ui-primary)]/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-primary)]">
            {component.type}
          </span>
          <span className="text-sm font-medium text-[color:var(--ui-text)]">
            {component.type === "sine" ? "Sine Component" : "Cosine Component"}
          </span>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={() => {
              onRemove(component.id);
            }}
            className="rounded-[2px] border border-[color:var(--ui-outline-variant)] px-2 py-1 text-xs font-medium text-[color:var(--ui-text-muted)] hover:bg-[color:var(--ui-surface-high)]"
          >
            Remove
          </button>
        ) : null}
      </div>

      <RangeField
        title="Frequency"
        valueLabel={`${component.frequency.toFixed(component.frequency < 10 ? 1 : 0)} Hz`}
        min={0.1}
        max={5000}
        step={0.1}
        value={component.frequency}
        onChange={(value) => {
          onUpdate(component.id, "frequency", value);
        }}
      />
      <RangeField
        title="Magnitude"
        valueLabel={component.amplitude.toFixed(2)}
        min={0}
        max={2}
        step={0.05}
        value={component.amplitude}
        onChange={(value) => {
          onUpdate(component.id, "amplitude", value);
        }}
      />
      <RangeField
        title="Phase Offset"
        valueLabel={`${component.phase.toFixed(0)} deg`}
        min={0}
        max={360}
        step={5}
        value={component.phase}
        onChange={(value) => {
          onUpdate(component.id, "phase", value);
        }}
      />
    </div>
  );
}

function PlotSignalSettingsSection({
  title,
  view,
  visible,
  xScaleSecondsPerDivision,
  yScaleVoltsPerDivision,
  onVisibilityChange,
  onXScaleChange,
  onYScaleChange,
}: {
  title: string;
  view: SignalView;
  visible: boolean;
  xScaleSecondsPerDivision: number;
  yScaleVoltsPerDivision: number;
  onVisibilityChange: (view: SignalView, visible: boolean) => void;
  onXScaleChange: (view: SignalView, value: number) => void;
  onYScaleChange: (view: SignalView, value: number) => void;
}) {
  return (
    <div className="space-y-4 rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[color:var(--ui-text)]">{title}</span>
        <label className="flex items-center gap-2 text-xs text-[color:var(--ui-text-muted)]">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => {
              onVisibilityChange(view, event.target.checked);
            }}
            className="accent-[color:var(--ui-primary)]"
          />
          Show
        </label>
      </div>
      <RangeField
        title="X Axis Scale"
        valueLabel={`${(xScaleSecondsPerDivision * 1000).toFixed(2)} ms/div`}
        min={0.0005}
        max={0.05}
        step={0.0005}
        value={xScaleSecondsPerDivision}
        onChange={(value) => {
          onXScaleChange(view, value);
        }}
      />
      <RangeField
        title="Y Axis Scale"
        valueLabel={`${yScaleVoltsPerDivision.toFixed(2)} V/div`}
        min={0.05}
        max={2}
        step={0.05}
        value={yScaleVoltsPerDivision}
        onChange={(value) => {
          onYScaleChange(view, value);
        }}
      />
    </div>
  );
}

export default function InspectorPanel({
  activeAmplitudeScheme,
  settings,
  plotSettings,
  frequencyPlotSettings,
  selectedSignalLabel,
  isAudioPlaying,
  audioStatus,
  messageComponents,
  collapsed,
  onCarrierAmplitudeChange,
  onCarrierFrequencyChange,
  onCarrierPhaseChange,
  onAddMessageComponent,
  onUpdateMessageComponent,
  onRemoveMessageComponent,
  onModulationIndexChange,
  onPlotSignalVisibilityChange,
  onPlotSignalXScaleChange,
  onPlotSignalYScaleChange,
  onFrequencyPlotCenterChange,
  onFrequencyPlotSpanChange,
  onFrequencyPlotYScaleChange,
  spectrumDisplayMode,
  onSpectrumDisplayModeChange,
  onResetSignals,
  onResetPlot,
  onPlayAudio,
  onStopAudio,
  onToggleCollapsed,
}: InspectorPanelProps) {
  const supportsModulationIndex = activeAmplitudeScheme === "DSB-LC";

  if (collapsed) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center border-l border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)] py-4">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-text)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
          aria-label="Expand right sidebar"
          title="Expand inspector"
        >
          &lt;
        </button>
        <div className="rounded-[8px] border border-[color:var(--ui-outline-variant)] bg-white px-2 py-3 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ui-outline)]">
            DSP
          </div>
          <div className="mt-2 [writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-text-muted)]">
            Inspector
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-l border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-low)]">
      <div className="flex items-center justify-between border-b border-[color:var(--ui-outline-variant)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-tight">
          {activeAmplitudeScheme} Parameters
        </h2>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white text-lg text-[color:var(--ui-outline)] transition-colors hover:bg-[color:var(--ui-surface-lowest)]"
          aria-label="Collapse right sidebar"
          title="Collapse inspector"
        >
          &gt;
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
          <MessageExpressionSummary messageComponents={messageComponents} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onAddMessageComponent("sine");
              }}
              className="flex-1 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]"
            >
              Add Sine
            </button>
            <button
              type="button"
              onClick={() => {
                onAddMessageComponent("cosine");
              }}
              className="flex-1 rounded-[2px] border border-[color:var(--ui-outline-variant)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-high)]"
            >
              Add Cosine
            </button>
          </div>
          <div className="space-y-3">
            {messageComponents.map((component) => (
              <MessageComponentEditor
                key={component.id}
                component={component}
                canRemove={messageComponents.length > 1}
                onUpdate={onUpdateMessageComponent}
                onRemove={onRemoveMessageComponent}
              />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Modulator Settings">
          {supportsModulationIndex ? (
            <RangeField
              title="Modulation Index"
              valueLabel={`a = ${settings.modulationIndex.toFixed(2)}`}
              min={0}
              max={1.5}
              step={0.05}
              value={settings.modulationIndex}
              onChange={onModulationIndexChange}
            />
          ) : (
            <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white px-3 py-3 text-sm leading-6 text-[color:var(--ui-text-muted)]">
              <div className="font-medium text-[color:var(--ui-text)]">
                Suppressed carrier mode
              </div>
              <div className="mt-2 font-mono text-xs text-[color:var(--ui-outline)]">
                u_DSB-SC(t) = A_c m(t) cos(2pi f_c t)
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onResetSignals}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Revert Signal Defaults
          </button>
        </CollapsibleSection>

        <CollapsibleSection title="Time Domain Settings">
          <PlotSignalSettingsSection
            title="Message Signal"
            view="message"
            visible={plotSettings.message.visible}
            xScaleSecondsPerDivision={plotSettings.message.xScaleSecondsPerDivision}
            yScaleVoltsPerDivision={plotSettings.message.yScaleVoltsPerDivision}
            onVisibilityChange={onPlotSignalVisibilityChange}
            onXScaleChange={onPlotSignalXScaleChange}
            onYScaleChange={onPlotSignalYScaleChange}
          />
          <PlotSignalSettingsSection
            title="Carrier Signal"
            view="carrier"
            visible={plotSettings.carrier.visible}
            xScaleSecondsPerDivision={plotSettings.carrier.xScaleSecondsPerDivision}
            yScaleVoltsPerDivision={plotSettings.carrier.yScaleVoltsPerDivision}
            onVisibilityChange={onPlotSignalVisibilityChange}
            onXScaleChange={onPlotSignalXScaleChange}
            onYScaleChange={onPlotSignalYScaleChange}
          />
          <PlotSignalSettingsSection
            title="Modulated Signal"
            view="modulated"
            visible={plotSettings.modulated.visible}
            xScaleSecondsPerDivision={plotSettings.modulated.xScaleSecondsPerDivision}
            yScaleVoltsPerDivision={plotSettings.modulated.yScaleVoltsPerDivision}
            onVisibilityChange={onPlotSignalVisibilityChange}
            onXScaleChange={onPlotSignalXScaleChange}
            onYScaleChange={onPlotSignalYScaleChange}
          />
          <button
            type="button"
            onClick={onResetPlot}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Reset Plot Settings
          </button>
        </CollapsibleSection>

        <CollapsibleSection title="Frequency Plot Settings">
          <FrequencyPlotSettingsSection
            frequencyPlotSettings={frequencyPlotSettings}
            spectrumDisplayMode={spectrumDisplayMode}
            onCenterChange={onFrequencyPlotCenterChange}
            onSpanChange={onFrequencyPlotSpanChange}
            onYScaleChange={onFrequencyPlotYScaleChange}
            onSpectrumDisplayModeChange={onSpectrumDisplayModeChange}
          />
          <button
            type="button"
            onClick={onResetPlot}
            className="w-full rounded-[2px] border border-[color:var(--ui-outline-variant)] px-4 py-2 text-sm font-medium text-[color:var(--ui-text-muted)] transition-colors hover:bg-[color:var(--ui-surface-high)]"
          >
            Reset Plot Settings
          </button>
        </CollapsibleSection>

        <CollapsibleSection title="Audio Preview">
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
