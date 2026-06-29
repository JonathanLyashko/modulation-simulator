'use client';

import { useEffect, useRef } from "react";

type TimeDomainPanelProps = {
  samples: Float32Array | null;
};

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.fillStyle = "#020617";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "#1e293b";
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += 40) {
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
  samples: Float32Array | null
) {
  if (!samples || samples.length === 0) {
    context.fillStyle = "rgba(148, 163, 184, 0.85)";
    context.font = "14px Consolas";
    context.fillText("Waiting for carrier data...", 20, 28);
    return;
  }

  context.strokeStyle = "#60a5fa";
  context.lineWidth = 2;
  context.beginPath();

  for (let index = 0; index < samples.length; index += 1) {
    const x = (index / Math.max(samples.length - 1, 1)) * width;
    const y = height * 0.5 - samples[index] * (height * 0.38);

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}

export default function TimeDomainPanel({ samples }: TimeDomainPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    drawWaveform(context, width, height, samples);
  }, [samples]);

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          <span className="h-3 w-3 rounded-full bg-[color:var(--ui-primary)]" />
          Time Domain
        </div>
        <div className="flex gap-2 text-xs text-[color:var(--ui-text-muted)]">
          <button type="button" className="rounded p-1 hover:bg-[color:var(--ui-surface-high)]">
            Expand
          </button>
          <button type="button" className="rounded p-1 hover:bg-[color:var(--ui-surface-high)]">
            Grid
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded border border-[color:var(--ui-outline)] bg-[#020617]">
        <canvas
          ref={canvasRef}
          width={640}
          height={220}
          className="h-full w-full"
          aria-label="Carrier waveform plot"
        />
        <div className="absolute bottom-2 right-2 flex gap-4 text-[10px] font-mono text-white/60">
          <span>T: 2.0 ms/div</span>
          <span>V: 500 mV/div</span>
        </div>
      </div>
    </section>
  );
}
