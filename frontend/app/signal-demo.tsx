'use client';

import { useEffect, useRef, useState } from "react";

import { createDspClient, generateSineSnapshot, type SignalSnapshot } from "@/app/lib/dspClient";

function drawWaveform(canvas: HTMLCanvasElement, samples: Float32Array) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);

  context.fillStyle = "rgba(11, 21, 18, 0.94)";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(94, 234, 212, 0.18)";
  context.lineWidth = 1;

  for (let column = 0; column <= 8; column += 1) {
    const x = (width / 8) * column;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let row = 0; row <= 4; row += 1) {
    const y = (height / 4) * row;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.strokeStyle = "#5eead4";
  context.lineWidth = 2;
  context.beginPath();

  for (let index = 0; index < samples.length; index += 1) {
    const x = (index / Math.max(samples.length - 1, 1)) * width;
    const normalized = (samples[index] + 1) / 2;
    const y = height - normalized * height;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}

export default function SignalDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signal, setSignal] = useState<SignalSnapshot | null>(null);
  const [status, setStatus] = useState("Loading WASM module...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let activeSignalId: number | null = null;

    async function run() {
      try {
        setStatus("Creating signal in C++ and reading it back from WASM...");
        const dsp = await createDspClient();
        const snapshot = await generateSineSnapshot();

        if (disposed) {
          dsp.destroySignal(snapshot.signalId);
          return;
        }

        activeSignalId = snapshot.signalId;
        setSignal(snapshot);
        setStatus("Vertical slice is working.");
      } catch (cause) {
        if (disposed) {
          return;
        }

        const message =
          cause instanceof Error ? cause.message : "Unknown error while loading WASM.";
        setError(message);
        setStatus("The UI loaded, but the DSP module did not.");
      }
    }

    void run();

    return () => {
      disposed = true;

      if (activeSignalId !== null) {
        const signalId = activeSignalId;
        void createDspClient().then((dsp) => {
          dsp.destroySignal(signalId);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !signal) {
      return;
    }

    drawWaveform(canvasRef.current, signal.samples);
  }, [signal]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.24),_transparent_38%),linear-gradient(180deg,_var(--background),_#091411)] px-6 py-10 text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-[28px] border border-white/10 bg-[color:var(--panel)]/90 px-8 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--accent)]">
            Phase 1 Proof of Concept
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            C++ Signal to WASM to Next.js
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[color:var(--muted)]">
            This page creates a signal in the WASM module, fills it with a sine
            wave in C++, copies the samples back into JavaScript, and plots
            them in a toy UI.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-white/10 bg-[color:var(--panel)]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Waveform Preview</h2>
                <p className="text-sm text-[color:var(--muted)]">{status}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--accent)]">
                SINE
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={920}
              height={360}
              className="h-auto w-full rounded-[22px] border border-white/10 bg-[#0b1512]"
              aria-label="Rendered sine waveform samples"
            />
          </article>

          <aside className="rounded-[28px] border border-white/10 bg-[color:var(--panel)]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <h2 className="text-lg font-semibold">Slice Status</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <dt className="text-[color:var(--muted)]">Samples</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {signal?.samples.length ?? "--"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <dt className="text-[color:var(--muted)]">Sample Rate</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {signal ? `${signal.sampleRate.toLocaleString()} Hz` : "--"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <dt className="text-[color:var(--muted)]">First 8 Samples</dt>
                <dd className="mt-2 font-mono text-xs leading-6 text-[color:var(--accent)]">
                  {signal
                    ? Array.from(signal.samples.slice(0, 8))
                        .map((value) => value.toFixed(4))
                        .join(", ")
                    : "--"}
                </dd>
              </div>
            </dl>

            {error ? (
              <p className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </p>
            ) : null}
          </aside>
        </section>
      </section>
    </main>
  );
}
