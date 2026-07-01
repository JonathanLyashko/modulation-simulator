export type OscillatorSettings = {
  amplitude: number;
  frequency: number;
  phase: number;
};

export type MessageComponentType = "sine" | "cosine";
export type MessageSourceMode = "preset" | "recorded";

export type MessageComponent = {
  id: string;
  type: MessageComponentType;
  amplitude: number;
  frequency: number;
  phase: number;
};

export type ModulatorSettings = {
  messageSourceMode: MessageSourceMode;
  recordingDurationSeconds: number;
  messageComponents: MessageComponent[];
  carrier: OscillatorSettings;
  modulationIndex: number;
  frequencySensitivity: number;
  phaseSensitivity: number;
};

export type PlotSignalSettings = {
  visible: boolean;
  xScaleSecondsPerDivision: number;
  yScaleVoltsPerDivision: number;
};

export type PlotSettings = Record<SignalView, PlotSignalSettings>;

export type FrequencyPlotSettings = {
  centerHz: number;
  spanHz: number;
  yScale: number;
  fftSize: number;
};

export type SignalSnapshot = {
  signalId: number;
  sampleRate: number;
  samples: Float32Array;
};

export type RecordedMessageClip = {
  samples: Float32Array;
  sampleRate: number;
  durationSeconds: number;
  peak: number;
};

export type SignalView = "message" | "carrier" | "modulated";
export type SpectrumDisplayMode = "magnitude" | "db";

export type AnalogAmplitudeScheme = "DSB-LC" | "DSB-SC" | "SSB";

export type AnalogAngleScheme = "FM" | "PM";
export type SsbSideband = "USB" | "LSB";
