'use client';

import { useEffect, useMemo, useRef } from "react";

import type { PlotSettings } from "./types";

type TimeDomainPanelProps = {
  samples: Float32Array | null;
  sampleRate: number | null;
  signalLabel: string;
  plotSettings: PlotSettings;
  playbackCursorSeconds: number | null;
};

const MAX_RENDER_POINTS = 4096;
const GRID_DIVISIONS = 10;

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
  samples: Float32Array | null,
  yScaleVoltsPerDivision: number
) {
  if (!samples || samples.length === 0) {
    context.fillStyle = "rgba(148, 163, 184, 0.85)";
    context.font = "14px Consolas";
    context.fillText("Waiting for signal data...", 20, 28);
    return;
  }

  const verticalHalfRangeVolts = yScaleVoltsPerDivision * (GRID_DIVISIONS / 2);

  context.strokeStyle = "#60a5fa";
  context.lineWidth = 2;
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
    ((cursorSeconds % visibleDurationSeconds) + visibleDurationSeconds) %
    visibleDurationSeconds /
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

export default function TimeDomainPanel({
  samples,
  sampleRate,
  signalLabel,
  plotSettings,
  playbackCursorSeconds,
}: TimeDomainPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayedSamples = useMemo(() => {
    if (!samples || !sampleRate) {
      return samples;
    }

    const requestedSampleCount = Math.max(
      1,
      Math.floor(
        sampleRate * plotSettings.xScaleSecondsPerDivision * GRID_DIVISIONS
      )
    );

    return samples.slice(0, Math.min(samples.length, requestedSampleCount));
  }, [plotSettings.xScaleSecondsPerDivision, sampleRate, samples]);
  const visibleDurationSeconds =
    sampleRate && displayedSamples ? displayedSamples.length / sampleRate : 0;

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
    drawWaveform(
      context,
      width,
      height,
      displayedSamples,
      plotSettings.yScaleVoltsPerDivision
    );
    drawPlaybackCursor(
      context,
      width,
      height,
      playbackCursorSeconds,
      visibleDurationSeconds
    );
  }, [
    displayedSamples,
    playbackCursorSeconds,
    plotSettings.yScaleVoltsPerDivision,
    visibleDurationSeconds,
  ]);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          <span className="h-3 w-3 rounded-full bg-[color:var(--ui-primary)]" />
          {signalLabel}
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
        <div className="absolute bottom-2 right-2 flex gap-4 text-[10px] font-mono text-white/60">
          <span>{formatTimePerDivision(plotSettings.xScaleSecondsPerDivision)}</span>
          <span>{formatVoltsPerDivision(plotSettings.yScaleVoltsPerDivision)}</span>
        </div>
      </div>
    </section>
  );
}
