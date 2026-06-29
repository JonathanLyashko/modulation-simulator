'use client';

type DspModule = {
  HEAPF32: Float32Array;
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
    generateSine: wasmModule.cwrap("dsp_generate_sine", null, [
      "number",
      "number",
      "number",
      "number",
    ]),
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
  const wasmModule = await getModule();
  const dsp = await createDspClient();
  const signalId = dsp.createSignal(length, sampleRate);

  if (signalId < 0) {
    throw new Error("Failed to allocate signal in WASM module.");
  }

  dsp.generateSine(signalId, amplitude, frequency, phase);

  const pointer = dsp.getSignalPointer(signalId);
  const actualLength = dsp.getSignalLength(signalId);
  const actualSampleRate = dsp.getSignalSampleRate(signalId);

  if (pointer === 0 || actualLength <= 0 || actualSampleRate <= 0) {
    dsp.destroySignal(signalId);
    throw new Error("WASM module returned an invalid signal.");
  }

  const start = pointer / Float32Array.BYTES_PER_ELEMENT;
  const samples = wasmModule.HEAPF32.slice(start, start + actualLength);

  return {
    signalId,
    sampleRate: actualSampleRate,
    samples,
  };
}
