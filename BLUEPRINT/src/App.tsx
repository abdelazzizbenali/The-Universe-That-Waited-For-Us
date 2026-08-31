import Cosmos from "./components/Cosmos";
import Chrome from "./components/Chrome";
import Hero from "./sections/Hero";
import Opening from "./sections/Opening";
import Chapters from "./sections/Chapters";
import Memories from "./sections/Memories";
import Mechanics from "./sections/Mechanics";
import Systems from "./sections/Systems";
import DataLayer from "./sections/DataLayer";
import Production from "./sections/Production";
import Finale from "./sections/Finale";

export default function App() {
  return (
    <div className="noise relative min-h-screen bg-void text-ink">
      <Cosmos />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_55%,rgba(4,6,15,0.55)_100%)]" />
      <Chrome />
      <main className="relative z-[5]">
        <Hero />
        <Opening />
        <Chapters />
        <Memories />
        <Mechanics />
        <Systems />
        <DataLayer />
        <Production />
        <Finale />
        <footer className="border-t border-line/50 py-8 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-faint">
            two souls · two colors · one universe created between them
          </p>
        </footer>
      </main>
    </div>
  );
}
