'use client';

import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";

import { playSignalSamples, stopAudioPlayback } from "@/app/lib/audioPlayback";
import {
  cancelAudioRecording,
  startAudioRecording,
  stopAudioRecording,
} from "@/app/lib/audioRecording";
import {
  createDspClient,
  generateDsbScBundle,
  generateDsbLcBundle,
  generateFmBundle,
  generatePmBundle,
  generateSsbBundle,
  readSignalSnapshot,
} from "@/app/lib/dspClient";

import BlockCanvas from "./BlockCanvas";
import BottomPanels from "./BottomPanels";
import {
  DEFAULT_FFT_SIZE,
  DEFAULT_FREQUENCY_PLOT_SETTINGS,
  DEFAULT_MESSAGE_COMPONENTS,
  DEFAULT_MODULATOR_SETTINGS,
  DEFAULT_PLOT_SETTINGS,
  DISPLAY_WINDOW_SECONDS,
  MAX_RECORDING_DURATION_SECONDS,
  MIN_SAMPLE_RATE,
  MIN_RECORDING_DURATION_SECONDS,
  NYQUIST_MULTIPLIER,
  SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE,
} from "./constants";
import InspectorPanel from "./InspectorPanel";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import type {
  AnalogAmplitudeScheme,
  AnalogAngleScheme,
  FrequencyPlotSettings,
  MessageComponent,
  MessageComponentType,
  ModulatorSettings,
  PlotSettings,
  RecordedMessageClip,
  SignalSnapshot,
  SignalView,
  SsbSideband,
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

function createDefaultFrequencyPlotSettings(
  carrierFrequency: number,
  highestMessageFrequency: number
): FrequencyPlotSettings {
  const highestPositiveFrequency = Math.max(
    10,
    carrierFrequency + highestMessageFrequency
  );
  const recommendedSpan = Math.max(
    DEFAULT_FREQUENCY_PLOT_SETTINGS.spanHz,
    Math.ceil((highestPositiveFrequency * 2.4) / 100) * 100
  );

  return {
    centerHz: 0,
    spanHz: recommendedSpan,
    yScale: DEFAULT_FREQUENCY_PLOT_SETTINGS.yScale,
    fftSize: DEFAULT_FFT_SIZE,
  };
}

const SUPPORTED_AMPLITUDE_SCHEMES: AnalogAmplitudeScheme[] = ["DSB-LC", "DSB-SC", "SSB"];

export default function SignalWorkspace() {
  const activeSignalIdsRef = useRef<number[]>([]);
  const playbackIntervalRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<number | null>(null);
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
  const [activeModulationFamily, setActiveModulationFamily] = useState<
    "amplitude" | "angle"
  >("amplitude");
  const [ssbSideband, setSsbSideband] = useState<SsbSideband>("USB");
  const [selectedSignalView, setSelectedSignalView] =
    useState<SignalView>("modulated");
  const [settings, setSettings] = useState<ModulatorSettings>(
    cloneDefaultModulatorSettings
  );
  const [plotSettings, setPlotSettings] = useState<PlotSettings>(
    DEFAULT_PLOT_SETTINGS
  );
  const [frequencyPlotSettings, setFrequencyPlotSettings] =
    useState<FrequencyPlotSettings>(() =>
      createDefaultFrequencyPlotSettings(
        DEFAULT_MODULATOR_SETTINGS.carrier.frequency,
        DEFAULT_MESSAGE_COMPONENTS.reduce(
          (maximum, component) => Math.max(maximum, component.frequency),
          0
        )
      )
    );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioStatus, setAudioStatus] = useState("Ready");
  const [recordedMessageClip, setRecordedMessageClip] =
    useState<RecordedMessageClip | null>(null);
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "processing"
  >("idle");
  const [recordingStatus, setRecordingStatus] = useState("No recorded clip");
  const [playbackCursorSeconds, setPlaybackCursorSeconds] = useState<number | null>(
    null
  );
  const [spectrumDisplayMode, setSpectrumDisplayMode] =
    useState<SpectrumDisplayMode>("magnitude");
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  const recordedMessageBandwidthHz =
    settings.messageSourceMode === "recorded" && recordedMessageClip
      ? recordedMessageClip.sampleRate / 2
      : 0;
  const requestedWindowSeconds = Math.max(
    DISPLAY_WINDOW_SECONDS,
    settings.messageSourceMode === "recorded" && recordedMessageClip
      ? recordedMessageClip.durationSeconds
      : 0,
    ...Object.values(plotSettings).map(
      (signalPlotSettings) => signalPlotSettings.xScaleSecondsPerDivision * 10
    )
  );
  const highestMessageFrequency = settings.messageComponents.reduce(
    (currentMaximum, component) => Math.max(currentMaximum, component.frequency),
    settings.messageSourceMode === "recorded" ? recordedMessageBandwidthHz : 0
  );
  const messagePeakUpperBound = settings.messageComponents.reduce(
    (total, component) => total + Math.abs(component.amplitude),
    settings.messageSourceMode === "recorded" && recordedMessageClip ? 1 : 0
  );
  const fmDeviationHz = settings.frequencySensitivity * messagePeakUpperBound;
  const activeModulationLabel =
    activeModulationFamily === "amplitude" ? activeAmplitudeScheme : activeAngleScheme;
  const supportsCurrentModulation =
    activeModulationFamily === "amplitude"
      ? SUPPORTED_AMPLITUDE_SCHEMES.includes(activeAmplitudeScheme)
      : activeAngleScheme === "FM" || activeAngleScheme === "PM";
  const highestRepresentedFrequency =
    activeModulationFamily === "angle" && activeAngleScheme === "FM"
      ? Math.max(
          highestMessageFrequency,
          settings.carrier.frequency + fmDeviationHz + highestMessageFrequency
        )
      : Math.max(
          highestMessageFrequency,
          settings.carrier.frequency + highestMessageFrequency
        );
  const nyquistMinimumSampleRate = Math.ceil(
    highestRepresentedFrequency * NYQUIST_MULTIPLIER
  );
  const sampleRate =
    settings.messageSourceMode === "recorded"
      ? Math.max(
          MIN_SAMPLE_RATE,
          nyquistMinimumSampleRate,
          recordedMessageClip?.sampleRate ?? MIN_SAMPLE_RATE
        )
      : Math.max(
          MIN_SAMPLE_RATE,
          nyquistMinimumSampleRate,
          Math.ceil(highestRepresentedFrequency * SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE)
        );
  const sampleCount = Math.max(
    1024,
    frequencyPlotSettings.fftSize,
    Math.ceil(sampleRate * requestedWindowSeconds)
  );
  const fftResolutionHz = sampleRate / frequencyPlotSettings.fftSize;
  const minimumFrequencySpan = Math.max(fftResolutionHz * 4, 20);
  const boundedFrequencySpan = Math.max(
    minimumFrequencySpan,
    Math.min(sampleRate, frequencyPlotSettings.spanHz)
  );
  const maximumFrequencyCenter = Math.max(
    sampleRate / 2 - boundedFrequencySpan / 2,
    0
  );
  const boundedFrequencyCenter = Math.max(
    -maximumFrequencyCenter,
    Math.min(maximumFrequencyCenter, frequencyPlotSettings.centerHz)
  );
  const boundedFrequencyPlotSettings: FrequencyPlotSettings = {
    ...frequencyPlotSettings,
    spanHz: boundedFrequencySpan,
    centerHz: boundedFrequencyCenter,
  };
  const displayedSignals = supportsCurrentModulation
    ? signalByView
    : {
        message: null,
        carrier: null,
        modulated: null,
      };
  const displayedSpectra = supportsCurrentModulation
    ? spectrumByView
    : {
        message: null,
        carrier: null,
        modulated: null,
      };

  useEffect(() => {
    if (!supportsCurrentModulation) {
      const previousIds = [...activeSignalIdsRef.current];
      activeSignalIdsRef.current = [];
      if (previousIds.length > 0) {
        void createDspClient().then((dsp) => {
          for (const signalId of previousIds) {
            dsp.destroySignal(signalId);
          }
        });
      }
      return;
    }

    let disposed = false;

    async function runDsbLcGeneration() {
      try {
        const dsp = await createDspClient();
        const sharedOptions = {
          length: sampleCount,
          sampleRate,
          messageComponents: settings.messageComponents,
          recordedMessage:
            settings.messageSourceMode === "recorded" ? recordedMessageClip : null,
          carrierAmplitude: settings.carrier.amplitude,
          carrierFrequency: settings.carrier.frequency,
          carrierPhase: settings.carrier.phase,
        };
        const bundle =
          activeModulationFamily === "angle"
            ? activeAngleScheme === "PM"
              ? await generatePmBundle({
                  ...sharedOptions,
                  phaseSensitivity: settings.phaseSensitivity,
                })
              : await generateFmBundle({
                  ...sharedOptions,
                  frequencySensitivity: settings.frequencySensitivity,
                })
            : activeAmplitudeScheme === "DSB-SC"
              ? await generateDsbScBundle(sharedOptions)
              : activeAmplitudeScheme === "SSB"
                ? await generateSsbBundle({
                    ...sharedOptions,
                    sideband: ssbSideband,
                  })
                : await generateDsbLcBundle({
                    ...sharedOptions,
                    modulationIndex: settings.modulationIndex,
                  });

        if (disposed) {
          dsp.destroySignal(bundle.message.signalId);
          dsp.destroySignal(bundle.carrier.signalId);
          dsp.destroySignal(bundle.modulated.signalId);
          return;
        }

        const messageSpectrumId = dsp.fftMagnitudeSpectrumSized(
          bundle.message.signalId,
          frequencyPlotSettings.fftSize
        );
        const carrierSpectrumId = dsp.fftMagnitudeSpectrumSized(
          bundle.carrier.signalId,
          frequencyPlotSettings.fftSize
        );
        const modulatedSpectrumId = dsp.fftMagnitudeSpectrumSized(
          bundle.modulated.signalId,
          frequencyPlotSettings.fftSize
        );

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
  }, [
    activeAmplitudeScheme,
    activeAngleScheme,
    activeModulationFamily,
    frequencyPlotSettings.fftSize,
    recordedMessageClip,
    sampleCount,
    sampleRate,
    settings,
    supportsCurrentModulation,
    ssbSideband,
  ]);

  useEffect(() => {
    return () => {
      void stopAudioPlayback();
      void cancelAudioRecording();
      if (playbackIntervalRef.current !== null) {
        window.clearInterval(playbackIntervalRef.current);
      }
      if (recordingTimeoutRef.current !== null) {
        window.clearTimeout(recordingTimeoutRef.current);
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

  const selectedSignal = displayedSignals[selectedSignalView];
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

  function clearRecordingTimer() {
    if (recordingTimeoutRef.current !== null) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
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

  async function handleStartRecording() {
    try {
      await handleStopAudio();
      clearRecordingTimer();
      setRecordingState("recording");
      setRecordingStatus("Recording from microphone");
      await startAudioRecording();
      recordingTimeoutRef.current = window.setTimeout(() => {
        void handleStopRecording();
      }, settings.recordingDurationSeconds * 1000);
    } catch (cause) {
      clearRecordingTimer();
      setRecordingState("idle");
      setRecordingStatus(
        cause instanceof Error ? cause.message : "Microphone recording failed"
      );
    }
  }

  async function handleStopRecording() {
    clearRecordingTimer();

    try {
      setRecordingState("processing");
      setRecordingStatus("Processing recorded clip");
      const clip = await stopAudioRecording();

      setRecordedMessageClip(clip);
      setRecordingState("idle");
      setRecordingStatus(
        `Recorded ${clip.durationSeconds.toFixed(2)} s at ${clip.sampleRate.toFixed(0)} Hz`
      );
      setSelectedSignalView("message");
      setSettings((current) => ({
        ...current,
        messageSourceMode: "recorded",
      }));
      setPlotSettings((current) => ({
        ...current,
        message: {
          ...current.message,
          xScaleSecondsPerDivision: Math.max(
            current.message.xScaleSecondsPerDivision,
            clip.durationSeconds / 10
          ),
        },
      }));
    } catch (cause) {
      setRecordingState("idle");
      setRecordingStatus(
        cause instanceof Error ? cause.message : "Microphone recording failed"
      );
    }
  }

  async function handleClearRecordedClip() {
    clearRecordingTimer();
    await cancelAudioRecording();
    setRecordingState("idle");
    setRecordedMessageClip(null);
    setRecordingStatus("No recorded clip");
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
            clearRecordingTimer();
            void cancelAudioRecording();
            setIsRunning(true);
            setSettings(cloneDefaultModulatorSettings());
            setRecordedMessageClip(null);
            setRecordingState("idle");
            setRecordingStatus("No recorded clip");
            setPlotSettings(DEFAULT_PLOT_SETTINGS);
            setFrequencyPlotSettings(
              createDefaultFrequencyPlotSettings(
                DEFAULT_MODULATOR_SETTINGS.carrier.frequency,
                DEFAULT_MESSAGE_COMPONENTS.reduce(
                  (maximum, component) => Math.max(maximum, component.frequency),
                  0
                )
              )
            );
          }}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SideNav
            activeFamily={activeModulationFamily}
            activeAmplitudeScheme={activeAmplitudeScheme}
            activeAngleScheme={activeAngleScheme}
            collapsed={isLeftSidebarCollapsed}
            onSelectAmplitudeScheme={(scheme) => {
              setActiveModulationFamily("amplitude");
              setActiveAmplitudeScheme(scheme);
              if (
                !SUPPORTED_AMPLITUDE_SCHEMES.includes(scheme) &&
                selectedSignalView === "modulated"
              ) {
                setSelectedSignalView("message");
              }
            }}
            onSelectAngleScheme={(scheme) => {
              setActiveModulationFamily("angle");
              setActiveAngleScheme(scheme);
            }}
            onToggleCollapsed={() => {
              setIsLeftSidebarCollapsed((current) => !current);
            }}
          />

          <main className="flex min-w-0 flex-1 flex-col bg-[color:var(--ui-surface)]">
            <BlockCanvas
              activeModulation={activeModulationLabel}
              settings={settings}
              selectedSignalView={selectedSignalView}
              onSelectSignalView={setSelectedSignalView}
            />
            <BottomPanels
              signals={displayedSignals}
              spectra={displayedSpectra}
              selectedSignalView={selectedSignalView}
              plotSettings={plotSettings}
              frequencyPlotSettings={boundedFrequencyPlotSettings}
              playbackCursorSeconds={playbackCursorSeconds}
              spectrumDisplayMode={spectrumDisplayMode}
            />
          </main>

          <InspectorPanel
            activeModulationFamily={activeModulationFamily}
            activeAmplitudeScheme={activeAmplitudeScheme}
            activeAngleScheme={activeAngleScheme}
            activeModulationLabel={activeModulationLabel}
            settings={settings}
            plotSettings={plotSettings}
            frequencyPlotSettings={boundedFrequencyPlotSettings}
            fftResolutionHz={fftResolutionHz}
            sampleRate={sampleRate}
            selectedSignalLabel={selectedSignalLabel}
            isAudioPlaying={isAudioPlaying}
            audioStatus={audioStatus}
            messageSourceMode={settings.messageSourceMode}
            recordingDurationSeconds={settings.recordingDurationSeconds}
            recordedMessageClip={recordedMessageClip}
            recordingState={recordingState}
            recordingStatus={recordingStatus}
            messageComponents={settings.messageComponents}
            ssbSideband={ssbSideband}
            collapsed={isRightSidebarCollapsed}
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
            onMessageSourceModeChange={(mode) => {
              setSettings((current) => ({
                ...current,
                messageSourceMode: mode,
              }));
            }}
            onRecordingDurationChange={(value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setSettings((current) => ({
                ...current,
                recordingDurationSeconds: Math.max(
                  MIN_RECORDING_DURATION_SECONDS,
                  Math.min(MAX_RECORDING_DURATION_SECONDS, value)
                ),
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
            onFrequencySensitivityChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  frequencySensitivity: Math.max(0, Math.min(5000, value)),
                }));
              }
            }}
            onPhaseSensitivityChange={(value) => {
              if (Number.isFinite(value)) {
                setSettings((current) => ({
                  ...current,
                  phaseSensitivity: Math.max(0, Math.min(20, value)),
                }));
              }
            }}
            onSsbSidebandChange={setSsbSideband}
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
                  xScaleSecondsPerDivision: Math.max(0.0005, Math.min(1, value)),
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
            onFrequencyPlotCenterChange={(value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              const halfSpan = boundedFrequencyPlotSettings.spanHz / 2;
              const maxCenter = Math.max(sampleRate / 2 - halfSpan, 0);
              setFrequencyPlotSettings((current) => ({
                ...current,
                centerHz: Math.max(-maxCenter, Math.min(maxCenter, value)),
              }));
            }}
            onFrequencyPlotSpanChange={(value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              const boundedSpan = Math.max(minimumFrequencySpan, Math.min(sampleRate, value));
              setFrequencyPlotSettings((current) => {
                const maxCenter = Math.max(sampleRate / 2 - boundedSpan / 2, 0);
                return {
                  ...current,
                  spanHz: boundedSpan,
                  centerHz: Math.max(-maxCenter, Math.min(maxCenter, current.centerHz)),
                };
              });
            }}
            onFrequencyPlotFftSizeChange={(value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setFrequencyPlotSettings((current) => {
                const nextResolutionHz = sampleRate / value;
                const minimumSpan = Math.max(nextResolutionHz * 4, 20);
                const boundedSpan = Math.max(current.spanHz, minimumSpan);
                const maxCenter = Math.max(sampleRate / 2 - boundedSpan / 2, 0);

                return {
                  ...current,
                  fftSize: value,
                  spanHz: boundedSpan,
                  centerHz: Math.max(-maxCenter, Math.min(maxCenter, current.centerHz)),
                };
              });
            }}
            onFrequencyPlotYScaleChange={(value) => {
              if (!Number.isFinite(value)) {
                return;
              }

              setFrequencyPlotSettings((current) => ({
                ...current,
                yScale:
                  spectrumDisplayMode === "magnitude"
                    ? Math.max(0.02, Math.min(2, value))
                    : Math.max(1, Math.min(40, value)),
              }));
            }}
            onResetSignals={() => {
              setSettings(cloneDefaultModulatorSettings());
              setIsRunning(true);
            }}
            onResetPlot={() => {
              setPlotSettings(DEFAULT_PLOT_SETTINGS);
              setFrequencyPlotSettings(
                createDefaultFrequencyPlotSettings(
                  settings.carrier.frequency,
                  highestMessageFrequency
                )
              );
            }}
            spectrumDisplayMode={spectrumDisplayMode}
            onSpectrumDisplayModeChange={setSpectrumDisplayMode}
            onPlayAudio={() => {
              void handlePlayAudio();
            }}
            onStartRecording={() => {
              void handleStartRecording();
            }}
            onStopRecording={() => {
              void handleStopRecording();
            }}
            onClearRecordedClip={() => {
              void handleClearRecordedClip();
            }}
            onStopAudio={() => {
              void handleStopAudio();
            }}
            onToggleCollapsed={() => {
              setIsRightSidebarCollapsed((current) => !current);
            }}
          />
        </div>
      </div>
    </div>
  );
}
