# Precision Signal Lab

Browser-side analog modulation simulator built as a Next.js frontend over a C++ DSP core compiled to WebAssembly with Emscripten. Signal generation, modulation, FFT computation, microphone preprocessing, plotting, and audio preview all run in the user's browser. There is no server-side DSP path.

## System Overview

- DSP core: C++ compiled to WebAssembly.
- UI/control layer: Next.js App Router, React, TypeScript.
- Runtime model: 100% client-side execution.
- Baseline sample-rate floor: `48 kHz`.
- Supported schemes: `DSB-LC`, `DSB-SC`, `SSB`, `FM`, `PM`.

High-level flow:

```text
UI controls
-> SignalWorkspace state
-> frontend/app/lib/dspClient.ts
-> WebAssembly C ABI
-> C++ signal allocation + modulation
-> Float32Array snapshots copied back to JS
-> waveform plot + spectrum plot + audio preview
```

## Architecture

### Frontend

The frontend owns:

- scheme selection and UI state,
- sample-rate and sample-count derivation,
- plot center/span/scale controls,
- microphone capture and preprocessing,
- audio playback,
- conversion of WASM buffers into JavaScript `Float32Array` snapshots.

`frontend/app/lib/dspClient.ts` lazily imports `/wasm/dsp.js`, instantiates `dsp.wasm`, and binds the exported C ABI through Emscripten `cwrap`. The bridge exposes typed operations for:

- signal allocation and destruction,
- direct sample reads/writes,
- additive sine/cosine message synthesis,
- carrier generation,
- DSB-LC / DSB-SC / SSB / FM / PM modulation,
- FFT magnitude generation.

### DSP Core

The C++ side owns:

- signal storage,
- buffer clearing,
- carrier and primitive waveform synthesis,
- modulation kernels,
- Hilbert-based SSB path,
- FFT magnitude export.

Generated artifacts:

- `frontend/public/wasm/dsp.js`
- `frontend/public/wasm/dsp.wasm`

## Browser Runtime Model

Parameter changes trigger local recomputation in `frontend/app/components/workspace/SignalWorkspace.tsx`. The frontend derives:

- `sampleRate`
- `sampleCount`
- visible plot bounds
- FFT size and resulting frequency resolution

It then allocates or regenerates the active message, carrier, modulated, and spectral buffers through the WASM bridge. Typical recomputation produces:

- 3 time-domain signals: message, carrier, modulated
- 3 frequency-domain signals: message spectrum, carrier spectrum, modulated spectrum

All of this happens in browser memory.

## Time Base and Frequency Verification

The simulator does not need a wall-clock timing source to define frequency. The signals are discrete-time buffers defined on a uniform sampling grid.

For sample index `n` and sample rate `f_s`:

```text
t[n] = n / f_s
```

Carrier and message samples are synthesized directly on that grid, so equal spacing is part of the signal definition, not something inferred from browser scheduling. That gives direct verification rules:

- time-domain frequency: `f = f_s / N_period`
- FFT bin spacing: `Δf = f_s / N_fft`

Recorded audio is handled the same way after browser decode and resampling. Once converted into PCM in an `AudioBuffer`, it is treated as uniformly sampled data.

## Sampling Rules

The frontend enforces a minimum Nyquist rate for the represented content.

Core rules:

- `NYQUIST_MULTIPLIER = 2`
- `MIN_SAMPLE_RATE = 48_000`
- `SAMPLES_PER_HIGHEST_FREQUENCY_CYCLE = 32`

For generated tones, the frontend raises the sample rate above the floor when required by:

- Nyquist for the highest represented frequency
- oversampling target for cleaner time-domain rendering and modulation output

For recorded message clips, the chosen rate is at least:

- the clip sample rate after preprocessing,
- the Nyquist minimum,
- the global minimum sample-rate floor.

## Message Sources

### Preset Message Signals

Preset messages are built additively from configurable sine and cosine components. Each component has:

- type,
- amplitude,
- frequency,
- phase.

### Recorded Message Signals

Microphone capture uses:

- `MediaRecorder` for collection,
- `AudioContext` for decode,
- `OfflineAudioContext` for preprocessing.

The recorded path:

1. capture audio in the browser,
2. decode to PCM,
3. mix to mono,
4. low-pass filter,
5. resample,
6. peak-normalize,
7. store as `Float32Array`,
8. write into WASM buffers as a looping message source.

Current recording limits:

- duration: `1 s` to `10 s`
- target processed sample rate: `12 kHz`
- low-pass bandwidth: `5 kHz`

## Modulation Implementations

Implemented analog modulation families:

- amplitude modulation: `DSB-LC`, `DSB-SC`, `SSB`
- angle modulation: `FM`, `PM`

The modulation kernels run in C++ and return new signal IDs for the output buffers.

### DSB-LC

```text
u(t) = A_c [1 + a m_n(t)] cos(2πf_c t)
```

### DSB-SC

```text
u_DSB-SC(t) = A_c m(t) cos(2πf_c t)
```

### SSB

Implemented with a concrete Hilbert-transform path in the DSP layer rather than symbolic phase swapping. The form is:

```text
u_±(t) = A_c [m(t) cos(2πf_c t) ∓ m̂(t) sin(2πf_c t)]
```

where `m̂(t)` is the Hilbert transform of `m(t)`.

### FM

```text
u_FM(t) = A_c cos[2πf_c t + 2πk_f ∫_0^t m(τ)dτ + φ_0]
```

### PM

```text
u_PM(t) = A_c cos[2πf_c t + k_p m(t) + φ_0]
```

## FFT Processing

After time-domain generation, the frontend requests magnitude spectra for:

- message,
- carrier,
- modulated output.

The FFT is computed in C++ and returned as WASM-backed signal buffers, then copied into JS snapshots for rendering.

Supported FFT sizes:

- `1024`
- `2048`
- `4096`
- `8192`
- `16384`

Default FFT size:

- `8192`

Frequency resolution is:

```text
Δf = f_s / N_fft
```

The frequency plot then applies browser-side:

- center-frequency clipping,
- span clipping,
- magnitude or dB display mapping,
- y-axis scaling.

## Data Volume

Signal length is computed as:

```text
sampleCount = max(
  1024,
  fftSize,
  ceil(sampleRate * requestedWindowSeconds)
)
```

Representative working sizes:

- default FFT-dominated signal length at the `48 kHz` floor: `8192` samples,
- default JS snapshot payload: about `192 KB` for six `Float32Array` snapshots of length `8192`,
- maximum recorded clip buffer: about `120,000` float samples for `10 s` at `12 kHz`, or about `480 KB` before additional WASM buffers and UI copies.

These figures describe JavaScript-side arrays only. Matching and intermediate buffers also exist inside the WASM heap, so active recomputation uses a larger total in-browser working set.

## Project Layout

```text
frontend/
  app/
    components/workspace/       main simulator UI
    components/learn/           theory/reference page
    components/documentation/   technical implementation page
    lib/dspClient.ts            JS <-> WASM bridge
    lib/audioRecording.ts       microphone capture and preprocessing
    lib/audioPlayback.ts        browser playback path
  public/wasm/
    dsp.js
    dsp.wasm

wasm/
  include/
    dsp_api.hpp
    fft.hpp
    modulation.hpp
    signal.hpp
    signal_ops.hpp
  src/
    dsp_api.cpp                 exported C ABI shim
    fft.cpp                     FFT magnitude generation
    modulation.cpp              modulation implementations
    signal.cpp                  signal storage and synthesis
    signal_ops.cpp              helper signal operations
  Makefile
```

## Build

### 1. Compile the DSP Core to WebAssembly

You need Emscripten available in the shell that runs `make`.

If `emcc` is not on `PATH`, source the Emscripten environment first:

```bash
source ~/emsdk/emsdk_env.sh
```

Then compile:

```bash
cd wasm
make
```

The Makefile builds all C++ sources and emits:

- `frontend/public/wasm/dsp.js`
- `frontend/public/wasm/dsp.wasm`

Current Emscripten build flags:

```text
--no-entry
-s WASM=1
-s MODULARIZE=1
-s EXPORT_ES6=1
-s ENVIRONMENT=web
-s ALLOW_MEMORY_GROWTH=1
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Run the Frontend

```bash
cd frontend
npm run dev
```

### 4. Production Checks

```bash
cd frontend
npm run lint
npm run build
```

## Operational Notes

- If the WASM build succeeds in one shell but not another, that shell likely does not have the Emscripten environment loaded.
- The frontend dynamically imports `/wasm/dsp.js`; the WASM artifacts must exist before the app can use the DSP layer.
- The entire DSP path is local to the browser, so correctness depends on declared sampling parameters and discrete-time signal construction, not browser UI timing.
