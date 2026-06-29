import type { PlotSettings } from "./types";
import TimeDomainPanel from "./TimeDomainPanel";
import FrequencySpectrumPanel from "./FrequencySpectrumPanel";

type BottomPanelsProps = {
  samples: Float32Array | null;
  sampleRate: number | null;
  signalLabel: string;
  plotSettings: PlotSettings;
  playbackCursorSeconds: number | null;
};

export default function BottomPanels({
  samples,
  sampleRate,
  signalLabel,
  plotSettings,
  playbackCursorSeconds,
}: BottomPanelsProps) {
  return (
    <div className="flex h-[320px] gap-4 overflow-hidden border-t border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
      <TimeDomainPanel
        samples={samples}
        sampleRate={sampleRate}
        signalLabel={signalLabel}
        plotSettings={plotSettings}
        playbackCursorSeconds={playbackCursorSeconds}
      />
      <FrequencySpectrumPanel />
    </div>
  );
}
