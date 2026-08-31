import { useEffect, useRef } from "react";
import type { GameHandle } from "./game/main";

export default function App() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let handle: GameHandle | null = null;
    let cancelled = false;

    void import("./game/main").then((m) => {
      if (cancelled || !ref.current) return;
      if (ref.current.querySelector("canvas")) return; // remount guard
      handle = m.startGame(ref.current);
    });

    return () => {
      cancelled = true;
      handle?.dispose();
      if (ref.current) ref.current.innerHTML = "";
    };
  }, []);

  return <div id="game-root" ref={ref} aria-label="The Universe That Waited For Us" />;
}
