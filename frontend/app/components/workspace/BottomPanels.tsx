import TimeDomainPanel from "./TimeDomainPanel";
import FrequencySpectrumPanel from "./FrequencySpectrumPanel";

type BottomPanelsProps = {
  samples: Float32Array | null;
  signalLabel: string;
};

export default function BottomPanels({ samples, signalLabel }: BottomPanelsProps) {
  return (
    <div className="flex h-[320px] gap-4 overflow-hidden border-t border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-lowest)] p-4">
      <TimeDomainPanel samples={samples} signalLabel={signalLabel} />
      <FrequencySpectrumPanel />
    </div>
  );
}
