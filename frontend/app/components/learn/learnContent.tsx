import type { ReactNode } from "react";

import { Bracket, MathBlock, MathInline, Operator, Var } from "./LearnMath";

export type LearnSchemeSection = {
  id: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  overview: ReactNode;
  equation: ReactNode;
  interpretation: ReactNode;
  usage: ReactNode[];
  advantages: ReactNode[];
  limitations: ReactNode[];
  modulator: ReactNode;
  demodulator: ReactNode;
};

export const terminologyRows = [
  {
    symbol: (
      <MathInline>
        <Var>m</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>)</Bracket>
      </MathInline>
    ),
    meaning: "Message or baseband signal",
    notes: "The information-bearing waveform before modulation.",
  },
  {
    symbol: (
      <MathInline>
        <Var>c</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>)</Bracket>
      </MathInline>
    ),
    meaning: "Carrier signal",
    notes: "Typically a sinusoid at a much higher frequency than the message.",
  },
  {
    symbol: (
      <MathInline>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
      </MathInline>
    ),
    meaning: "Carrier amplitude",
    notes: "Controls carrier peak magnitude in the transmitted waveform.",
  },
  {
    symbol: (
      <MathInline>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
      </MathInline>
    ),
    meaning: "Carrier frequency",
    notes: "Sets the spectral location of the modulated signal.",
  },
  {
    symbol: (
      <MathInline>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">m</sub>
      </MathInline>
    ),
    meaning: "Message frequency",
    notes: "Used for tone examples or individual baseband components.",
  },
  {
    symbol: (
      <MathInline>
        <Var>B</Var>
      </MathInline>
    ),
    meaning: "Message bandwidth",
    notes: "Highest significant baseband frequency content.",
  },
  {
    symbol: (
      <MathInline>
        <Var>a</Var>
        <Operator>, </Operator>
        <Var>k</Var>
        <sub className="text-[0.7em] not-italic">f</sub>
        <Operator>, </Operator>
        <Var>k</Var>
        <sub className="text-[0.7em] not-italic">p</sub>
      </MathInline>
    ),
    meaning: "Modulation sensitivity parameters",
    notes: "Set AM depth, FM deviation sensitivity, or PM phase sensitivity.",
  },
] as const;

export const schemeComparisonRows = [
  {
    scheme: "DSB-LC",
    quantity: "Envelope amplitude",
    carrier: "Large carrier transmitted",
    bandwidth: "2B",
    complexity: "Low",
    efficiency: "Low",
    robustness: "Moderate",
    primaryUse: "Broadcast AM and simple receivers",
  },
  {
    scheme: "DSB-SC",
    quantity: "Translated sidebands; coherent recovery required",
    carrier: "Suppressed",
    bandwidth: "2B",
    complexity: "Medium",
    efficiency: "Medium",
    robustness: "Moderate",
    primaryUse: "Coherent AM systems and product modulators",
  },
  {
    scheme: "SSB",
    quantity: "Single translated sideband",
    carrier: "Suppressed or reinserted at receive side",
    bandwidth: "B",
    complexity: "High",
    efficiency: "High",
    robustness: "Moderate",
    primaryUse: "HF voice and narrowband analog links",
  },
  {
    scheme: "FM",
    quantity: "Instantaneous frequency",
    carrier: "Constant-envelope carrier",
    bandwidth: "Often > 2B",
    complexity: "Medium-High",
    efficiency: "High RF efficiency",
    robustness: "High",
    primaryUse: "Broadcast radio, telemetry, noisy channels",
  },
  {
    scheme: "PM",
    quantity: "Instantaneous phase",
    carrier: "Constant-envelope carrier",
    bandwidth: "Message-dependent",
    complexity: "Medium-High",
    efficiency: "High RF efficiency",
    robustness: "High",
    primaryUse: "Phase-sensitive analog links and conceptual bridge to PSK",
  },
] as const;

export const amplitudeSchemes: LearnSchemeSection[] = [
  {
    id: "dsb-lc",
    indexLabel: "2.1",
    title: "DSB-LC",
    subtitle: "Double-Sideband Large Carrier",
    overview: (
      <>
        DSB-LC is the classical AM form used when receiver simplicity matters.
        The carrier is transmitted along with both sidebands, so the envelope of
        the RF waveform visibly follows the message under normal modulation
        depth.
      </>
    ),
    equation: (
      <MathBlock>
        <Var>u</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) = </Bracket>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Bracket>[</Bracket>
        <Operator>1 + </Operator>
        <Var>a</Var>
        <Operator> </Operator>
        <Var>m</Var>
        <sub className="text-[0.7em] not-italic">n</sub>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>)] </Bracket>
        <Operator>cos</Operator>
        <Bracket>(</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Bracket>)</Bracket>
      </MathBlock>
    ),
    interpretation: (
      <>
        The message changes the amplitude of the carrier without changing its
        center frequency. The normalized message{" "}
        <MathInline>
          <Var>m</Var>
          <sub className="text-[0.7em] not-italic">n</sub>
          <Bracket>(</Bracket>
          <Var>t</Var>
          <Bracket>)</Bracket>
        </MathInline>{" "}
        keeps the modulation depth interpretable through{" "}
        <MathInline>
          <Var>a</Var>
        </MathInline>
        .
      </>
    ),
    usage: [
      <>Broadcast AM radio and educational demonstrations.</>,
      <>Systems where envelope detection should work without carrier recovery.</>,
    ],
    advantages: [
      <>Simple transmitter structure and very simple demodulation.</>,
      <>Easy to visualize in time and frequency domains.</>,
      <>Carrier helps tuning and synchronization.</>,
    ],
    limitations: [
      <>Poor power efficiency because the carrier consumes most transmitted power.</>,
      <>
        Bandwidth is still{" "}
        <MathInline>
          <Operator>2</Operator>
          <Var>B</Var>
        </MathInline>
        .
      </>,
      <>Overmodulation causes envelope distortion.</>,
    ],
    modulator: (
      <>
        Normalize or scale the message, add a DC offset, and multiply the
        result by the carrier. In block terms, the message controls a variable
        gain on the carrier path.
      </>
    ),
    demodulator: (
      <>
        An envelope detector can recover the message when the envelope never
        crosses through itself. A coherent detector also works and is more
        accurate when distortion or noise become important.
      </>
    ),
  },
  {
    id: "dsb-sc",
    indexLabel: "2.2",
    title: "DSB-SC",
    subtitle: "Double-Sideband Suppressed Carrier",
    overview: (
      <>
        DSB-SC removes the wasteful large carrier and transmits only the
        translated message spectrum. It is a natural stepping stone between
        basic AM and more advanced coherent systems.
      </>
    ),
    equation: (
      <MathBlock>
        <Var>u</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) = </Bracket>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Operator> </Operator>
        <Var>m</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) </Bracket>
        <Operator>cos</Operator>
        <Bracket>(</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Bracket>)</Bracket>
      </MathBlock>
    ),
    interpretation: (
      <>
        Direct multiplication shifts the message spectrum to positive and
        negative carrier offsets. Because the carrier term is not transmitted
        explicitly, coherent detection is required.
      </>
    ),
    usage: [
      <>Product-modulator transmitters and coherent AM experiments.</>,
      <>Situations where carrier power should not be wasted.</>,
    ],
    advantages: [
      <>Better power efficiency than DSB-LC.</>,
      <>Straightforward spectral interpretation with upper and lower sidebands.</>,
      <>Good teaching model for synchronous detection.</>,
    ],
    limitations: [
      <>
        Still needs{" "}
        <MathInline>
          <Operator>2</Operator>
          <Var>B</Var>
        </MathInline>{" "}
        of bandwidth.
      </>,
      <>Cannot use a simple envelope detector.</>,
      <>Receiver oscillator phase and frequency errors matter.</>,
    ],
    modulator: (
      <>
        Feed the message and the carrier into a multiplier. The output contains
        only the translated sidebands centered around plus and minus the carrier
        frequency.
      </>
    ),
    demodulator: (
      <>
        Multiply the received signal by a synchronized local carrier, then apply
        a low-pass filter. The low-pass stage keeps the recovered baseband term
        and rejects the doubled-carrier component.
      </>
    ),
  },
  {
    id: "ssb",
    indexLabel: "2.3",
    title: "SSB",
    subtitle: "Single-Sideband Modulation",
    overview: (
      <>
        SSB transmits only one sideband, making it much more bandwidth- and
        power-efficient than ordinary AM. It is especially useful for speech
        and long-distance narrowband links.
      </>
    ),
    equation: (
      <MathBlock>
        <Var>u</Var>
        <sub className="text-[0.7em] not-italic">{"±"}</sub>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) = </Bracket>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Bracket>[</Bracket>
        <Var>m</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) </Bracket>
        <Operator>cos</Operator>
        <Bracket>(</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Bracket>) </Bracket>
        <Operator>{"∓ "}</Operator>
        <span className="italic">m{"\u0302"}</span>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) </Bracket>
        <Operator>sin</Operator>
        <Bracket>(</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Bracket>)]</Bracket>
      </MathBlock>
    ),
    interpretation: (
      <>
        The Hilbert-transform path creates a quadrature version of the message.
        When combined with cosine and sine carrier paths, one sideband cancels
        while the other remains.
      </>
    ),
    usage: [
      <>HF voice communication and spectrum-constrained analog links.</>,
      <>Applications where bandwidth efficiency is more important than simplicity.</>,
    ],
    advantages: [
      <>
        Requires only{" "}
        <MathInline>
          <Var>B</Var>
        </MathInline>{" "}
        of bandwidth.
      </>,
      <>Transmits power into useful information-bearing spectrum instead of a large carrier.</>,
      <>Excellent fit for speech-heavy narrowband systems.</>,
    ],
    limitations: [
      <>More complicated modulation and demodulation chains.</>,
      <>Accurate tuning is necessary to avoid pitch shift and distortion.</>,
      <>Hilbert or filter-based sideband selection adds implementation cost.</>,
    ],
    modulator: (
      <>
        Create in-phase and quadrature message paths, then combine them so
        either the upper or lower sideband cancels. In DSP, a Hilbert transform
        is the clean way to form the quadrature message path.
      </>
    ),
    demodulator: (
      <>
        Use coherent detection with a beat-frequency oscillator or product
        detector, then low-pass filter the baseband. Practical performance
        depends strongly on how accurately the receiver reinserts the carrier.
      </>
    ),
  },
] as const;

export const angleSchemes: LearnSchemeSection[] = [
  {
    id: "fm",
    indexLabel: "3.1",
    title: "FM",
    subtitle: "Frequency Modulation",
    overview: (
      <>
        FM encodes the message into instantaneous frequency deviation. The
        envelope ideally stays constant, which makes FM much less sensitive to
        amplitude noise than AM.
      </>
    ),
    equation: (
      <MathBlock>
        <Var>u</Var>
        <sub className="text-[0.7em] not-italic">FM</sub>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) = </Bracket>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Operator> cos</Operator>
        <Bracket>[</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Operator>{" + 2π"}</Operator>
        <Var>k</Var>
        <sub className="text-[0.7em] not-italic">f</sub>
        <Operator>{" ∫"}</Operator>
        <sub className="text-[0.7em] not-italic">0</sub>
        <sup className="text-[0.7em] not-italic">t</sup>
        <Var>m</Var>
        <Bracket>(</Bracket>
        <Var>{"τ"}</Var>
        <Bracket>)</Bracket>
        <Operator>d</Operator>
        <Var>{"τ"}</Var>
        <Operator> + </Operator>
        <Var>{"φ"}</Var>
        <sub className="text-[0.7em] not-italic">0</sub>
        <Bracket>]</Bracket>
      </MathBlock>
    ),
    interpretation: (
      <>
        The integral of the message becomes part of the carrier phase. When the
        message grows positive, instantaneous frequency moves upward; when it
        goes negative, instantaneous frequency moves downward.
      </>
    ),
    usage: [
      <>Broadcast FM, telemetry, and analog links in noisy environments.</>,
      <>Systems that benefit from limiting and constant-envelope transmission.</>,
    ],
    advantages: [
      <>Strong immunity to amplitude noise.</>,
      <>Allows efficient nonlinear RF power amplification.</>,
      <>Very clear demonstration of deviation and bandwidth tradeoffs.</>,
    ],
    limitations: [
      <>Often needs substantially more bandwidth than AM.</>,
      <>Receiver design is more complex than simple envelope detection.</>,
      <>Deviation settings must be managed carefully relative to message bandwidth.</>,
    ],
    modulator: (
      <>
        Integrate the message, scale it by{" "}
        <MathInline>
          <Var>k</Var>
          <sub className="text-[0.7em] not-italic">f</sub>
        </MathInline>
        , and add the result to the carrier phase term. The carrier amplitude
        remains constant while frequency varies in time.
      </>
    ),
    demodulator: (
      <>
        Use a frequency discriminator, a phase-locked loop, or another
        frequency-to-voltage mechanism, then low-pass filter the baseband
        output. Limiting is often used ahead of demodulation to suppress
        amplitude noise.
      </>
    ),
  },
  {
    id: "pm",
    indexLabel: "3.2",
    title: "PM",
    subtitle: "Phase Modulation",
    overview: (
      <>
        PM encodes information directly into the carrier phase instead of the
        carrier amplitude. Like FM, it maintains a constant envelope and shares
        many practical receiver ideas with FM.
      </>
    ),
    equation: (
      <MathBlock>
        <Var>u</Var>
        <sub className="text-[0.7em] not-italic">PM</sub>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) = </Bracket>
        <Var>A</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Operator> cos</Operator>
        <Bracket>[</Bracket>
        <Operator>{"2π"}</Operator>
        <Var>f</Var>
        <sub className="text-[0.7em] not-italic">c</sub>
        <Var>t</Var>
        <Operator> + </Operator>
        <Var>k</Var>
        <sub className="text-[0.7em] not-italic">p</sub>
        <Var>m</Var>
        <Bracket>(</Bracket>
        <Var>t</Var>
        <Bracket>) + </Bracket>
        <Var>{"φ"}</Var>
        <sub className="text-[0.7em] not-italic">0</sub>
        <Bracket>]</Bracket>
      </MathBlock>
    ),
    interpretation: (
      <>
        The message adds directly to the carrier phase. Rapid message changes
        therefore affect the instantaneous frequency, which is why FM and PM
        are closely related angle-modulation schemes.
      </>
    ),
    usage: [
      <>Phase-sensitive analog systems and conceptual bridge toward digital PSK.</>,
      <>Analytical comparison against FM in angle-modulation studies.</>,
    ],
    advantages: [
      <>Constant-envelope behavior with good amplitude-noise tolerance.</>,
      <>Direct control over phase deviation.</>,
      <>Clear conceptual path to digital phase modulation.</>,
    ],
    limitations: [
      <>Receiver implementation is still more complex than AM.</>,
      <>High-frequency message content can create large phase excursions.</>,
      <>Bandwidth depends strongly on message content and sensitivity.</>,
    ],
    modulator: (
      <>
        Scale the message by{" "}
        <MathInline>
          <Var>k</Var>
          <sub className="text-[0.7em] not-italic">p</sub>
        </MathInline>{" "}
        and add it directly to the carrier phase. No explicit message integral
        appears in the standard PM model.
      </>
    ),
    demodulator: (
      <>
        A phase detector or PLL estimates the instantaneous phase change, and a
        low-pass filter recovers the message. In many practical systems PM and
        FM receivers share a large amount of structure.
      </>
    ),
  },
] as const;

export const designNotes = [
  {
    title: "If simple demodulation matters",
    body:
      "DSB-LC is the cleanest starting point because envelope detection is intuitive, visible in the time-domain plot, and easy to implement in hardware.",
  },
  {
    title: "If spectrum matters",
    body:
      "SSB is the most bandwidth-efficient analog voice option in the current set. It is the right choice when narrow channels or crowded spectrum dominate the design problem.",
  },
  {
    title: "If noise rejection matters",
    body:
      "FM and PM keep a constant envelope, so amplitude noise can be limited before demodulation. That is one reason angle modulation performs well in noisy analog radio links.",
  },
] as const;
