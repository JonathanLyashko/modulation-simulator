import type { CarrierSettings } from "./types";

export const DEFAULT_SAMPLE_COUNT = 512;
export const DEFAULT_SAMPLE_RATE = 4_096;
export const DEFAULT_MESSAGE_AMPLITUDE = 1;
export const DEFAULT_MESSAGE_FREQUENCY = 1;

export const DEFAULT_CARRIER_SETTINGS: CarrierSettings = {
  amplitude: 1,
  frequency: 1_000,
  phase: 0,
  modulationIndex: 0.8,
};
