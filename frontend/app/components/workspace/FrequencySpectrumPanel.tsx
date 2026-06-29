'use client';

import { useEffect, useMemo, useRef } from "react";

import type {
  PlotSettings,
  SignalSnapshot,
  SignalView,
  SpectrumDisplayMode,
} from "./types";

type FrequencySpectrumPanelProps = {
  spectra: Record<SignalView, SignalSnapshot | null>;
  selectedSignalView: SignalView;
  plotSettings: PlotSettings;
  spectrumDisplayMode: SpectrumDisplayMode;
};

const GRID_DIVISIONS = 10;
const MAX_RENDER_POINTS = 4096;
const SIGNAL_ORDER: SignalView[] = ["message", "carrier", "modulated"];

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "#1e293b";
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += width / GRID_DIVISIONS) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += height / GRID_DIVISIONS) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawSpectrum(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  samples: Float32Array,
  yScale: number,
  mode: SpectrumDisplayMode,
  strokeStyle: string,
  lineWidth: number
) {
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.beginPath();

  const stride = Math.max(1, Math.ceil(samples.length / MAX_RENDER_POINTS));
  const renderedPointCount = Math.ceil(samples.length / stride);
  const verticalRange = Math.max(yScale * GRID_DIVISIONS, 1e-6);

  let peakDb = -120;
  if (mode === "db") {
    for (let index = 0; index < samples.length; index += stride) {
      peakDb = Math.max(peakDb, 20 * Math.log10(Math.max(samples[index], 1e-6)));
    }
  }

  for (let pointIndex = 0; pointIndex < renderedPointCount; pointIndex += 1) {
    const sampleIndex = Math.min(pointIndex * stride, samples.length - 1);
    const x = (pointIndex / Math.max(renderedPointCount - 1, 1)) * width;

    let y = height;
    if (mode === "magnitude") {
      const normalizedMagnitude = Math.min(samples[sampleIndex] / verticalRange, 1);
      y = height - normalizedMagnitude * height;
    } else {
      const dbValue = 20 * Math.log10(Math.max(samples[sampleIndex], 1e-6));
      const relativeDb = Math.max(peakDb - dbValue, 0);
      y = Math.min((relativeDb / verticalRange) * height, height);
    }

    if (pointIndex === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}

function formatSpan(sampleRate: number | null) {
  if (!sampleRate || sampleRate <= 0) {
    return "SPAN: --";
  }

  return `SPAN: ${(-sampleRate / 2000).toFixed(1)} to ${(sampleRate / 2000).toFixed(1)} kHz`;
}

function formatScaleLabel(view: SignalView, plotSettings: PlotSettings, mode: SpectrumDisplayMode) {
  const scale = plotSettings[view].yScaleVoltsPerDivision;
  return mode === "magnitude"
    ? `${scale.toFixed(2)} mag/div`
    : `${scale.toFixed(1)} dB/div`;
}

function getSignalLabel(view: SignalView) {
  if (view === "message") {
    return "Message";
  }

  if (view === "carrier") {
    return "Carrier";
  }

  return "Modulated";
}

export default function FrequencySpectrumPanel({
  spectra,
  selectedSignalView,
  plotSettings,
  spectrumDisplayMode,
}: FrequencySpectrumPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const visibleSpectra = useMemo(() => {
    return SIGNAL_ORDER.map((view) => ({
      view,
      spectrum: plotSettings[view].visible ? spectra[view] : null,
    }));
  }, [plotSettings, spectra]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = canvas;
    drawGrid(context, width, height);

    let hasVisibleSpectrum = false;
    for (const item of visibleSpectra) {
      if (!item.spectrum || item.spectrum.samples.length === 0) {
        continue;
      }

      hasVisibleSpectrum = true;
      const isSelected = item.view === selectedSignalView;
      drawSpectrum(
        context,
        width,
        height,
        item.spectrum.samples,
        plotSettings[item.view].yScaleVoltsPerDivision,
        spectrumDisplayMode,
        isSelected ? "#60a5fa" : "rgba(148, 163, 184, 0.32)",
        isSelected ? 2.4 : 1.2
      );
    }

    if (!hasVisibleSpectrum) {
      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "14px Consolas";
      context.fillText("All spectra are hidden or unavailable.", 20, 28);
    }
  }, [plotSettings, selectedSignalView, spectrumDisplayMode, visibleSpectra]);

  const selectedSpectrum = spectra[selectedSignalView];

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          <span className="text-[color:var(--ui-tertiary)]">Frequency Spectrum</span>
          {SIGNAL_ORDER.map((view) => (
            <span
              key={view}
              className="flex items-center gap-2 normal-case tracking-normal text-xs font-medium"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    view === selectedSignalView
                      ? "#60a5fa"
                      : plotSettings[view].visible
                        ? "rgba(148, 163, 184, 0.32)"
                        : "rgba(71, 85, 105, 0.45)",
                }}
              />
              {getSignalLabel(view)}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-xs text-[color:var(--ui-text-muted)]">
          <button type="button">FFT</button>
          <button type="button">{spectrumDisplayMode === "magnitude" ? "Raw" : "dB"}</button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded border border-[color:var(--ui-outline)] bg-[#020617]">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="h-full w-full"
          aria-label="Frequency spectrum plot"
        />
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 text-[10px] font-mono text-white/60">
          <span>{formatSpan(selectedSpectrum?.sampleRate ?? null)}</span>
          <span>{formatScaleLabel(selectedSignalView, plotSettings, spectrumDisplayMode)}</span>
        </div>
      </div>
    </section>
  );
}
