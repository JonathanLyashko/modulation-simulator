export type OscillatorSettings = {
  amplitude: number;
  frequency: number;
  phase: number;
};

export type ModulatorSettings = {
  message: OscillatorSettings;
  carrier: OscillatorSettings;
  modulationIndex: number;
};

export type SignalSnapshot = {
  signalId: number;
  sampleRate: number;
  samples: Float32Array;
};

export type SignalView = "message" | "carrier" | "modulated";

export type AnalogAmplitudeScheme = "DSB-LC" | "DSB-SC" | "SSB+" | "SSB_";

export type AnalogAngleScheme = "FM" | "PM";
