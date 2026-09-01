"use client";

import { useEffect, useRef, useState } from "react";

export type DeckCard = { title: string; desc: string };

export function DeckStage({ cards }: { cards: DeckCard[] }) {
  const [active, setActive] = useState(0);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (hoveredRef.current) return;
      setActive((a) => (a + 1) % cards.length);
    }, 3200);
    return () => clearInterval(id);
  }, [cards.length]);

  const N = cards.length;

  return (
    <div
      className="relative h-[320px] w-full"
      onMouseEnter={() => (hoveredRef.current = true)}
      onMouseLeave={() => (hoveredRef.current = false)}
    >
      {cards.map((card, i) => {
        const d = (i - active + N) % N;
        let style: React.CSSProperties;
        if (d === 0) {
          style = {
            transform: "translate3d(0,0,0) scale(1)",
            opacity: 1,
            zIndex: 30,
            boxShadow: "0 30px 60px -26px rgba(0,0,0,0.6)",
          };
        } else if (d <= 3) {
          style = {
            transform: `translate3d(${d * 26}px,${d * 20}px,0) scale(${1 - d * 0.045})`,
            opacity: 1 - d * 0.22,
            zIndex: 30 - d,
            boxShadow: "0 20px 40px -28px rgba(0,0,0,0.5)",
          };
        } else {
          style = {
            transform: "translate3d(78px,60px,0) scale(0.865)",
            opacity: 0,
            zIndex: 30 - d,
          };
        }

        return (
          <div
            key={card.title}
            className="absolute left-0 top-0 border border-[#e0e4e7] bg-white"
            style={{
              width: "82%",
              padding: "26px 28px 30px",
              transition:
                "transform 0.7s cubic-bezier(0.32,0,0.24,1), opacity 0.7s ease, box-shadow 0.4s ease",
              ...style,
            }}
          >
            <span className="text-xs font-semibold tracking-widest text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="font-display mt-2 text-[22px] font-bold text-ink-800">{card.title}</div>
            <p className="mt-2 text-[14.5px] font-medium text-[#4b5055]">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
