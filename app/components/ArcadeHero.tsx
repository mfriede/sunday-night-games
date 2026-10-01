"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { DonutArt, SparkIcon } from "./ArcadeArt";
import DonutMascotFallback from "./DonutMascotFallback";
import { useMotion } from "./MotionProvider";
import styles from "../styles/Home.module.css";

const RiveMascot = dynamic(() => import("./RiveMascot"), { ssr: false });

export default function ArcadeHero() {
  const { enabled, paused, reduced, toggle } = useMotion();
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [started, setStarted] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (sceneRef.current) observer.observe(sceneRef.current);
    const updateVisibility = () =>
      setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);
  useEffect(() => {
    if (enabled && visible) setStarted(true);
  }, [enabled, visible]);
  return (
    <div className={styles.heroArt} ref={sceneRef}>
      <div className={styles.heroCircle} aria-hidden="true" />
      <div className={styles.orbitRing} aria-hidden="true" />
      <span className={styles.heroLabel}>
        Your Sunday starts here <span aria-hidden="true">↙</span>
      </span>
      <SparkIcon className={styles.artSparkOne} />
      <SparkIcon className={styles.artSparkTwo} />
      <span className={styles.orbitDonutOne}>
        <DonutArt />
      </span>
      <span className={styles.orbitDonutTwo}>
        <DonutArt />
      </span>
      <div className={styles.mascotSlot}>
        {started && !reduced ? (
          <RiveMascot active={enabled && visible && pageVisible} />
        ) : (
          <DonutMascotFallback />
        )}
      </div>
      <span className={styles.heroStamp} aria-hidden="true">
        100%
        <br />
        <span>good times</span>
      </span>
      <div className={styles.motionControl}>
        <button
          onClick={toggle}
          disabled={reduced}
          aria-pressed={paused || reduced}
          aria-label={
            reduced
              ? "Animations disabled by reduced motion preference"
              : paused
                ? "Resume animations"
                : "Pause animations"
          }
        >
          <span aria-hidden="true">{paused || reduced ? "▷" : "Ⅱ"}</span>{" "}
          {reduced
            ? "Reduced motion"
            : paused
              ? "Motion paused"
              : "Pause motion"}
        </button>
      </div>
    </div>
  );
}
