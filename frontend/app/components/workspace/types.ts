export type OscillatorSettings = {
  amplitude: number;
  frequency: number;
  phase: number;
};

export type MessageComponentType = "sine" | "cosine";

export type MessageComponent = {
  id: string;
  type: MessageComponentType;
  amplitude: number;
  frequency: number;
  phase: number;
};

export type ModulatorSettings = {
  messageComponents: MessageComponent[];
  carrier: OscillatorSettings;
  modulationIndex: number;
};

export type PlotSettings = {
  xScaleSecondsPerDivision: number;
  yScaleVoltsPerDivision: number;
};

export type SignalSnapshot = {
  signalId: number;
  sampleRate: number;
  samples: Float32Array;
};

export type SignalView = "message" | "carrier" | "modulated";

export type AnalogAmplitudeScheme = "DSB-LC" | "DSB-SC" | "SSB+" | "SSB_";

export type AnalogAngleScheme = "FM" | "PM";
