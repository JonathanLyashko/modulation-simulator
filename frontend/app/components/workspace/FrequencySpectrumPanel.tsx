export default function FrequencySpectrumPanel() {
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ui-outline)]">
          <span className="h-3 w-3 rounded-full bg-[color:var(--ui-tertiary)]" />
          Frequency Spectrum
        </div>
        <div className="flex gap-3 text-xs text-[color:var(--ui-text-muted)]">
          <button type="button">⛶</button>
          <button type="button">✣</button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded border border-[color:var(--ui-outline)] bg-[#020617]">
        <svg className="h-full w-full" viewBox="0 0 640 220" preserveAspectRatio="none">
          <path
            d="M 320 188 L 320 45 M 256 188 L 256 130 M 384 188 L 384 130 M 224 188 L 224 160 M 416 188 L 416 160"
            stroke="#22c55e"
            strokeWidth="2.5"
          />
          <path d="M0 188L640 188" stroke="#334155" strokeWidth="1" />
          <path
            d="M 0 188 L 190 188 L 224 160 L 256 130 L 320 45 L 384 130 L 416 160 L 450 188 L 640 188"
            fill="none"
            opacity="0.3"
            stroke="#22c55e"
            strokeWidth="1"
          />
        </svg>
        <div className="absolute bottom-2 right-2 flex gap-4 text-[10px] font-mono text-white/60">
          <span>SPAN: 2 kHz</span>
          <span>RBW: 10 Hz</span>
        </div>
      </div>
    </section>
  );
}
