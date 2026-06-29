'use client';

import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import {
  createDspClient,
  generateCarrierSnapshot,
} from "@/app/lib/dspClient";

import BlockCanvas from "./BlockCanvas";
import BottomPanels from "./BottomPanels";
import { DEFAULT_CARRIER_SETTINGS, DEFAULT_SAMPLE_COUNT, DEFAULT_SAMPLE_RATE } from "./constants";
import InspectorPanel from "./InspectorPanel";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import type { CarrierSettings, SignalSnapshot } from "./types";

export default function SignalWorkspace() {
  const activeSignalIdRef = useRef<number | null>(null);

  const [signal, setSignal] = useState<SignalSnapshot | null>(null);
  const [status, setStatus] = useState("Loading DSP workspace...");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [activeModulation] = useState("FM");
  const [draftSettings, setDraftSettings] = useState<CarrierSettings>(
    DEFAULT_CARRIER_SETTINGS
  );
  const [appliedSettings, setAppliedSettings] = useState<CarrierSettings>(
    DEFAULT_CARRIER_SETTINGS
  );

  useEffect(() => {
    let disposed = false;

    async function runCarrierGeneration() {
      try {
        setError(null);
        setStatus("Generating single carrier in C++...");
        const dsp = await createDspClient();
        const snapshot = await generateCarrierSnapshot({
          length: DEFAULT_SAMPLE_COUNT,
          sampleRate: DEFAULT_SAMPLE_RATE,
          amplitude: appliedSettings.amplitude,
          frequency: appliedSettings.frequency,
          phase: appliedSettings.phase,
        });

        if (disposed) {
          dsp.destroySignal(snapshot.signalId);
          return;
        }

        const previousSignalId = activeSignalIdRef.current;
        activeSignalIdRef.current = snapshot.signalId;

        if (previousSignalId !== null) {
          dsp.destroySignal(previousSignalId);
        }

        startTransition(() => {
          setSignal(snapshot);
          setStatus("Carrier controls are connected to the DSP layer.");
        });
      } catch (cause) {
        if (disposed) {
          return;
        }

        setSignal(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Unknown DSP error while generating carrier."
        );
        setStatus("The workspace loaded, but the DSP layer failed.");
      }
    }

    void runCarrierGeneration();

    return () => {
      disposed = true;
    };
  }, [appliedSettings]);

  useEffect(() => {
    return () => {
      const signalId = activeSignalIdRef.current;
      if (signalId !== null) {
        void createDspClient().then((dsp) => {
          dsp.destroySignal(signalId);
        });
      }
    };
  }, []);

  const samplePreview = useMemo(() => {
    if (!signal) {
      return "--";
    }

    return Array.from(signal.samples.slice(0, 8))
      .map((value) => value.toFixed(4))
      .join(", ");
  }, [signal]);

  const sampleRate = signal?.sampleRate ?? DEFAULT_SAMPLE_RATE;
  const sampleCount = signal?.samples.length ?? DEFAULT_SAMPLE_COUNT;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[color:var(--ui-background)] text-[color:var(--ui-text)]">
      <TopBar
        isRunning={isRunning}
        onRun={() => {
          setIsRunning(true);
          setAppliedSettings({ ...draftSettings });
        }}
        onPause={() => {
          setIsRunning(false);
          setStatus("Carrier generation paused. Apply or Run to refresh.");
        }}
        onReset={() => {
          setIsRunning(true);
          setDraftSettings(DEFAULT_CARRIER_SETTINGS);
          setAppliedSettings(DEFAULT_CARRIER_SETTINGS);
        }}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SideNav activeModulation={activeModulation} />

        <main className="flex min-w-0 flex-1 flex-col bg-[color:var(--ui-surface)]">
          <BlockCanvas
            activeModulation={activeModulation}
            carrierFrequency={appliedSettings.frequency}
          />
          <BottomPanels samples={signal?.samples ?? null} />
        </main>

        <InspectorPanel
          draftSettings={draftSettings}
          appliedSettings={appliedSettings}
          onAmplitudeChange={(value) => {
            if (Number.isFinite(value)) {
              setDraftSettings((current) => ({
                ...current,
                amplitude: Math.max(0.1, Math.min(2, value)),
              }));
            }
          }}
          onFrequencyChange={(value) => {
            if (Number.isFinite(value)) {
              setDraftSettings((current) => ({
                ...current,
                frequency: Math.max(100, Math.min(5000, value)),
              }));
            }
          }}
          onApply={() => {
            setIsRunning(true);
            setAppliedSettings({ ...draftSettings });
          }}
          onReset={() => {
            setDraftSettings(DEFAULT_CARRIER_SETTINGS);
            setAppliedSettings(DEFAULT_CARRIER_SETTINGS);
            setIsRunning(true);
          }}
          sampleCount={sampleCount}
          sampleRate={sampleRate}
          samplePreview={samplePreview}
        />
      </div>

      <div className="pointer-events-none absolute left-6 top-20 rounded-md border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
        {status}
        {error ? ` | ${error}` : ""}
      </div>
    </div>
  );
}
