import type { ReactNode } from "react";

function mathClassName(display: boolean) {
  return [
    "font-['Cambria_Math','Times_New_Roman',serif] text-[color:var(--ui-primary)]",
    display ? "text-[18px] leading-8" : "text-[0.98em] leading-none",
  ].join(" ");
}

export function MathInline({ children }: { children: ReactNode }) {
  return <span className={mathClassName(false)}>{children}</span>;
}

export function MathBlock({ children }: { children: ReactNode }) {
  return <div className={mathClassName(true)}>{children}</div>;
}

export function Var({
  children,
  sub,
  sup,
}: {
  children: ReactNode;
  sub?: ReactNode;
  sup?: ReactNode;
}) {
  return (
    <span className="italic">
      {children}
      {sub !== undefined ? <sub className="text-[0.7em] not-italic">{sub}</sub> : null}
      {sup !== undefined ? <sup className="text-[0.7em] not-italic">{sup}</sup> : null}
    </span>
  );
}

export function Operator({ children }: { children: ReactNode }) {
  return <span className="not-italic">{children}</span>;
}

export function Bracket({ children }: { children: ReactNode }) {
  const text = typeof children === "string" ? children : "";
  const isOpen = text === "(" || text === "[" || text === "{";
  const isClose = text === ")" || text === "]" || text === "}";

  if (isOpen) {
    return (
      <span className="not-italic">
        {"\u2009"}
        {text}
        {"\u200A"}
      </span>
    );
  }

  if (isClose) {
    return (
      <span className="not-italic">
        {"\u2004"}
        {text}
      </span>
    );
  }

  return <span className="not-italic">{children}</span>;
}
