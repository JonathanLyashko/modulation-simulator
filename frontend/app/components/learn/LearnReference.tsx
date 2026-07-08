import {
  amplitudeSchemes,
  angleSchemes,
  designNotes,
  schemeComparisonRows,
  terminologyRows,
  type LearnSchemeSection,
} from "./learnContent";
import { Bracket, MathBlock, MathInline, Operator, Var } from "./LearnMath";

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

function EquationBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-white px-5 py-5 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]">
      {children}
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

function LearnDocHeader() {
  return (
    <header className="mb-12">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--ui-text-muted)]">
        Modulation Reference
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-[color:var(--ui-text)]">
        Understanding analog modulation
      </h1>
      <p className="mt-4 max-w-3xl text-sm italic leading-7 text-[color:var(--ui-text-muted)]">
        A compact reference for how the main analog schemes in Precision Signal
        Lab behave, where they are used, and what the basic modulator and
        demodulator chains are doing.
      </p>
      <div className="mt-8 h-px bg-[color:var(--ui-outline-variant)]/50" />
    </header>
  );
}

function FoundationsSection() {
  return (
    <section
      id="foundations"
      className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10 scroll-mt-24"
    >
      <SectionTitle>1. Foundations</SectionTitle>
      <div className="mt-10 space-y-10">
        <div>
          <SectionEyebrow>1.1 Terminology</SectionEyebrow>
          <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
            Modulation moves a low-frequency information signal into a form that
            can be transmitted more effectively over a physical channel. The
            message signal{" "}
            <MathInline>
              <Var>m</Var>
              <Bracket>(</Bracket>
              <Var>t</Var>
              <Bracket>)</Bracket>
            </MathInline>{" "}
            contains the information, the carrier{" "}
            <MathInline>
              <Var>c</Var>
              <Bracket>(</Bracket>
              <Var>t</Var>
              <Bracket>)</Bracket>
            </MathInline>{" "}
            provides a higher-frequency transport waveform, and the modulator
            combines them so the channel sees a bandpass signal with useful
            spectral placement.
          </p>
        </div>

        <div>
          <SectionEyebrow>1.2 Core Notation</SectionEyebrow>
          <div className="overflow-x-auto">
            <table className="w-full border-t border-[color:var(--ui-outline-variant)]/40 text-[13px]">
              <thead className="text-left text-[color:var(--ui-text-muted)]/80">
                <tr>
                  <th className="py-3 font-medium">Symbol</th>
                  <th className="py-3 font-medium">Meaning</th>
                  <th className="py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--ui-outline-variant)]/25">
                {terminologyRows.map((row) => (
                  <tr key={row.meaning}>
                    <td className="py-3 font-mono text-[color:var(--ui-primary)]">
                      {row.symbol}
                    </td>
                    <td className="py-3 text-[color:var(--ui-text)]">{row.meaning}</td>
                    <td className="py-3 text-[color:var(--ui-text-muted)]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <SectionEyebrow>1.3 General Signal Model</SectionEyebrow>
          <EquationBox>
            <MathBlock>
              <Var>s</Var>
              <Bracket>(</Bracket>
              <Var>t</Var>
              <Bracket>) = </Bracket>
              <Var>F</Var>
              <Bracket>[</Bracket>
              <Var>m</Var>
              <Bracket>(</Bracket>
              <Var>t</Var>
              <Bracket>), </Bracket>
              <Var>c</Var>
              <Bracket>(</Bracket>
              <Var>t</Var>
              <Bracket>), modulation parameters]</Bracket>
            </MathBlock>
          </EquationBox>
          <p className="mt-4 text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
            In amplitude modulation, the message mainly affects carrier
            amplitude. In angle modulation, the message affects carrier phase or
            instantaneous frequency. The simulator exposes these parameter
            changes directly so the same message can be compared across
            different modulation families.
          </p>
        </div>

        <div>
          <SectionEyebrow>1.4 Bandwidth</SectionEyebrow>
          <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
            If the message has bandwidth{" "}
            <MathInline>
              <Var>B</Var>
            </MathInline>
            , most AM variants occupy translated copies of that bandwidth around
            the carrier. DSB systems typically need{" "}
            <MathInline>
              <Operator>2</Operator>
              <Var>B</Var>
            </MathInline>
            , SSB needs only{" "}
            <MathInline>
              <Var>B</Var>
            </MathInline>
            , and angle modulation often requires more bandwidth because
            sidebands spread according to deviation and message content. That is
            why bandwidth efficiency and noise performance usually trade against
            each other.
          </p>
        </div>
      </div>
    </section>
  );
}

function FamilyIntro({
  id,
  title,
  intro,
}: {
  id: string;
  title: string;
  intro: string;
}) {
  return (
    <div id={id} className="mb-10 scroll-mt-24">
      <SectionTitle>{title}</SectionTitle>
      <p className="mt-5 text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
        {intro}
      </p>
    </div>
  );
}

function SchemeArticle({ scheme }: { scheme: LearnSchemeSection }) {
  return (
    <article id={scheme.id} className="scroll-mt-24">
      <h3 className="text-lg font-bold text-[color:var(--ui-text)]">
        {scheme.indexLabel} {scheme.title}
      </h3>
      <p className="mt-1 text-[12px] italic text-[color:var(--ui-text-muted)]">
        {scheme.subtitle}
      </p>

      <div className="mt-6 space-y-6 text-[14px] leading-7">
        <div>
          <SectionEyebrow>Overview</SectionEyebrow>
          <p className="text-[color:var(--ui-text-muted)]">{scheme.overview}</p>
        </div>

        <div>
          <SectionEyebrow>Signal Model</SectionEyebrow>
          <EquationBox>{scheme.equation}</EquationBox>
        </div>

        <div>
          <SectionEyebrow>Interpretation</SectionEyebrow>
          <p className="text-[color:var(--ui-text-muted)]">{scheme.interpretation}</p>
        </div>

        <div>
          <SectionEyebrow>Typical Use</SectionEyebrow>
          <BulletList items={scheme.usage} />
        </div>

        <div className="grid gap-8 pt-2 md:grid-cols-2">
          <div>
            <SectionEyebrow>Advantages</SectionEyebrow>
            <BulletList items={scheme.advantages} />
          </div>
          <div>
            <SectionEyebrow>Limitations</SectionEyebrow>
            <BulletList items={scheme.limitations} />
          </div>
        </div>

        <div className="grid gap-4 pt-2 md:grid-cols-2">
          <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] px-4 py-4">
            <SectionEyebrow>Modulator</SectionEyebrow>
            <p className="text-[13px] leading-6 text-[color:var(--ui-text-muted)]">
              {scheme.modulator}
            </p>
          </div>
          <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] px-4 py-4">
            <SectionEyebrow>Demodulator</SectionEyebrow>
            <p className="text-[13px] leading-6 text-[color:var(--ui-text-muted)]">
              {scheme.demodulator}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function DesignCuesPanel() {
  return (
    <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] p-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[color:var(--ui-text)]">
        Selection considerations
      </h3>
      <div className="mt-5 space-y-4">
        {designNotes.map((note) => (
          <div
            key={note.title}
            className="border-l-2 border-[color:var(--ui-primary)] pl-4"
          >
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[color:var(--ui-primary)]">
              {note.title}
            </p>
              <p className="mt-2 text-[13px] leading-6 text-[color:var(--ui-text-muted)]">
                {note.body}
              </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="bg-[color:var(--ui-surface)] px-8 py-10 scroll-mt-24"
    >
      <SectionTitle>4. Comparison</SectionTitle>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full whitespace-nowrap border-t border-[color:var(--ui-outline-variant)]/35 text-[12px]">
          <thead className="text-left text-[color:var(--ui-text-muted)]/80">
            <tr>
              <th className="py-3 pr-4 font-medium">Scheme</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Carrier</th>
              <th className="px-4 py-3 font-medium">Bandwidth</th>
              <th className="px-4 py-3 font-medium">Complexity</th>
              <th className="px-4 py-3 font-medium">Efficiency</th>
              <th className="px-4 py-3 font-medium">Robustness</th>
              <th className="pl-4 py-3 font-medium">Primary Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--ui-outline-variant)]/25">
            {schemeComparisonRows.map((row) => (
              <tr key={row.scheme}>
              <td className="py-3 pr-4 font-bold text-[color:var(--ui-text)]">
                {row.scheme}
              </td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.quantity}</td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.carrier}</td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.bandwidth}</td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.complexity}</td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.efficiency}</td>
                <td className="px-4 py-3 text-[color:var(--ui-text-muted)]">{row.robustness}</td>
                <td className="pl-4 py-3 text-[color:var(--ui-text-muted)]">{row.primaryUse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <DesignCuesPanel />
      </div>
    </section>
  );
}

export default function LearnReference() {
  return (
    <main className="flex-1 overflow-y-auto bg-[color:var(--ui-surface)]">
      <div className="mx-auto min-h-screen max-w-[860px] bg-white px-12 py-16 shadow-[0_0_0_1px_rgba(195,198,214,0.55)]">
        <LearnDocHeader />

        <div className="mb-10 flex flex-wrap gap-2">
          {[
            ["Foundations", "#foundations"],
            ["Amplitude Modulation", "#am"],
            ["Angle Modulation", "#angle"],
            ["Comparison", "#comparison"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-[4px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] px-3 py-2 text-[12px] font-medium text-[color:var(--ui-text-muted)] transition-colors hover:border-[color:var(--ui-primary)] hover:text-[color:var(--ui-primary)]"
            >
              {label}
            </a>
          ))}
        </div>

        <FoundationsSection />

        <section
          id="am"
          className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10"
        >
          <FamilyIntro
            id="am-top"
            title="2. Amplitude Modulation"
            intro="Amplitude modulation translates the message by changing the amplitude of a carrier. The center frequency stays fixed, while the sidebands mirror the message spectrum around the carrier. The main design tradeoff is usually between receiver simplicity, bandwidth, and power efficiency."
          />
          <div className="space-y-16">
            {amplitudeSchemes.map((scheme) => (
              <SchemeArticle key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </section>

        <section
          id="angle"
          className="border-b border-[color:var(--ui-outline-variant)] px-8 py-10"
        >
          <FamilyIntro
            id="angle-top"
            title="3. Angle Modulation"
            intro="Angle modulation keeps the carrier amplitude constant and places the information into phase or frequency variation. That usually improves noise tolerance, but it also makes transmitter and receiver design more sophisticated and can increase occupied bandwidth."
          />
          <div className="space-y-12">
            {angleSchemes.map((scheme) => (
              <SchemeArticle key={scheme.id} scheme={scheme} />
            ))}
            <div className="rounded-[6px] border border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface)] px-5 py-5">
              <SectionEyebrow>Relationship between phase and frequency</SectionEyebrow>
              <p className="text-[14px] leading-7 text-[color:var(--ui-text-muted)]">
                FM and PM are tightly linked because instantaneous frequency is
                the time derivative of phase. That means an FM modulator can be
                converted into PM by differentiating the message first, and a PM
                modulator can be converted into FM by integrating the message
                first. In practice, this relationship explains why their spectra
                often look similar even though the sensitivity parameters{" "}
                <MathInline>
                  <Var>k</Var>
                  <sub className="text-[0.7em] not-italic">f</sub>
                </MathInline>{" "}
                and{" "}
                <MathInline>
                  <Var>k</Var>
                  <sub className="text-[0.7em] not-italic">p</sub>
                </MathInline>{" "}
                act on different signal quantities.
              </p>
            </div>
          </div>
        </section>

        <ComparisonSection />

        <footer className="pb-6 pt-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.26em] text-[color:var(--ui-text-muted)]/60">
            End of Reference Document - Precision Signal Lab Learn
          </p>
        </footer>
      </div>
    </main>
  );
}
