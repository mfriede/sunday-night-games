"use client";

import { createContext, useContext, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const MotionContext = createContext({
  enabled: false,
  paused: false,
  reduced: false,
  toggle: () => {},
});

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const enabled = reduced === false && !paused;
  return (
    <MotionContext.Provider
      value={{
        enabled,
        paused,
        reduced: reduced === true,
        toggle: () => setPaused((value) => !value),
      }}
    >
      <div className={styles.site} data-motion={enabled ? "on" : "off"}>
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export const useMotion = () => useContext(MotionContext);
