'use client';

import type {
  MessageComponent,
  RecordedMessageClip,
  SsbSideband,
} from "@/app/components/workspace/types";

type DspModule = {
  cwrap: <T extends (...args: number[]) => number | void>(
    name: string,
    returnType: "number" | null,
    argTypes: Array<"number">
  ) => T;
};

type DspExports = {
  createSignal(length: number, sampleRate: number): number;
  destroySignal(signalId: number): void;
  getSignalPointer(signalId: number): number;
  getSignalLength(signalId: number): number;
  getSignalSampleRate(signalId: number): number;
  getSignalSample(signalId: number, sampleIndex: number): number;
  setSignalSample(signalId: number, sampleIndex: number, value: number): number;
  writeSignalSamples(signalId: number, samples: Float32Array): void;
  fftMagnitudeSpectrum(signalId: number): number;
  fftMagnitudeSpectrumSized(signalId: number, fftSize: number): number;
  clearSignal(signalId: number): void;
  addSineComponent(
    signalId: number,
    amplitude: number,
    frequency: number,
    phase: number
  ): void;
  addCosineComponent(
    signalId: number,
    amplitude: number,
    frequency: number,
    phase: number
  ): void;
  amModulate(
    messageSignalId: number,
    carrierFrequency: number,
    carrierAmplitude: number,
    modulationIndex: number,
    initialPhase: number
  ): number;
  dsbScModulate(
    messageSignalId: number,
    carrierFrequency: number,
    carrierAmplitude: number,
    initialPhase: number
  ): number;
  ssbModulate(
    messageSignalId: number,
    carrierFrequency: number,
    carrierAmplitude: number,
    initialPhase: number,
    sideband: number
  ): number;
  fmModulate(
    messageSignalId: number,
    carrierFrequency: number,
    carrierAmplitude: number,
    frequencySensitivity: number,
    initialPhase: number
  ): number;
  pmModulate(
    messageSignalId: number,
    carrierFrequency: number,
    carrierAmplitude: number,
    phaseSensitivity: number,
    initialPhase: number
  ): number;
  generateCarrier(
    signalId: number,
    amplitude: number,
    frequency: number,
    phase: number
  ): void;
  generateSine(
    signalId: number,
    amplitude: number,
    frequency: number,
    phase: number
  ): void;
};

export type SignalSnapshot = {
  signalId: number;
  sampleRate: number;
  samples: Float32Array;
};

export type SignalBundle = {
  carrier: SignalSnapshot;
  message: SignalSnapshot;
  modulated: SignalSnapshot;
};

type MessageSignalInput = {
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  outputLength: number;
  outputSampleRate: number;
};

let modulePromise: Promise<DspModule> | null = null;

async function loadModuleFactory() {
  const moduleUrl = "/wasm/dsp.js";
  const imported = await import(/* webpackIgnore: true */ moduleUrl);
  return imported.default as (options?: {
    locateFile?: (path: string) => string;
  }) => Promise<DspModule>;
}

async function getModule() {
  if (!modulePromise) {
    modulePromise = loadModuleFactory().then((createModule) =>
      createModule({
        locateFile: (path) => `/wasm/${path}`,
      })
    );
  }

  return modulePromise;
}

export async function createDspClient(): Promise<DspExports> {
  const wasmModule = await getModule();
  const createSignal: DspExports["createSignal"] = wasmModule.cwrap(
    "dsp_create_signal",
    "number",
    ["number", "number"]
  );
  const destroySignal: DspExports["destroySignal"] = wasmModule.cwrap(
    "dsp_destroy_signal",
    null,
    ["number"]
  );
  const getSignalPointer: DspExports["getSignalPointer"] = wasmModule.cwrap(
    "dsp_get_signal_ptr",
    "number",
    ["number"]
  );
  const getSignalLength: DspExports["getSignalLength"] = wasmModule.cwrap(
    "dsp_get_signal_length",
    "number",
    ["number"]
  );
  const getSignalSampleRate: DspExports["getSignalSampleRate"] = wasmModule.cwrap(
    "dsp_get_signal_sample_rate",
    "number",
    ["number"]
  );
  const getSignalSample: DspExports["getSignalSample"] = wasmModule.cwrap("dsp_get_signal_sample", "number", [
    "number",
    "number",
  ]);
  const setSignalSample: DspExports["setSignalSample"] = wasmModule.cwrap(
    "dsp_set_signal_sample",
    "number",
    ["number", "number", "number"]
  ) as DspExports["setSignalSample"];
  const fftMagnitudeSpectrum: DspExports["fftMagnitudeSpectrum"] = wasmModule.cwrap("dsp_fft_magnitude_spectrum", "number", [
    "number",
  ]);
  const fftMagnitudeSpectrumSized: DspExports["fftMagnitudeSpectrumSized"] = wasmModule.cwrap(
    "dsp_fft_magnitude_spectrum_sized",
    "number",
    ["number", "number"]
  );
  const clearSignal: DspExports["clearSignal"] = wasmModule.cwrap("dsp_clear_signal", null, ["number"]);
  const addSineComponent: DspExports["addSineComponent"] = wasmModule.cwrap("dsp_add_sine_component", null, [
    "number",
    "number",
    "number",
    "number",
  ]);
  const addCosineComponent: DspExports["addCosineComponent"] = wasmModule.cwrap("dsp_add_cosine_component", null, [
    "number",
    "number",
    "number",
    "number",
  ]);
  const amModulate: DspExports["amModulate"] = wasmModule.cwrap("dsp_am_modulate", "number", [
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  const dsbScModulate: DspExports["dsbScModulate"] = wasmModule.cwrap("dsp_dsb_sc_modulate", "number", [
    "number",
    "number",
    "number",
    "number",
  ]);
  const ssbModulate: DspExports["ssbModulate"] = wasmModule.cwrap("dsp_ssb_modulate", "number", [
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  const fmModulate: DspExports["fmModulate"] = wasmModule.cwrap("dsp_fm_modulate", "number", [
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  const pmModulate: DspExports["pmModulate"] = wasmModule.cwrap("dsp_pm_modulate", "number", [
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  const generateCarrier: DspExports["generateCarrier"] = wasmModule.cwrap("dsp_generate_carrier", null, [
    "number",
    "number",
    "number",
    "number",
  ]);
  const generateSine: DspExports["generateSine"] = wasmModule.cwrap("dsp_generate_sine", null, [
    "number",
    "number",
    "number",
    "number",
  ]);

  return {
    createSignal,
    destroySignal,
    getSignalPointer,
    getSignalLength,
    getSignalSampleRate,
    getSignalSample,
    setSignalSample,
    writeSignalSamples(signalId, samples) {
      const signalLength = getSignalLength(signalId);
      if (signalLength <= 0) {
        throw new Error("WASM signal buffer is not available.");
      }
      for (let index = 0; index < signalLength; index += 1) {
        setSignalSample(signalId, index, samples[index] ?? 0);
      }
    },
    fftMagnitudeSpectrum,
    fftMagnitudeSpectrumSized,
    clearSignal,
    addSineComponent,
    addCosineComponent,
    amModulate,
    dsbScModulate,
    ssbModulate,
    fmModulate,
    pmModulate,
    generateCarrier,
    generateSine,
  };
}

export async function readSignalSnapshot(signalId: number): Promise<SignalSnapshot> {
  const dsp = await createDspClient();
  const actualLength = dsp.getSignalLength(signalId);
  const actualSampleRate = dsp.getSignalSampleRate(signalId);

  if (actualLength <= 0 || actualSampleRate <= 0) {
    throw new Error("WASM module returned an invalid signal.");
  }

  const samples = new Float32Array(actualLength);
  for (let index = 0; index < actualLength; index += 1) {
    samples[index] = dsp.getSignalSample(signalId, index);
  }

  return {
    signalId,
    sampleRate: actualSampleRate,
    samples,
  };
}

function renderRecordedMessage(
  recordedMessage: Pick<RecordedMessageClip, "sampleRate" | "samples">,
  outputLength: number,
  outputSampleRate: number
) {
  const renderedSamples = new Float32Array(outputLength);

  if (
    outputLength <= 0 ||
    outputSampleRate <= 0 ||
    recordedMessage.sampleRate <= 0 ||
    recordedMessage.samples.length === 0
  ) {
    return renderedSamples;
  }

  const inputSamples = recordedMessage.samples;
  const inputLength = inputSamples.length;

  if (inputLength === 1) {
    renderedSamples.fill(inputSamples[0]);
    return renderedSamples;
  }

  const durationSeconds = inputLength / recordedMessage.sampleRate;
  if (durationSeconds <= 0) {
    return renderedSamples;
  }

  for (let index = 0; index < outputLength; index += 1) {
    const wrappedTimeSeconds = (index / outputSampleRate) % durationSeconds;
    const sourcePosition = wrappedTimeSeconds * recordedMessage.sampleRate;
    const lowerIndex = Math.floor(sourcePosition) % inputLength;
    const upperIndex = (lowerIndex + 1) % inputLength;
    const blend = sourcePosition - Math.floor(sourcePosition);

    renderedSamples[index] =
      inputSamples[lowerIndex] * (1 - blend) +
      inputSamples[upperIndex] * blend;
  }

  return renderedSamples;
}

function populateMessageSignal(
  dsp: DspExports,
  signalId: number,
  {
    messageComponents = [],
    recordedMessage = null,
    outputLength,
    outputSampleRate,
  }: MessageSignalInput
) {
  dsp.clearSignal(signalId);

  if (recordedMessage && recordedMessage.samples.length > 0) {
    dsp.writeSignalSamples(
      signalId,
      renderRecordedMessage(recordedMessage, outputLength, outputSampleRate)
    );
    return;
  }

  for (const component of messageComponents) {
    if (component.type === "sine") {
      dsp.addSineComponent(
        signalId,
        component.amplitude,
        component.frequency,
        component.phase
      );
    } else {
      dsp.addCosineComponent(
        signalId,
        component.amplitude,
        component.frequency,
        component.phase
      );
    }
  }
}

export async function generateSineSnapshot(options?: {
  length?: number;
  sampleRate?: number;
  amplitude?: number;
  frequency?: number;
  phase?: number;
}): Promise<SignalSnapshot> {
  const {
    length = 512,
    sampleRate = 48_000,
    amplitude = 0.85,
    frequency = 1_000,
    phase = 0,
  } = options ?? {};
  const dsp = await createDspClient();
  const signalId = dsp.createSignal(length, sampleRate);

  if (signalId < 0) {
    throw new Error("Failed to allocate signal in WASM module.");
  }

  dsp.generateSine(signalId, amplitude, frequency, phase);

  const actualLength = dsp.getSignalLength(signalId);
  const actualSampleRate = dsp.getSignalSampleRate(signalId);

  if (actualLength <= 0 || actualSampleRate <= 0) {
    dsp.destroySignal(signalId);
    throw new Error("WASM module returned an invalid signal.");
  }

  const samples = new Float32Array(actualLength);
  for (let index = 0; index < actualLength; index += 1) {
    samples[index] = dsp.getSignalSample(signalId, index);
  }

  return {
    signalId,
    sampleRate: actualSampleRate,
    samples,
  };
}

export async function generateCarrierSnapshot(options?: {
  length?: number;
  sampleRate?: number;
  amplitude?: number;
  frequency?: number;
  phase?: number;
}): Promise<SignalSnapshot> {
  const {
    length = 512,
    sampleRate = 48_000,
    amplitude = 1,
    frequency = 1_000,
    phase = 0,
  } = options ?? {};
  const dsp = await createDspClient();
  const signalId = dsp.createSignal(length, sampleRate);

  if (signalId < 0) {
    throw new Error("Failed to allocate carrier signal in WASM module.");
  }

  dsp.generateCarrier(signalId, amplitude, frequency, phase);

  return readSignalSnapshot(signalId);
}

export async function generateDsbLcBundle(options?: {
  length?: number;
  sampleRate?: number;
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
  modulationIndex?: number;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
    recordedMessage = null,
    carrierAmplitude = 1,
    carrierFrequency = 1000,
    carrierPhase = 0,
    modulationIndex = 0.8,
  } = options ?? {};
  const dsp = await createDspClient();

  const messageSignalId = dsp.createSignal(length, sampleRate);
  const carrierSignalId = dsp.createSignal(length, sampleRate);

  if (messageSignalId < 0 || carrierSignalId < 0) {
    if (messageSignalId >= 0) {
      dsp.destroySignal(messageSignalId);
    }

    if (carrierSignalId >= 0) {
      dsp.destroySignal(carrierSignalId);
    }

    throw new Error("Failed to allocate AM signals in the WASM module.");
  }

  populateMessageSignal(dsp, messageSignalId, {
    messageComponents,
    recordedMessage,
    outputLength: length,
    outputSampleRate: sampleRate,
  });

  dsp.generateCarrier(carrierSignalId, carrierAmplitude, carrierFrequency, carrierPhase);

  const modulatedSignalId = dsp.amModulate(
    messageSignalId,
    carrierFrequency,
    carrierAmplitude,
    modulationIndex,
    carrierPhase
  );

  if (modulatedSignalId < 0) {
    dsp.destroySignal(messageSignalId);
    dsp.destroySignal(carrierSignalId);
    throw new Error("Failed to generate DSB-LC signal in the WASM module.");
  }

  return {
    message: await readSignalSnapshot(messageSignalId),
    carrier: await readSignalSnapshot(carrierSignalId),
    modulated: await readSignalSnapshot(modulatedSignalId),
  };
}

export async function generateDsbScBundle(options?: {
  length?: number;
  sampleRate?: number;
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
    recordedMessage = null,
    carrierAmplitude = 1,
    carrierFrequency = 1000,
    carrierPhase = 0,
  } = options ?? {};
  const dsp = await createDspClient();

  const messageSignalId = dsp.createSignal(length, sampleRate);
  const carrierSignalId = dsp.createSignal(length, sampleRate);

  if (messageSignalId < 0 || carrierSignalId < 0) {
    if (messageSignalId >= 0) {
      dsp.destroySignal(messageSignalId);
    }

    if (carrierSignalId >= 0) {
      dsp.destroySignal(carrierSignalId);
    }

    throw new Error("Failed to allocate DSB-SC signals in the WASM module.");
  }

  populateMessageSignal(dsp, messageSignalId, {
    messageComponents,
    recordedMessage,
    outputLength: length,
    outputSampleRate: sampleRate,
  });

  dsp.generateCarrier(carrierSignalId, carrierAmplitude, carrierFrequency, carrierPhase);

  const modulatedSignalId = dsp.dsbScModulate(
    messageSignalId,
    carrierFrequency,
    carrierAmplitude,
    carrierPhase
  );

  if (modulatedSignalId < 0) {
    dsp.destroySignal(messageSignalId);
    dsp.destroySignal(carrierSignalId);
    throw new Error("Failed to generate DSB-SC signal in the WASM module.");
  }

  return {
    message: await readSignalSnapshot(messageSignalId),
    carrier: await readSignalSnapshot(carrierSignalId),
    modulated: await readSignalSnapshot(modulatedSignalId),
  };
}

export async function generateSsbBundle(options?: {
  length?: number;
  sampleRate?: number;
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
  sideband?: SsbSideband;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
    recordedMessage = null,
    carrierAmplitude = 1,
    carrierFrequency = 1000,
    carrierPhase = 0,
    sideband = "USB",
  } = options ?? {};
  const dsp = await createDspClient();

  const messageSignalId = dsp.createSignal(length, sampleRate);
  const carrierSignalId = dsp.createSignal(length, sampleRate);

  if (messageSignalId < 0 || carrierSignalId < 0) {
    if (messageSignalId >= 0) {
      dsp.destroySignal(messageSignalId);
    }

    if (carrierSignalId >= 0) {
      dsp.destroySignal(carrierSignalId);
    }

    throw new Error("Failed to allocate SSB signals in the WASM module.");
  }

  populateMessageSignal(dsp, messageSignalId, {
    messageComponents,
    recordedMessage,
    outputLength: length,
    outputSampleRate: sampleRate,
  });

  dsp.generateCarrier(carrierSignalId, carrierAmplitude, carrierFrequency, carrierPhase);

  const modulatedSignalId = dsp.ssbModulate(
    messageSignalId,
    carrierFrequency,
    carrierAmplitude,
    carrierPhase,
    sideband === "USB" ? 1 : -1
  );

  if (modulatedSignalId < 0) {
    dsp.destroySignal(messageSignalId);
    dsp.destroySignal(carrierSignalId);
    throw new Error("Failed to generate SSB signal in the WASM module.");
  }

  return {
    message: await readSignalSnapshot(messageSignalId),
    carrier: await readSignalSnapshot(carrierSignalId),
    modulated: await readSignalSnapshot(modulatedSignalId),
  };
}

export async function generateFmBundle(options?: {
  length?: number;
  sampleRate?: number;
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
  frequencySensitivity?: number;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
    recordedMessage = null,
    carrierAmplitude = 1,
    carrierFrequency = 1000,
    carrierPhase = 0,
    frequencySensitivity = 250,
  } = options ?? {};
  const dsp = await createDspClient();

  const messageSignalId = dsp.createSignal(length, sampleRate);
  const carrierSignalId = dsp.createSignal(length, sampleRate);

  if (messageSignalId < 0 || carrierSignalId < 0) {
    if (messageSignalId >= 0) {
      dsp.destroySignal(messageSignalId);
    }

    if (carrierSignalId >= 0) {
      dsp.destroySignal(carrierSignalId);
    }

    throw new Error("Failed to allocate FM signals in the WASM module.");
  }

  populateMessageSignal(dsp, messageSignalId, {
    messageComponents,
    recordedMessage,
    outputLength: length,
    outputSampleRate: sampleRate,
  });

  dsp.generateCarrier(carrierSignalId, carrierAmplitude, carrierFrequency, carrierPhase);

  const modulatedSignalId = dsp.fmModulate(
    messageSignalId,
    carrierFrequency,
    carrierAmplitude,
    frequencySensitivity,
    carrierPhase
  );

  if (modulatedSignalId < 0) {
    dsp.destroySignal(messageSignalId);
    dsp.destroySignal(carrierSignalId);
    throw new Error("Failed to generate FM signal in the WASM module.");
  }

  return {
    message: await readSignalSnapshot(messageSignalId),
    carrier: await readSignalSnapshot(carrierSignalId),
    modulated: await readSignalSnapshot(modulatedSignalId),
  };
}

export async function generatePmBundle(options?: {
  length?: number;
  sampleRate?: number;
  messageComponents?: MessageComponent[];
  recordedMessage?: Pick<RecordedMessageClip, "sampleRate" | "samples"> | null;
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
  phaseSensitivity?: number;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
    recordedMessage = null,
    carrierAmplitude = 1,
    carrierFrequency = 1000,
    carrierPhase = 0,
    phaseSensitivity = 1,
  } = options ?? {};
  const dsp = await createDspClient();

  const messageSignalId = dsp.createSignal(length, sampleRate);
  const carrierSignalId = dsp.createSignal(length, sampleRate);

  if (messageSignalId < 0 || carrierSignalId < 0) {
    if (messageSignalId >= 0) {
      dsp.destroySignal(messageSignalId);
    }

    if (carrierSignalId >= 0) {
      dsp.destroySignal(carrierSignalId);
    }

    throw new Error("Failed to allocate PM signals in the WASM module.");
  }

  populateMessageSignal(dsp, messageSignalId, {
    messageComponents,
    recordedMessage,
    outputLength: length,
    outputSampleRate: sampleRate,
  });

  dsp.generateCarrier(carrierSignalId, carrierAmplitude, carrierFrequency, carrierPhase);

  const modulatedSignalId = dsp.pmModulate(
    messageSignalId,
    carrierFrequency,
    carrierAmplitude,
    phaseSensitivity,
    carrierPhase
  );

  if (modulatedSignalId < 0) {
    dsp.destroySignal(messageSignalId);
    dsp.destroySignal(carrierSignalId);
    throw new Error("Failed to generate PM signal in the WASM module.");
  }

  return {
    message: await readSignalSnapshot(messageSignalId),
    carrier: await readSignalSnapshot(carrierSignalId),
    modulated: await readSignalSnapshot(modulatedSignalId),
  };
}
