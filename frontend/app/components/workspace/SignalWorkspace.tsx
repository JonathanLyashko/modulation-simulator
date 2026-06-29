'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";

import { playSignalSamples, stopAudioPlayback } from "@/app/lib/audioPlayback";
import {
  createDspClient,
  generateDsbLcBundle,
  readSignalSnapshot,
} from "@/app/lib/dspClient";

import BlockCanvas from "./BlockCanvas";
import BottomPanels from "./BottomPanels";
import {
  DEFAULT_MESSAGE_COMPONENTS,
  DEFAULT_MODULATOR_SETTINGS,
  DEFAULT_PLOT_SETTINGS,
  DISPLAY_WINDOW_SECONDS,
  MIN_SAMPLE_RATE,
  NYQUIST_MULTIPLIER,
  SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE,
} from "./constants";
import InspectorPanel from "./InspectorPanel";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import type {
  AnalogAmplitudeScheme,
  AnalogAngleScheme,
  MessageComponent,
  MessageComponentType,
  ModulatorSettings,
  PlotSettings,
  SignalSnapshot,
  SignalView,
  SpectrumDisplayMode,
} from "./types";

function cloneDefaultModulatorSettings(): ModulatorSettings {
  return {
    ...DEFAULT_MODULATOR_SETTINGS,
    messageComponents: DEFAULT_MESSAGE_COMPONENTS.map((component) => ({
      ...component,
    })),
    carrier: {
      ...DEFAULT_MODULATOR_SETTINGS.carrier,
    },
  };
}

function createMessageComponent(type: MessageComponentType, index: number): MessageComponent {
  return {
    id: `message-component-${Date.now()}-${index}`,
    type,
    amplitude: 0.5,
    frequency: type === "sine" ? 2 : 1,
    phase: 0,
  };
}

export default function SignalWorkspace() {
  const activeSignalIdsRef = useRef<number[]>([]);
  const playbackIntervalRef = useRef<number | null>(null);
  const playbackStartedAtRef = useRef<number | null>(null);
  const playbackDurationRef = useRef<number>(0);
  const activePlaybackSignalIdRef = useRef<number | null>(null);

  const [signalByView, setSignalByView] = useState<Record<SignalView, SignalSnapshot | null>>({
    message: null,
    carrier: null,
    modulated: null,
  });
  const [spectrumByView, setSpectrumByView] = useState<Record<SignalView, SignalSnapshot | null>>({
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
    cloneDefaultModulatorSettings
  );
  const [plotSettings, setPlotSettings] = useState<PlotSettings>(
    DEFAULT_PLOT_SETTINGS
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioStatus, setAudioStatus] = useState("Ready");
  const [playbackCursorSeconds, setPlaybackCursorSeconds] = useState<number | null>(
    null
  );
  const [spectrumDisplayMode, setSpectrumDisplayMode] =
    useState<SpectrumDisplayMode>("magnitude");

  const requestedWindowSeconds = Math.max(
    DISPLAY_WINDOW_SECONDS,
    ...Object.values(plotSettings).map(
      (signalPlotSettings) => signalPlotSettings.xScaleSecondsPerDivision * 10
    )
  );
  const highestMessageFrequency = settings.messageComponents.reduce(
    (currentMaximum, component) => Math.max(currentMaximum, component.frequency),
    0
  );
  const highestRepresentedFrequency = Math.max(
    highestMessageFrequency,
    settings.carrier.frequency + highestMessageFrequency
  );
  const nyquistMinimumSampleRate = Math.ceil(
    highestRepresentedFrequency * NYQUIST_MULTIPLIER
  );
  const sampleRate = Math.max(
    MIN_SAMPLE_RATE,
    nyquistMinimumSampleRate,
    Math.ceil(highestRepresentedFrequency * SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE)
  );
  const sampleCount = Math.max(
    1024,
    Math.ceil(sampleRate * requestedWindowSeconds)
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
          length: sampleCount,
          sampleRate,
          messageComponents: settings.messageComponents,
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

        const messageSpectrumId = dsp.fftMagnitudeSpectrum(bundle.message.signalId);
        const carrierSpectrumId = dsp.fftMagnitudeSpectrum(bundle.carrier.signalId);
        const modulatedSpectrumId = dsp.fftMagnitudeSpectrum(bundle.modulated.signalId);

        if (
          messageSpectrumId < 0 ||
          carrierSpectrumId < 0 ||
          modulatedSpectrumId < 0
        ) {
          if (messageSpectrumId >= 0) {
            dsp.destroySignal(messageSpectrumId);
          }
          if (carrierSpectrumId >= 0) {
            dsp.destroySignal(carrierSpectrumId);
          }
          if (modulatedSpectrumId >= 0) {
            dsp.destroySignal(modulatedSpectrumId);
          }
          throw new Error("Failed to generate FFT spectrum in the WASM module.");
        }

        const spectrumBundle = {
          message: await readSignalSnapshot(messageSpectrumId),
          carrier: await readSignalSnapshot(carrierSpectrumId),
          modulated: await readSignalSnapshot(modulatedSpectrumId),
        };

        const previousIds = [...activeSignalIdsRef.current];
        activeSignalIdsRef.current = [
          bundle.message.signalId,
          bundle.carrier.signalId,
          bundle.modulated.signalId,
          spectrumBundle.message.signalId,
          spectrumBundle.carrier.signalId,
          spectrumBundle.modulated.signalId,
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
          setSpectrumByView(spectrumBundle);
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
        setSpectrumByView({
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
  }, [activeAmplitudeScheme, sampleCount, sampleRate, settings]);

  useEffect(() => {
    return () => {
      void stopAudioPlayback();
      if (playbackIntervalRef.current !== null) {
        window.clearInterval(playbackIntervalRef.current);
      }
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

  const selectedSignal = signalByView[selectedSignalView];
  const selectedSignalLabel =
    selectedSignalView === "message"
      ? "MESSAGE WAVEFORM"
      : selectedSignalView === "carrier"
        ? "CARRIER WAVEFORM"
        : "MODULATED WAVEFORM";

  function clearPlaybackTimer() {
    if (playbackIntervalRef.current !== null) {
      window.clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  }

  const startAudioPreview = useEffectEvent(async (signal: SignalSnapshot) => {
    clearPlaybackTimer();
    setAudioStatus("Preparing playback");

    const playbackSession = await playSignalSamples(
      signal.samples,
      signal.sampleRate,
      { loop: true }
    );

    activePlaybackSignalIdRef.current = signal.signalId;
    playbackStartedAtRef.current = performance.now();
    playbackDurationRef.current = playbackSession.durationSeconds;
    setPlaybackCursorSeconds(0);
    setIsAudioPlaying(true);
    setAudioStatus("Looping");

    playbackIntervalRef.current = window.setInterval(() => {
      if (playbackStartedAtRef.current === null || playbackDurationRef.current <= 0) {
        return;
      }

      const elapsedSeconds =
        (performance.now() - playbackStartedAtRef.current) / 1000;
      setPlaybackCursorSeconds(elapsedSeconds % playbackDurationRef.current);
    }, 33);
  });

  useEffect(() => {
    if (!isAudioPlaying || !selectedSignal) {
      return;
    }

    if (activePlaybackSignalIdRef.current === selectedSignal.signalId) {
      return;
    }

    void startAudioPreview(selectedSignal).catch((cause) => {
      setIsAudioPlaying(false);
      setPlaybackCursorSeconds(null);
      setAudioStatus(
        cause instanceof Error ? cause.message : "Audio playback failed"
      );
    });
  }, [isAudioPlaying, selectedSignal]);

  async function handlePlayAudio() {
    if (!selectedSignal) {
      setAudioStatus("No signal available");
      return;
    }

    try {
      clearPlaybackTimer();
      setAudioStatus("Preparing playback");

      const playbackSession = await playSignalSamples(
        selectedSignal.samples,
        selectedSignal.sampleRate,
        { loop: true }
      );

      activePlaybackSignalIdRef.current = selectedSignal.signalId;
      playbackStartedAtRef.current = performance.now();
      playbackDurationRef.current = playbackSession.durationSeconds;
      setPlaybackCursorSeconds(0);
      setIsAudioPlaying(true);
      setAudioStatus("Looping");

      playbackIntervalRef.current = window.setInterval(() => {
        if (playbackStartedAtRef.current === null || playbackDurationRef.current <= 0) {
          return;
        }

        const elapsedSeconds =
          (performance.now() - playbackStartedAtRef.current) / 1000;
        setPlaybackCursorSeconds(elapsedSeconds % playbackDurationRef.current);
      }, 33);
    } catch (cause) {
      activePlaybackSignalIdRef.current = null;
      playbackStartedAtRef.current = null;
      playbackDurationRef.current = 0;
      clearPlaybackTimer();
      setIsAudioPlaying(false);
      setPlaybackCursorSeconds(null);
      setAudioStatus(
        cause instanceof Error ? cause.message : "Audio playback failed"
      );
    }
  }

  async function handleStopAudio() {
    await stopAudioPlayback();
    clearPlaybackTimer();
    activePlaybackSignalIdRef.current = null;
    playbackStartedAtRef.current = null;
    playbackDurationRef.current = 0;
    setIsAudioPlaying(false);
    setPlaybackCursorSeconds(null);
    setAudioStatus("Stopped");
  }

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
            setSettings(cloneDefaultModulatorSettings());
            setPlotSettings(DEFAULT_PLOT_SETTINGS);
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
              settings={settings}
              selectedSignalView={selectedSignalView}
              onSelectSignalView={setSelectedSignalView}
            />
            <BottomPanels
              signals={signalByView}
              spectra={spectrumByView}
              selectedSignalView={selectedSignalView}
              plotSettings={plotSettings}
              playbackCursorSeconds={playbackCursorSeconds}
              spectrumDisplayMode={spectrumDisplayMode}
            />
          </main>

          <InspectorPanel
            settings={settings}
            plotSettings={plotSettings}
            selectedSignalLabel={selectedSignalLabel}
            isAudioPlaying={isAudioPlaying}
            audioStatus={audioStatus}
            messageComponents={settings.messageComponents}
            onCarrierAmplitudeChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  carrier: {
                    ...current.carrier,
                    amplitude: Math.max(0.1, Math.min(2, value)),
                  },
                }));
              }
            }}
            onCarrierFrequencyChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  carrier: {
                    ...current.carrier,
                    frequency: Math.max(100, Math.min(5000, value)),
                  },
                }));
              }
            }}
            onCarrierPhaseChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  carrier: {
                    ...current.carrier,
                    phase: Math.max(0, Math.min(360, value)),
                  },
                }));
              }
            }}
            onAddMessageComponent={(type) => {
              setSettings((current) => ({
                ...current,
                messageComponents: [
                  ...current.messageComponents,
                  createMessageComponent(type, current.messageComponents.length + 1),
                ],
              }));
            }}
            onUpdateMessageComponent={(componentId, field, value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setSettings((current) => ({
                ...current,
                messageComponents: current.messageComponents.map((component) => {
                  if (component.id !== componentId) {
                    return component;
                  }

                  if (field === "amplitude") {
                    return {
                      ...component,
                      amplitude: Math.max(0, Math.min(2, value)),
                    };
                  }

                  if (field === "frequency") {
                    return {
                      ...component,
                      frequency: Math.max(0.1, Math.min(5000, value)),
                    };
                  }

                  return {
                    ...component,
                    phase: Math.max(0, Math.min(360, value)),
                  };
                }),
              }));
            }}
            onRemoveMessageComponent={(componentId) => {
              setSettings((current) => ({
                ...current,
                messageComponents:
                  current.messageComponents.length > 1
                    ? current.messageComponents.filter(
                        (component) => component.id !== componentId
                      )
                    : current.messageComponents,
              }));
            }}
            onModulationIndexChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  modulationIndex: Math.max(0, Math.min(1.5, value)),
                }));
              }
            }}
            onPlotSignalVisibilityChange={(view, visible) => {
              setPlotSettings((current) => ({
                ...current,
                [view]: {
                  ...current[view],
                  visible,
                },
              }));
            }}
            onPlotSignalXScaleChange={(view, value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setPlotSettings((current) => ({
                ...current,
                [view]: {
                  ...current[view],
                  xScaleSecondsPerDivision: Math.max(0.0005, Math.min(0.05, value)),
                },
              }));
            }}
            onPlotSignalYScaleChange={(view, value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setPlotSettings((current) => ({
                ...current,
                [view]: {
                  ...current[view],
                  yScaleVoltsPerDivision: Math.max(0.05, Math.min(2, value)),
                },
              }));
            }}
            onResetSignals={() => {
              setSettings(cloneDefaultModulatorSettings());
              setIsRunning(true);
            }}
            onResetPlot={() => {
              setPlotSettings(DEFAULT_PLOT_SETTINGS);
            }}
            spectrumDisplayMode={spectrumDisplayMode}
            onSpectrumDisplayModeChange={setSpectrumDisplayMode}
            onPlayAudio={() => {
              void handlePlayAudio();
            }}
            onStopAudio={() => {
              void handleStopAudio();
            }}
          />
        </div>
      </div>
    </div>
  );
}
