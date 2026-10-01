"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
} from "@rive-app/react-canvas";
import DonutMascotFallback from "./DonutMascotFallback";
import styles from "../styles/Home.module.css";

// Keep the runtime and artwork local. See docs/rive-animations.md for the asset contract.
RuntimeLoader.setWasmUrl("/animations/rive.wasm");
RuntimeLoader.setWasmFallbackUrl(null);

export default function RiveMascot({ active }: { active: boolean }) {
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicHelpId = useId();
  const { rive, RiveComponent } = useRive({
    src: "/animations/donut-mascot.riv",
    artboard: "Donut",
    stateMachine: "Donut Party",
    autoplay: false,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });
  const viewModel = useViewModel(rive, { name: "DonutMascot" });
  const instance = useViewModelInstance(viewModel, { useDefault: true, rive });
  const { value: dancing, setValue: setDancing } = useViewModelInstanceBoolean(
    "isDancing",
    instance,
  );
  const playMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.3;
    void audio.play().then(
      () => setMusicBlocked(false),
      (error: unknown) => {
        // A quick stop or pause can interrupt a pending play request.
        if (!(error instanceof DOMException && error.name === "AbortError"))
          setMusicBlocked(true);
      },
    );
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (dancing && active && !failed && !muted) playMusic();
    else audio.pause();
    if (!dancing) audio.currentTime = 0;
  }, [dancing, active, failed, muted, playMusic]);
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);
  useEffect(() => {
    if (active) rive?.play("Donut Party");
    else rive?.pause();
  }, [rive, active]);
  if (failed) return <DonutMascotFallback />;
  return (
    <div className={styles.riveMascot}>
      {!rive && <DonutMascotFallback />}
      <RiveComponent className={styles.riveCanvas} aria-hidden="true" />
      <audio
        ref={audioRef}
        src="/audio/donut-party-house.m4a"
        preload="none"
        loop
        onPlaying={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
      />
      <span id={musicHelpId} hidden>
        Starts the donut dancing with arcade music. Use the music button to mute.
      </span>
      <div className={styles.partyControls}>
        <button
          className={styles.danceButton}
          disabled={!instance || !active}
          aria-pressed={Boolean(dancing)}
          aria-describedby={musicHelpId}
          onClick={() => {
            if (dancing) {
              audioRef.current?.pause();
            } else if (!muted) {
              // Call play inside the click so mobile browsers allow sound.
              playMusic();
            }
            setDancing(!dancing);
          }}
        >
          <span aria-hidden="true">✦</span>{" "}
          {dancing ? "Okay, take five" : "Start a dance party"}
        </button>
        <button
          className={styles.musicButton}
          disabled={!instance}
          aria-label={musicBlocked ? "Retry music" : muted ? "Unmute music" : "Mute music"}
          aria-pressed={muted}
          data-playing={musicPlaying}
          title={musicBlocked ? "Retry music" : muted ? "Music muted" : "Music on"}
          onClick={() => {
            if (musicBlocked) {
              if (dancing && active) playMusic();
              else setMusicBlocked(false);
            } else {
              if (!muted) audioRef.current?.pause();
              else if (dancing && active) playMusic();
              setMuted(!muted);
            }
          }}
        >
          <span aria-hidden="true">{musicBlocked ? "↻" : "♫"}</span>
        </button>
      </div>
    </div>
  );
}
