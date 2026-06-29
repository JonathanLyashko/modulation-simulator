import type { PlotSettings, SignalSnapshot, SignalView } from "./types";
import TimeDomainPanel from "./TimeDomainPanel";
import FrequencySpectrumPanel from "./FrequencySpectrumPanel";

type BottomPanelsProps = {
  signals: Record<SignalView, SignalSnapshot | null>;
  selectedSignalView: SignalView;
  plotSettings: PlotSettings;
  playbackCursorSeconds: number | null;
};

export default function BottomPanels({
  signals,
  selectedSignalView,
  plotSettings,
  playbackCursorSeconds,
}: BottomPanelsProps) {
  return (
    <div className="flex h-[320px] gap-4 overflow-hidden border-t border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
      <TimeDomainPanel
        signals={signals}
        selectedSignalView={selectedSignalView}
        plotSettings={plotSettings}
        playbackCursorSeconds={playbackCursorSeconds}
      />
      <FrequencySpectrumPanel />
    </div>
  );
}
