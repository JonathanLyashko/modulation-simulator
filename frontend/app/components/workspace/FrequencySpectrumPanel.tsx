'use client';

import { useEffect, useMemo, useRef } from "react";

import type {
  FrequencyPlotSettings,
  PlotSettings,
  SignalSnapshot,
  SignalView,
  SpectrumDisplayMode,
} from "./types";

type FrequencySpectrumPanelProps = {
  spectra: Record<SignalView, SignalSnapshot | null>;
  selectedSignalView: SignalView;
  plotSettings: PlotSettings;
  frequencyPlotSettings: FrequencyPlotSettings;
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
  sampleRate: number,
  centerHz: number,
  spanHz: number,
  yScale: number,
  mode: SpectrumDisplayMode,
  strokeStyle: string,
  lineWidth: number
) {
  const frequencyPerSample = sampleRate / samples.length;
  const minFrequency = centerHz - spanHz / 2;
  const maxFrequency = centerHz + spanHz / 2;
  const minIndex = Math.max(
    0,
    Math.floor((minFrequency + sampleRate / 2) / frequencyPerSample)
  );
  const maxIndex = Math.min(
    samples.length - 1,
    Math.ceil((maxFrequency + sampleRate / 2) / frequencyPerSample)
  );

  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.beginPath();

  const visibleSampleCount = Math.max(1, maxIndex - minIndex + 1);
  const stride = Math.max(1, Math.ceil(visibleSampleCount / MAX_RENDER_POINTS));
  const renderedPointCount = Math.ceil(visibleSampleCount / stride);
  const verticalRange = Math.max(yScale * GRID_DIVISIONS, 1e-6);
  const renderDiscreteBins = renderedPointCount <= 160;
  const points: Array<{ x: number; y: number }> = [];
  const dbValues: number[] = [];

  let peakDb = -120;
  if (mode === "db") {
    for (let index = minIndex; index <= maxIndex; index += stride) {
      const dbValue = 20 * Math.log10(Math.max(samples[index], 1e-6));
      dbValues.push(dbValue);
      peakDb = Math.max(peakDb, dbValue);
    }
  }
  let topDb = peakDb + yScale;
  let bottomDb = topDb - verticalRange;
  if (mode === "db" && dbValues.length > 0) {
    const sortedDbValues = [...dbValues].sort((left, right) => left - right);
    const floorIndex = Math.max(
      0,
      Math.min(sortedDbValues.length - 1, Math.floor((sortedDbValues.length - 1) * 0.15))
    );
    const floorDb = sortedDbValues[floorIndex];
    const contentCenterDb = (peakDb + floorDb) / 2;
    topDb = contentCenterDb + verticalRange / 2;
    bottomDb = contentCenterDb - verticalRange / 2;
  }

  for (let pointIndex = 0; pointIndex < renderedPointCount; pointIndex += 1) {
    const sampleIndex = Math.min(minIndex + pointIndex * stride, maxIndex);
    const frequency = sampleIndex * frequencyPerSample - sampleRate / 2;
    const x = ((frequency - minFrequency) / spanHz) * width;

    let y = height;
    if (mode === "magnitude") {
      const normalizedMagnitude = Math.min(samples[sampleIndex] / verticalRange, 1);
      y = height - normalizedMagnitude * height;
    } else {
      const dbValue = 20 * Math.log10(Math.max(samples[sampleIndex], 1e-6));
      const normalizedDb =
        (topDb - dbValue) / Math.max(topDb - bottomDb, 1e-6);
      y = Math.min(Math.max(normalizedDb * height, 0), height);
    }

    points.push({ x, y });

    if (pointIndex === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();

  if (renderDiscreteBins) {
    context.save();
    context.strokeStyle = strokeStyle;
    context.fillStyle = strokeStyle;
    context.lineWidth = Math.max(1, lineWidth * 0.75);

    for (const point of points) {
      context.beginPath();
      context.moveTo(point.x, height);
      context.lineTo(point.x, point.y);
      context.stroke();

      context.beginPath();
      context.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }
}

function formatSpan(spanHz: number) {
  if (spanHz >= 1000) {
    return `SPAN: ${(spanHz / 1000).toFixed(2)} kHz`;
  }

  return `SPAN: ${spanHz.toFixed(0)} Hz`;
}

function formatCenter(centerHz: number) {
  if (Math.abs(centerHz) >= 1000) {
    return `CENTER: ${(centerHz / 1000).toFixed(2)} kHz`;
  }

  return `CENTER: ${centerHz.toFixed(0)} Hz`;
}

function formatFrequencyPerDivision(spanHz: number) {
  const frequencyPerDivision = spanHz / GRID_DIVISIONS;
  if (frequencyPerDivision >= 1000) {
    return `F: ${(frequencyPerDivision / 1000).toFixed(2)} kHz/div`;
  }

  return `F: ${frequencyPerDivision.toFixed(0)} Hz/div`;
}

function formatScaleLabel(yScale: number, mode: SpectrumDisplayMode) {
  return mode === "magnitude"
    ? `${yScale.toFixed(2)} mag/div`
    : `${yScale.toFixed(1)} dB/div`;
}

function formatResolutionLabel(sampleRate: number, fftSize: number) {
  return `RBW: ${(sampleRate / fftSize).toFixed(2)} Hz`;
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
  frequencyPlotSettings,
  spectrumDisplayMode,
}: FrequencySpectrumPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const referenceSampleRate =
    spectra[selectedSignalView]?.sampleRate ??
    spectra.modulated?.sampleRate ??
    spectra.carrier?.sampleRate ??
    spectra.message?.sampleRate ??
    48_000;

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
        item.spectrum.sampleRate,
        frequencyPlotSettings.centerHz,
        frequencyPlotSettings.spanHz,
        frequencyPlotSettings.yScale,
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
  }, [frequencyPlotSettings, plotSettings, selectedSignalView, spectrumDisplayMode, visibleSpectra]);

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
          <span>{formatSpan(frequencyPlotSettings.spanHz)}</span>
          <span>{formatCenter(frequencyPlotSettings.centerHz)}</span>
          <span>{formatFrequencyPerDivision(frequencyPlotSettings.spanHz)}</span>
          <span>
            {formatResolutionLabel(
              referenceSampleRate,
              frequencyPlotSettings.fftSize
            )}
          </span>
          <span>{formatScaleLabel(frequencyPlotSettings.yScale, spectrumDisplayMode)}</span>
        </div>
      </div>
    </section>
  );
}
