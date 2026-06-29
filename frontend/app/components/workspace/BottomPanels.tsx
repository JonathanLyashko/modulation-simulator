import type {
  FrequencyPlotSettings,
  PlotSettings,
  SignalSnapshot,
  SignalView,
  SpectrumDisplayMode,
} from "./types";
import TimeDomainPanel from "./TimeDomainPanel";
import FrequencySpectrumPanel from "./FrequencySpectrumPanel";

type BottomPanelsProps = {
  signals: Record<SignalView, SignalSnapshot | null>;
  spectra: Record<SignalView, SignalSnapshot | null>;
  selectedSignalView: SignalView;
  plotSettings: PlotSettings;
  frequencyPlotSettings: FrequencyPlotSettings;
  playbackCursorSeconds: number | null;
  spectrumDisplayMode: SpectrumDisplayMode;
};

export default function BottomPanels({
  signals,
  spectra,
  selectedSignalView,
  plotSettings,
  frequencyPlotSettings,
  playbackCursorSeconds,
  spectrumDisplayMode,
}: BottomPanelsProps) {
  return (
    <div className="flex h-[320px] gap-4 overflow-hidden border-t border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
      <TimeDomainPanel
        signals={signals}
        selectedSignalView={selectedSignalView}
        plotSettings={plotSettings}
        playbackCursorSeconds={playbackCursorSeconds}
      />
      <FrequencySpectrumPanel
        spectra={spectra}
        selectedSignalView={selectedSignalView}
        plotSettings={plotSettings}
        frequencyPlotSettings={frequencyPlotSettings}
        spectrumDisplayMode={spectrumDisplayMode}
      />
    </div>
  );
}
