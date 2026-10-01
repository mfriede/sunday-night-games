# Homepage animation

The hero features an original pink-frosted donut mascot with sneakers, a gentle bob, a blink, and an interactive dance. Its editable Rive Markup Language source lives in `animations/donut-mascot/scene.rml`. The compiled asset is `public/animations/donut-mascot.riv`; the matching static artwork is `public/animations/donut-mascot.svg`.

The asset has this contract:

| Setting | Value |
| --- | --- |
| Artboard | `Donut` |
| State machine | `Donut Party` |
| View model | `DonutMascot` |
| Boolean property | `isDancing` |
| Timelines | `Idle`, `Dance` |

The HTML dance button toggles the view model boolean through Rive's React data binding hooks. It works with keyboard and touch. Both timelines key the same transform properties, so returning from dance restores the idle pose. The asset contains no scripts and requires no Rive account or publishing step to run on the website.

The runtime loads after the scene enters the viewport and the visitor's motion preference is known. Playback pauses when the scene leaves the viewport, the tab is hidden, or the visitor selects **Pause motion**. Reduced motion displays the static mascot and skips Rive entirely. Failed asset loads also use the static mascot. The pause button stops the CSS ribbon and floating donuts as well.

## Dance party music

`public/audio/donut-party-house.m4a` is an original 16-second stereo house loop at 120 BPM. It has a four-on-the-floor kick, claps, offbeat hi-hats, a syncopated sub bass, warm chord stabs, and a sparse repeating synth hook. The synths duck on each kick for a pumping dance rhythm. The Rive dance state plays at `speed="1.2"` to match the beat. No third-party recording or music service is used.

The dance button starts sound directly from the visitor's click. The audio uses `preload="none"`, so it stays silent and does not download on initial load. A separate music button mutes or restores sound while the donut continues dancing. Stopping the party rewinds the track. Motion pause, an offscreen hero, or a hidden tab pause music with the animation; returning resumes the party if it is still selected. Navigating away or enabling reduced motion stops audio. Rejected playback requests show a retry control, and music failure does not prevent dancing.

The score and synthesizer live in `scripts/generate-dance-music.py`, which uses only Python's standard library. To rebuild the shipped AAC file on macOS:

```sh
python3 scripts/generate-dance-music.py /tmp/donut-party.wav
afconvert /tmp/donut-party.wav public/audio/donut-party-house.m4a -f m4af -d aac -b 128000 -q 127
```

On other platforms, encode that WAV to AAC with your audio encoder. The generated audio is checked in; normal app builds need no audio tools.

## Editing the mascot

Install the [official Rive CLI](https://rive.app/docs/cli/getting-started). This asset was built with CLI 1.2.0. Edit the RML, then verify, inspect, render, and rebuild:

```sh
rive animations/donut-mascot --verify
rive inspect animations/donut-mascot --summary
rive animations/donut-mascot --screenshot --advance=1
rive animations/donut-mascot --screenshot=animations/donut-mascot/build/dance.png --data=isDancing=true --advance=250ms
rive animations/donut-mascot --once
cp animations/donut-mascot/build/donut-mascot.riv public/animations/donut-mascot.riv
```

Keep the static SVG in sync when changing the artwork. Preserve the asset contract above or update `RiveMascot.tsx` alongside it.

## Local runtime and checks

`scripts/prepare-rive.mjs` copies the pinned `@rive-app/react-canvas` runtime's WASM into `public/animations/rive.wasm`. It runs after dependency installation and before development or production builds. The generated WASM is ignored by Git. Both WASM and artwork are served locally.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

This repository has no automated test suite. Check desktop and mobile layout, idle movement and blinking, dance start/stop, mute/unmute, pause/resume, offscreen and hidden-tab audio pause, reduced motion, and missing artwork fallback in the browser. Confirm that page load stays silent and stopping the party or navigating away stops music.
