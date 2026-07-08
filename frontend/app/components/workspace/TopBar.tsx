import Image from "next/image";
import Link from "next/link";

type TopBarProps = {
  activePage?: "workspace" | "learn" | "documentation";
  referenceBadgeText?: string | null;
};

function navItemClass(isActive: boolean) {
  return isActive
    ? "border-b-[3px] border-[color:var(--ui-primary)] px-2 py-[19px] text-sm font-semibold text-[color:var(--ui-primary)]"
    : "px-2 py-[19px] text-sm text-[color:var(--ui-text)] transition-colors hover:text-[color:var(--ui-primary)]";
}

export default function TopBar({
  activePage = "workspace",
  referenceBadgeText = null,
}: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--ui-outline-variant)] bg-[color:var(--ui-surface-highest)] px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r border-[color:var(--ui-outline-variant)] pr-5">
          <Image
            src="/images/signal-lab-logo.png"
            alt="Precision Signal Lab logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-[8px] object-cover"
            priority
          />
          <p className="text-[18px] font-semibold tracking-tight text-[color:var(--ui-primary)]">
            Signal Lab
          </p>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className={navItemClass(activePage === "workspace")}>
            Workspace
          </Link>
          <Link href="/learn" className={navItemClass(activePage === "learn")}>
            Learn
          </Link>
          <Link
            href="/documentation"
            className={navItemClass(activePage === "documentation")}
          >
            Documentation
          </Link>
        </nav>
      </div>

      {referenceBadgeText ? (
        <div className="rounded-[3px] border border-[color:var(--ui-outline-variant)] bg-white px-4 py-2 text-sm text-[color:var(--ui-text-muted)]">
          {referenceBadgeText}
        </div>
      ) : null}
    </header>
  );
}
