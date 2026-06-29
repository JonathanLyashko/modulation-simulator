import type { ModulatorSettings } from "./types";

export const DEFAULT_SAMPLE_COUNT = 512;
export const DEFAULT_SAMPLE_RATE = 4_096;
export const DEFAULT_MESSAGE_AMPLITUDE = 1;
export const DEFAULT_MESSAGE_FREQUENCY = 1;

export const DEFAULT_MODULATOR_SETTINGS: ModulatorSettings = {
  message: {
    amplitude: DEFAULT_MESSAGE_AMPLITUDE,
    frequency: DEFAULT_MESSAGE_FREQUENCY,
    phase: 0,
  },
  carrier: {
    amplitude: 1,
    frequency: 1_000,
    phase: 0,
  },
  modulationIndex: 0.8,
};
