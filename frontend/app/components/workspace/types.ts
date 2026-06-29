export type CarrierSettings = {
  amplitude: number;
  frequency: number;
  phase: number;
};

export type SignalSnapshot = {
  signalId: number;
  sampleRate: number;
  samples: Float32Array;
};
