import type { ModulatorSettings, PlotSettings } from "./types";

export const DEFAULT_MESSAGE_AMPLITUDE = 1;
export const DEFAULT_MESSAGE_FREQUENCY = 1;
export const DISPLAY_WINDOW_SECONDS = 0.125;
export const MIN_SAMPLE_RATE = 48_000;
export const NYQUIST_MULTIPLIER = 2;
export const SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE = 32;
export const DEFAULT_X_SCALE_SECONDS_PER_DIVISION = DISPLAY_WINDOW_SECONDS / 10;
export const DEFAULT_Y_SCALE_VOLTS_PER_DIVISION = 0.5;

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

export const DEFAULT_PLOT_SETTINGS: PlotSettings = {
  xScaleSecondsPerDivision: DEFAULT_X_SCALE_SECONDS_PER_DIVISION,
  yScaleVoltsPerDivision: DEFAULT_Y_SCALE_VOLTS_PER_DIVISION,
};
