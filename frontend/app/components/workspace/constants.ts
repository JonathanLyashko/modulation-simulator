import type {
  FrequencyPlotSettings,
  MessageComponent,
  ModulatorSettings,
  PlotSettings,
} from "./types";

export const DEFAULT_MESSAGE_AMPLITUDE = 1;
export const DEFAULT_MESSAGE_FREQUENCY = 1;
export const DEFAULT_RECORDING_DURATION_SECONDS = 5;
export const MIN_RECORDING_DURATION_SECONDS = 1;
export const MAX_RECORDING_DURATION_SECONDS = 10;
export const DISPLAY_WINDOW_SECONDS = 0.125;
export const MIN_SAMPLE_RATE = 48_000;
export const NYQUIST_MULTIPLIER = 2;
export const SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE = 32;
export const DEFAULT_X_SCALE_SECONDS_PER_DIVISION = DISPLAY_WINDOW_SECONDS / 10;
export const DEFAULT_Y_SCALE_VOLTS_PER_DIVISION = 0.5;
export const FFT_SIZE_OPTIONS = [1024, 2048, 4096, 8192, 16384] as const;
export const DEFAULT_FFT_SIZE = 8192;

export const DEFAULT_MESSAGE_COMPONENTS: MessageComponent[] = [
  {
    id: "message-component-1",
    type: "cosine",
    amplitude: DEFAULT_MESSAGE_AMPLITUDE,
    frequency: DEFAULT_MESSAGE_FREQUENCY,
    phase: 0,
  },
];

export const DEFAULT_MODULATOR_SETTINGS: ModulatorSettings = {
  messageSourceMode: "preset",
  recordingDurationSeconds: DEFAULT_RECORDING_DURATION_SECONDS,
  messageComponents: DEFAULT_MESSAGE_COMPONENTS,
  carrier: {
    amplitude: 1,
    frequency: 1_000,
    phase: 0,
  },
  modulationIndex: 0.8,
  frequencySensitivity: 250,
  phaseSensitivity: 1,
};

export const DEFAULT_PLOT_SETTINGS: PlotSettings = {
  message: {
    visible: true,
    xScaleSecondsPerDivision: DEFAULT_X_SCALE_SECONDS_PER_DIVISION,
    yScaleVoltsPerDivision: DEFAULT_Y_SCALE_VOLTS_PER_DIVISION,
  },
  carrier: {
    visible: true,
    xScaleSecondsPerDivision: DEFAULT_X_SCALE_SECONDS_PER_DIVISION,
    yScaleVoltsPerDivision: DEFAULT_Y_SCALE_VOLTS_PER_DIVISION,
  },
  modulated: {
    visible: true,
    xScaleSecondsPerDivision: DEFAULT_X_SCALE_SECONDS_PER_DIVISION,
    yScaleVoltsPerDivision: DEFAULT_Y_SCALE_VOLTS_PER_DIVISION,
  },
};

export const DEFAULT_FREQUENCY_PLOT_SETTINGS: FrequencyPlotSettings = {
  centerHz: 0,
  spanHz: 2_500,
  yScale: 0.2,
  fftSize: DEFAULT_FFT_SIZE,
};
