'use client';

import type { MessageComponent } from "@/app/components/workspace/types";

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
  fftMagnitudeSpectrum(signalId: number): number;
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

  return {
    createSignal: wasmModule.cwrap("dsp_create_signal", "number", ["number", "number"]),
    destroySignal: wasmModule.cwrap("dsp_destroy_signal", null, ["number"]),
    getSignalPointer: wasmModule.cwrap("dsp_get_signal_ptr", "number", ["number"]),
    getSignalLength: wasmModule.cwrap("dsp_get_signal_length", "number", ["number"]),
    getSignalSampleRate: wasmModule.cwrap("dsp_get_signal_sample_rate", "number", ["number"]),
    getSignalSample: wasmModule.cwrap("dsp_get_signal_sample", "number", [
      "number",
      "number",
    ]),
    fftMagnitudeSpectrum: wasmModule.cwrap("dsp_fft_magnitude_spectrum", "number", [
      "number",
    ]),
    clearSignal: wasmModule.cwrap("dsp_clear_signal", null, ["number"]),
    addSineComponent: wasmModule.cwrap("dsp_add_sine_component", null, [
      "number",
      "number",
      "number",
      "number",
    ]),
    addCosineComponent: wasmModule.cwrap("dsp_add_cosine_component", null, [
      "number",
      "number",
      "number",
      "number",
    ]),
    amModulate: wasmModule.cwrap("dsp_am_modulate", "number", [
      "number",
      "number",
      "number",
      "number",
      "number",
    ]),
    generateCarrier: wasmModule.cwrap("dsp_generate_carrier", null, [
      "number",
      "number",
      "number",
      "number",
    ]),
    generateSine: wasmModule.cwrap("dsp_generate_sine", null, [
      "number",
      "number",
      "number",
      "number",
    ]),
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
  carrierAmplitude?: number;
  carrierFrequency?: number;
  carrierPhase?: number;
  modulationIndex?: number;
}): Promise<SignalBundle> {
  const {
    length = 4096,
    sampleRate = 4096,
    messageComponents = [],
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

  dsp.clearSignal(messageSignalId);
  for (const component of messageComponents) {
    if (component.type === "sine") {
      dsp.addSineComponent(
        messageSignalId,
        component.amplitude,
        component.frequency,
        component.phase
      );
    } else {
      dsp.addCosineComponent(
        messageSignalId,
        component.amplitude,
        component.frequency,
        component.phase
      );
    }
  }

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
