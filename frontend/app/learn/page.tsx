import LearnReference from "../components/learn/LearnReference";
import LearnSidebar from "../components/learn/LearnSidebar";
import TopBar from "../components/workspace/TopBar";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[color:var(--ui-background)] p-0 text-[color:var(--ui-text)]">
      <div className="flex h-screen flex-col overflow-hidden rounded-[18px] border border-[#b9bec8] bg-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]">
        <TopBar
          activePage="learn"
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <LearnSidebar />
          <LearnReference />
        </div>
      </div>
    </div>
  );
}
