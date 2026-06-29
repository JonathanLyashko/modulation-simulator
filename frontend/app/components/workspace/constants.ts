import type { CarrierSettings } from "./types";

export const DEFAULT_SAMPLE_COUNT = 512;
export const DEFAULT_SAMPLE_RATE = 48_000;

export const DEFAULT_CARRIER_SETTINGS: CarrierSettings = {
  amplitude: 1,
  frequency: 1_000,
  phase: 0,
};

export const MODULATION_OPTIONS = ["AM", "FM", "PM", "QAM"] as const;
