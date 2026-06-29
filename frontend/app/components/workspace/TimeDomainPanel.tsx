'use client';

import { useEffect, useMemo, useRef } from "react";

import type { PlotSettings, SignalSnapshot, SignalView } from "./types";

type TimeDomainPanelProps = {
  signals: Record<SignalView, SignalSnapshot | null>;
  selectedSignalView: SignalView;
  plotSettings: PlotSettings;
  playbackCursorSeconds: number | null;
};

const MAX_RENDER_POINTS = 4096;
const GRID_DIVISIONS = 10;
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

function drawWaveform(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  samples: Float32Array,
  yScaleVoltsPerDivision: number,
  strokeStyle: string,
  lineWidth: number
) {
  const verticalHalfRangeVolts = yScaleVoltsPerDivision * (GRID_DIVISIONS / 2);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.beginPath();

  const stride = Math.max(1, Math.ceil(samples.length / MAX_RENDER_POINTS));
  const renderedPointCount = Math.ceil(samples.length / stride);

  for (let pointIndex = 0; pointIndex < renderedPointCount; pointIndex += 1) {
    const sampleIndex = Math.min(pointIndex * stride, samples.length - 1);
    const x = (pointIndex / Math.max(renderedPointCount - 1, 1)) * width;
    const normalizedAmplitude = samples[sampleIndex] / verticalHalfRangeVolts;
    const y = height * 0.5 - normalizedAmplitude * (height * 0.5);

    if (pointIndex === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}

function drawPlaybackCursor(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  cursorSeconds: number | null,
  visibleDurationSeconds: number
) {
  if (cursorSeconds === null || visibleDurationSeconds <= 0) {
    return;
  }

  const normalizedX =
    (((cursorSeconds % visibleDurationSeconds) + visibleDurationSeconds) %
      visibleDurationSeconds) /
    visibleDurationSeconds;
  const x = normalizedX * width;

  context.strokeStyle = "#f59e0b";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, 0);
  context.lineTo(x, height);
  context.stroke();
}

function formatTimePerDivision(secondsPerDivision: number) {
  if (secondsPerDivision >= 1) {
    return `T: ${secondsPerDivision.toFixed(2)} s/div`;
  }

  if (secondsPerDivision >= 0.001) {
    return `T: ${(secondsPerDivision * 1000).toFixed(2)} ms/div`;
  }

  return `T: ${(secondsPerDivision * 1_000_000).toFixed(1)} us/div`;
}

function formatVoltsPerDivision(voltsPerDivision: number) {
  return `V: ${voltsPerDivision.toFixed(2)} V/div`;
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

export default function TimeDomainPanel({
  signals,
  selectedSignalView,
  plotSettings,
  playbackCursorSeconds,
}: TimeDomainPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayedSignals = useMemo(() => {
    return SIGNAL_ORDER.map((view) => {
      const signal = signals[view];
      const settings = plotSettings[view];

      if (!signal || !settings.visible) {
        return {
          view,
          samples: null,
          sampleRate: null,
          xScaleSecondsPerDivision: settings.xScaleSecondsPerDivision,
          yScaleVoltsPerDivision: settings.yScaleVoltsPerDivision,
        };
      }

      const requestedSampleCount = Math.max(
        1,
        Math.floor(signal.sampleRate * settings.xScaleSecondsPerDivision * GRID_DIVISIONS)
      );

      return {
        view,
        samples: signal.samples.slice(0, Math.min(signal.samples.length, requestedSampleCount)),
        sampleRate: signal.sampleRate,
        xScaleSecondsPerDivision: settings.xScaleSecondsPerDivision,
        yScaleVoltsPerDivision: settings.yScaleVoltsPerDivision,
      };
    });
  }, [plotSettings, signals]);

  const selectedVisibleDurationSeconds = useMemo(() => {
    const selectedSignal = displayedSignals.find(
      (signal) => signal.view === selectedSignalView
    );

    if (!selectedSignal?.samples || !selectedSignal.sampleRate) {
      return 0;
    }

    return selectedSignal.samples.length / selectedSignal.sampleRate;
  }, [displayedSignals, selectedSignalView]);

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

    let hasVisibleSignal = false;
    for (const signal of displayedSignals) {
      if (!signal.samples || signal.samples.length === 0) {
        continue;
      }

      hasVisibleSignal = true;
      const isSelected = signal.view === selectedSignalView;
      drawWaveform(
        context,
        width,
        height,
        signal.samples,
        signal.yScaleVoltsPerDivision,
        isSelected ? "#60a5fa" : "rgba(148, 163, 184, 0.32)",
        isSelected ? 2.4 : 1.2
      );
    }

    if (!hasVisibleSignal) {
      context.fillStyle = "rgba(148, 163, 184, 0.85)";
      context.font = "14px Consolas";
      context.fillText("All signals are hidden or unavailable.", 20, 28);
    }

    drawPlaybackCursor(
      context,
      width,
      height,
      playbackCursorSeconds,
      selectedVisibleDurationSeconds
    );
  }, [displayedSignals, playbackCursorSeconds, selectedSignalView, selectedVisibleDurationSeconds]);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          <span className="text-[color:var(--ui-primary)]">Time Domain</span>
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
          <button type="button">+</button>
          <button type="button">Grid</button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded border border-[color:var(--ui-outline)] bg-[#020617]">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="h-full w-full"
          aria-label="Signal waveform plot"
        />
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 text-[10px] font-mono text-white/60">
          <span>{formatTimePerDivision(plotSettings[selectedSignalView].xScaleSecondsPerDivision)}</span>
          <span>{formatVoltsPerDivision(plotSettings[selectedSignalView].yScaleVoltsPerDivision)}</span>
        </div>
      </div>
    </section>
  );
}
