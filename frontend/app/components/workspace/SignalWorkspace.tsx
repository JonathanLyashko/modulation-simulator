'use client';

import { startTransition, useEffect, useRef, useState } from "react";

import { createDspClient, generateDsbLcBundle } from "@/app/lib/dspClient";

import BlockCanvas from "./BlockCanvas";
import BottomPanels from "./BottomPanels";
import {
  DEFAULT_MODULATOR_SETTINGS,
  DEFAULT_SAMPLE_COUNT,
  DEFAULT_SAMPLE_RATE,
} from "./constants";
import InspectorPanel from "./InspectorPanel";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import type {
  AnalogAmplitudeScheme,
  AnalogAngleScheme,
  ModulatorSettings,
  SignalSnapshot,
  SignalView,
} from "./types";

export default function SignalWorkspace() {
  const activeSignalIdsRef = useRef<number[]>([]);

  const [signalByView, setSignalByView] = useState<Record<SignalView, SignalSnapshot | null>>({
    message: null,
    carrier: null,
    modulated: null,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [activeAmplitudeScheme, setActiveAmplitudeScheme] =
    useState<AnalogAmplitudeScheme>("DSB-LC");
  const [activeAngleScheme, setActiveAngleScheme] =
    useState<AnalogAngleScheme>("FM");
  const [selectedSignalView, setSelectedSignalView] =
    useState<SignalView>("modulated");
  const [settings, setSettings] = useState<ModulatorSettings>(
    DEFAULT_MODULATOR_SETTINGS
  );

  useEffect(() => {
    if (activeAmplitudeScheme !== "DSB-LC") {
      return;
    }

    let disposed = false;

    async function runDsbLcGeneration() {
      try {
        const dsp = await createDspClient();
        const bundle = await generateDsbLcBundle({
          length: DEFAULT_SAMPLE_COUNT,
          sampleRate: DEFAULT_SAMPLE_RATE,
          messageAmplitude: settings.message.amplitude,
          messageFrequency: settings.message.frequency,
          messagePhase: settings.message.phase,
          carrierAmplitude: settings.carrier.amplitude,
          carrierFrequency: settings.carrier.frequency,
          carrierPhase: settings.carrier.phase,
          modulationIndex: settings.modulationIndex,
        });

        if (disposed) {
          dsp.destroySignal(bundle.message.signalId);
          dsp.destroySignal(bundle.carrier.signalId);
          dsp.destroySignal(bundle.modulated.signalId);
          return;
        }

        const previousIds = [...activeSignalIdsRef.current];
        activeSignalIdsRef.current = [
          bundle.message.signalId,
          bundle.carrier.signalId,
          bundle.modulated.signalId,
        ];

        for (const signalId of previousIds) {
          dsp.destroySignal(signalId);
        }

        startTransition(() => {
          setSignalByView({
            message: bundle.message,
            carrier: bundle.carrier,
            modulated: bundle.modulated,
          });
        });
      } catch (cause) {
        if (disposed) {
          return;
        }

        setSignalByView({
          message: null,
          carrier: null,
          modulated: null,
        });
        console.error(cause);
      }
    }

    void runDsbLcGeneration();

    return () => {
      disposed = true;
    };
  }, [settings, activeAmplitudeScheme]);

  useEffect(() => {
    return () => {
      if (activeSignalIdsRef.current.length === 0) {
        return;
      }

      void createDspClient().then((dsp) => {
        for (const signalId of activeSignalIdsRef.current) {
          dsp.destroySignal(signalId);
        }
      });
    };
  }, []);

  const selectedSignal =
    activeAmplitudeScheme === "DSB-LC" || selectedSignalView !== "modulated"
      ? signalByView[selectedSignalView]
      : null;

  return (
    <div className="min-h-screen bg-[color:var(--ui-background)] p-0 text-[color:var(--ui-text)]">
      <div className="flex h-screen flex-col overflow-hidden rounded-[18px] border border-[#b9bec8] bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
        <TopBar
          isRunning={isRunning}
          onRun={() => {
            setIsRunning(true);
          }}
          onPause={() => {
            setIsRunning(false);
          }}
          onReset={() => {
            setIsRunning(true);
            setSettings(DEFAULT_MODULATOR_SETTINGS);
          }}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SideNav
            activeAmplitudeScheme={activeAmplitudeScheme}
            activeAngleScheme={activeAngleScheme}
            onSelectAmplitudeScheme={(scheme) => {
              setActiveAmplitudeScheme(scheme);
              if (scheme !== "DSB-LC" && selectedSignalView === "modulated") {
                setSelectedSignalView("message");
              }
            }}
            onSelectAngleScheme={setActiveAngleScheme}
          />

          <main className="flex min-w-0 flex-1 flex-col bg-[color:var(--ui-surface)]">
            <BlockCanvas
              activeModulation={activeAmplitudeScheme}
              carrierFrequency={settings.carrier.frequency}
              messageFrequency={settings.message.frequency}
              selectedSignalView={selectedSignalView}
              onSelectSignalView={setSelectedSignalView}
            />
            <BottomPanels
              samples={selectedSignal?.samples ?? null}
              signalLabel={`${selectedSignalView.toUpperCase()} WAVEFORM`}
            />
          </main>

          <InspectorPanel
            selectedSignalView={selectedSignalView}
            settings={settings}
            onAmplitudeChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  [selectedSignalView === "message" ? "message" : "carrier"]: {
                    ...(selectedSignalView === "message"
                      ? current.message
                      : current.carrier),
                    amplitude: Math.max(0.1, Math.min(2, value)),
                  },
                }));
              }
            }}
            onFrequencyChange={(value) => {
              if (Number.isFinite(value)) {
                const minFrequency = selectedSignalView === "message" ? 0.1 : 100;
                setSettings((current) => ({
                  ...current,
                  [selectedSignalView === "message" ? "message" : "carrier"]: {
                    ...(selectedSignalView === "message"
                      ? current.message
                      : current.carrier),
                    frequency: Math.max(minFrequency, Math.min(5000, value)),
                  },
                }));
              }
            }}
            onPhaseChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  [selectedSignalView === "message" ? "message" : "carrier"]: {
                    ...(selectedSignalView === "message"
                      ? current.message
                      : current.carrier),
                    phase: Math.max(0, Math.min(360, value)),
                  },
                }));
              }
            }}
            onModulationIndexChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  modulationIndex: Math.max(0, Math.min(1.5, value)),
                }));
              }
            }}
            onReset={() => {
              setSettings(DEFAULT_MODULATOR_SETTINGS);
              setIsRunning(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
