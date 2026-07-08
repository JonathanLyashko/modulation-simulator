function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--ui-text-muted)]">
      {children}
    </span>
  );
}

function SectionTitle({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold tracking-tight text-[color:var(--ui-text)] scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[#f7f9fc] px-5 py-4 text-[13px] leading-6 text-[color:var(--ui-text)]">
      <code>{children}</code>
    </pre>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--ui-text-muted)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--ui-primary)]">
        {value}
      </div>
      <p className="mt-3 text-[13px] leading-6 text-[color:var(--ui-text-muted)]">
        {note}
      </p>
    </div>
  );
}

function BulletList({ items }: { items: readonly React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-4 text-[13px] leading-6 text-[color:var(--ui-text-muted)]">
      {items.map((item, index) => (
        <li key={index} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function DocumentationReference() {
  return (
    <main className="flex-1 overflow-y-auto bg-[color:var(--ui-surface)]">
      <div className="mx-auto min-h-screen max-w-[860px] bg-white px-12 py-16 shadow-[0_0_0_1px_rgba(195,198,214,0.55)]">
        <header className="mb-12">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--ui-text-muted)]">
            Technical Documentation
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-[color:var(--ui-text)]">
            Browser-side DSP architecture
          </h1>
          <p className="mt-4 max-w-3xl text-sm italic leading-7 text-[color:var(--ui-text-muted)]">
            Next.js UI, TypeScript control layer, C++ DSP core, Emscripten
            WebAssembly target. Signal generation, FFTs, microphone preprocessing,
            playback, and plotting execute in the user&apos;s browser. No server-side
            DSP path exists.
          </p>
          <div className="mt-8 h-px bg-[color:var(--ui-outline-variant)]/50" />
        </header>

        <section id="overview" className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10">
          <SectionTitle>1. System Overview</SectionTitle>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MetricCard
              label="DSP Language"
              value="C++ -> WASM"
              note="Signal storage, modulation kernels, carrier synthesis, and FFT exports are compiled with Emscripten."
            />
            <MetricCard
              label="Execution Model"
              value="100% Browser"
              note="Computation and memory live on the client: no backend simulation service."
            />
            <MetricCard
              label="Baseline Rate"
              value="48 kHz"
              note="Frontend raises the rate further when Nyquist or oversampling constraints exceed the floor."
            />
          </div>

          <div className="mt-10 space-y-8">
            <div>
              <SectionEyebrow>Runtime stack</SectionEyebrow>
              <BulletList
                items={[
                  <>App shell: Next.js App Router + React client components.</>,
                  <>DSP load path: dynamic import of <code>/wasm/dsp.js</code> plus browser instantiation of <code>dsp.wasm</code>.</>,
                  <>Bridge: <code>dspClient.ts</code> wraps exported C ABI with Emscripten <code>cwrap</code>.</>,
                  <>Data boundary: WASM signal buffers are copied into JavaScript <code>Float32Array</code> snapshots for plotting, playback, and recorded-message reuse.</>,
                ]}
              />
            </div>

            <div>
              <SectionEyebrow>High-level flow</SectionEyebrow>
              <CodeBlock>{`UI controls -> SignalWorkspace state
           -> dspClient bridge
           -> C++ signal allocation and modulation
           -> signal snapshots copied back to JS
           -> waveform panel, FFT panel, and audio preview`}</CodeBlock>
            </div>
          </div>
        </section>

        <section id="browser-runtime" className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10">
          <SectionTitle>2. Browser Runtime</SectionTitle>
          <div className="mt-8 space-y-10">
            <div>
              <SectionEyebrow>Execution model</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                Parameter edits trigger local recomputation in
                <code> SignalWorkspace.tsx</code>. The frontend derives
                <code> sampleRate</code>, <code> sampleCount</code>, FFT
                resolution, and plot bounds, calls the WASM kernel, reads back
                six signal snapshots in the typical case, and renders them
                directly. Microphone capture, decode, low-pass filtering,
                normalization, and looped playback also stay client-side.
              </p>
            </div>

            <div>
              <SectionEyebrow>Time base and frequency verification</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                The app does not need a wall-clock timing source to define
                frequency. Generated signals are discrete-time buffers indexed by
                sample number <code>n</code> with declared sample rate
                <code> f_s</code>, so the implied time base is
                <code> t[n] = n / f_s</code>. Carrier and message samples are
                synthesized on that uniform grid, so equal spacing is part of
                the signal definition, not something inferred from browser
                scheduling. Frequency checks follow directly:
                <code> f = f_s / N_period</code> in the time domain and
                <code> Δf = f_s / N_fft</code> for FFT bin spacing. Recorded
                audio follows the same assumption after browser decode and
                resampling: once it becomes an <code>AudioBuffer</code>, it is
                treated as fixed-rate PCM on a uniform grid.
              </p>
            </div>

            <div id="wasm-bridge">
              <SectionEyebrow>WASM bridge</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                <code>frontend/app/lib/dspClient.ts</code> lazily imports the
                generated module, binds exported C symbols, and exposes a typed
                API for allocation, destruction, per-sample read/write, additive
                message construction, carrier generation, AM, DSB-SC, SSB, FM,
                PM, and FFT magnitude generation.
              </p>
              <div className="mt-5">
                <CodeBlock>{`const amModulate = wasmModule.cwrap("dsp_am_modulate", "number", [
  "number", "number", "number", "number", "number"
]);`}</CodeBlock>
              </div>
            </div>

            <div id="audio-capture">
              <SectionEyebrow>Audio capture path</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                Capture uses <code>MediaRecorder</code>. The blob is decoded by
                <code> AudioContext</code>, resampled and filtered in an
                <code> OfflineAudioContext</code>, mixed to mono, peak-normalized,
                and stored as a <code>Float32Array</code>. Recorded clips are then
                rendered into WASM signal buffers as looping message sources.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Clip Duration"
                  value="1 s - 10 s"
                  note="UI-bound recording window."
                />
                <MetricCard
                  label="Clip Bandwidth"
                  value="5 kHz LPF"
                  note="Applied before message reuse."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="signal-generation" className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10">
          <SectionTitle>3. Signal Pipeline</SectionTitle>
          <div className="mt-8 space-y-10">
            <div>
              <SectionEyebrow>Generation path</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                Each recomputation produces three primary signals:
                message, carrier, modulated. The frontend allocates message and
                carrier buffers in WASM, fills the message from additive tones
                or recorded audio, synthesizes the carrier, then calls the
                selected modulation kernel to allocate the output buffer.
              </p>
              <div className="mt-5">
                <CodeBlock>{`messageSignalId = createSignal(length, sampleRate)
carrierSignalId = createSignal(length, sampleRate)
populateMessageSignal(...)
generateCarrier(...)
modulatedSignalId = dsp_*_modulate(...)`}</CodeBlock>
              </div>
            </div>

            <div id="fft-processing">
              <SectionEyebrow>FFT processing</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                After time-domain generation, the frontend requests three more
                WASM signals: magnitude spectra for message, carrier, and
                modulated outputs. Default FFT size is 8192; supported sizes are
                1024, 2048, 4096, 8192, and 16384. The frontend then applies
                center/span clipping and y-scale transforms for the visible plot.
              </p>
            </div>

            <div id="data-volume">
              <SectionEyebrow>How much data is processed</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                Signal length is computed as:
              </p>
              <div className="mt-5">
                <CodeBlock>{`sampleCount = max(
  1024,
  fftSize,
  ceil(sampleRate * requestedWindowSeconds)
)`}</CodeBlock>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Default FFT"
                  value="8192"
                  note="Dominates the default sample count at the 48 kHz floor and 0.125 s window."
                />
                <MetricCard
                  label="Default JS Sample Payload"
                  value="~192 KB"
                  note="Six 8192-sample Float32Array snapshots per update: three time-domain plus three spectra."
                />
                <MetricCard
                  label="Max Recorded Clip Buffer"
                  value="~480 KB"
                  note="10 s at 12 kHz is about 120,000 float samples before extra WASM copies and UI state overhead."
                />
              </div>
              <p className="mt-6 text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                These values describe JavaScript-side typed arrays only. Matching
                buffers also exist inside WASM, so active recomputation uses a
                larger total in-browser working set.
              </p>
            </div>
          </div>
        </section>

        <section id="build-system" className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10">
          <SectionTitle>4. Build and Operations</SectionTitle>
          <div className="mt-8 space-y-10">
            <div>
              <SectionEyebrow>Build pipeline</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                Emscripten compiles the C++ sources through
                <code> wasm/Makefile</code> and emits
                <code> frontend/public/wasm/dsp.js</code> plus
                <code> frontend/public/wasm/dsp.wasm</code>. Key flags:
                <code> MODULARIZE</code>, <code>EXPORT_ES6</code>,
                <code> ENVIRONMENT=web</code>, and
                <code> ALLOW_MEMORY_GROWTH</code>.
              </p>
              <div className="mt-5">
                <CodeBlock>{`emcc src/*.cpp -O3 --no-entry \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web \
  -s ALLOW_MEMORY_GROWTH=1 \
  -o ../frontend/public/wasm/dsp.js`}</CodeBlock>
              </div>
            </div>

            <div id="project-layout">
              <SectionEyebrow>Project layout</SectionEyebrow>
              <CodeBlock>{`frontend/
  app/
    components/workspace/   React UI, plots, controls, routing shell
    components/learn/       theory-oriented reference page
    components/documentation/ implementation reference page
    lib/dspClient.ts        JS <-> WASM bridge
    lib/audioRecording.ts   microphone capture and preprocessing

wasm/
  src/dsp_api.cpp          exported C ABI shim
  src/modulation.cpp       modulation implementations
  src/signal.cpp           signal storage and synthesis primitives
  src/fft.cpp              FFT magnitude generation
  include/                 shared headers`}</CodeBlock>
            </div>
          </div>
        </section>

        <footer className="pb-6 pt-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-[color:var(--ui-text-muted)]/60">
            End of Technical Documentation - Precision Signal Lab
          </p>
        </footer>
      </div>
    </main>
  );
}
