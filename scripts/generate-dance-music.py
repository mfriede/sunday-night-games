"""Render an original 120 BPM house loop using only Python's standard library.

Usage: python3 scripts/generate-dance-music.py /tmp/donut-party.wav
Encode the result to AAC as documented in docs/rive-animations.md.
"""

from array import array
import math
from pathlib import Path
import random
import struct
import sys
import wave

RATE = 44100
BPM = 120
BEAT = 60 / BPM
DURATION = 32 * BEAT
FRAME_COUNT = round(RATE * DURATION)
left = array("d", [0]) * FRAME_COUNT
right = array("d", [0]) * FRAME_COUNT
rng = random.Random(42)
TAU = 2 * math.pi


def mix(index, signal, pan=0, delay_send=0):
    """Wrap tails into the start of the loop, including the stereo echo."""
    index %= FRAME_COUNT
    left[index] += signal * (1 - pan) * 0.5
    right[index] += signal * (1 + pan) * 0.5
    if delay_send:
        echo = (index + round(BEAT * 0.75 * RATE)) % FRAME_COUNT
        left[echo] += signal * delay_send * (1 + pan) * 0.5
        right[echo] += signal * delay_send * (1 - pan) * 0.5


def tone(midi, start, duration, volume, voice="chord", pan=0):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    first = round(start * RATE)
    for i in range(round(duration * RATE)):
        t = i / RATE
        phase = TAU * frequency * t
        release = min((duration - t) / 0.045, 1)
        attack = min(t / (0.018 if voice == "chord" else 0.006), 1)
        # Duck the instruments on each kick, then swell between the beats.
        beat_phase = ((start + t) % BEAT) / BEAT
        pump = 0.18 + 0.82 * min(beat_phase / 0.45, 1)
        if voice == "bass":
            signal = math.sin(phase) + 0.3 * math.sin(phase * 2) + 0.12 * math.sin(phase * 3)
            envelope = attack * release * math.exp(-t * 2.8)
        elif voice == "hook":
            signal = math.sin(phase) + 0.35 * math.sin(phase * 2)
            envelope = attack * release * math.exp(-t * 9)
        else:
            # A warm, detuned synth stab, with high harmonics dying away quickly.
            brightness = math.exp(-t * 7)
            signal = sum(
                (math.sin(phase * n * 0.998) + math.sin(phase * n * 1.002))
                * brightness ** (n - 1) / n**1.7
                for n in range(1, 5)
            ) * 0.5
            envelope = attack * release * math.exp(-t * 4)
        mix(first + i, signal * envelope * volume * pump, pan,
            0.25 if voice == "hook" else 0)


def drum(start, kind, volume=1, pan=0):
    duration = {"kick": 0.32, "clap": 0.18, "hat": 0.06, "open_hat": 0.22}[kind]
    first = round(start * RATE)
    previous_noise = 0.0
    phase = 0.0
    for i in range(round(duration * RATE)):
        t = i / RATE
        attack = min(t / 0.0015, 1)
        noise = rng.uniform(-1, 1)
        if kind == "kick":
            phase += TAU * (48 + 125 * math.exp(-t * 45)) / RATE
            signal = math.sin(phase) * math.exp(-t * 15) * 0.9
            signal += noise * math.exp(-t * 180) * 0.12
        else:
            # High-pass noise gives crisp percussion rather than a hiss bed.
            filtered = noise - previous_noise
            previous_noise = noise * 0.75 + previous_noise * 0.25
            if kind == "clap":
                burst = sum(math.exp(-(t - hit) * 100) if t >= hit else 0
                            for hit in (0, 0.012, 0.026))
                signal = filtered * (burst * 0.13 + math.exp(-t * 24) * 0.09)
            else:
                decay = 25 if kind == "open_hat" else 85
                signal = filtered * math.exp(-t * decay) * 0.1
        mix(first + i, signal * attack * volume, pan)


# Am7, Fmaj7, Cmaj7, G6. Low chord stabs and a repeated hook leave space for drums.
chords = [
    (33, (57, 60, 64, 67)),
    (29, (53, 57, 60, 64)),
    (36, (55, 59, 60, 64)),
    (31, (55, 59, 62, 64)),
]
for bar in range(8):
    root, notes = chords[bar // 2]
    origin = bar * 4 * BEAT
    for beat in range(4):
        drum(origin + beat * BEAT, "kick")
        if beat % 2 == 1:
            drum(origin + beat * BEAT, "clap", 0.85)
        drum(origin + (beat + 0.5) * BEAT, "open_hat", 0.48, 0.15)
        for offset in (0.25, 0.75):
            drum(origin + (beat + offset) * BEAT, "hat", 0.3, -0.25)
    # A syncopated sub groove, rather than alternating root/fifth oom-pah bass.
    for offset, pitch, length in ((0.5, root, 0.42), (1.25, root, 0.25),
                                  (1.75, root + 12, 0.2), (2.5, root, 0.42),
                                  (3.25, root + 7, 0.2), (3.75, root, 0.2)):
        tone(pitch, origin + offset * BEAT, length * BEAT, 0.46, "bass")
    for offset in (0.75, 1.5, 2.75, 3.5):
        for n, pitch in enumerate(notes):
            tone(pitch, origin + offset * BEAT, 0.55 * BEAT,
                 0.13, pan=-0.35 if n % 2 else 0.35)
    # A sparse two-note hook. No running scales or bright fairground arpeggios.
    for offset, pitch in ((0.75, 76), (1.5, 74), (2.75, 76), (3.5, 79 if bar % 2 else 74)):
        tone(pitch, origin + offset * BEAT, 0.28 * BEAT, 0.12, "hook", -0.15)
    if bar in (3, 7):
        for offset in (3.5, 3.75):
            drum(origin + offset * BEAT, "clap", 0.3)

# Soft saturation catches overlapping transients without hard clipping.
for i in range(FRAME_COUNT):
    left[i] = math.tanh(left[i] * 1.35)
    right[i] = math.tanh(right[i] * 1.35)
peak = max(max(abs(v) for v in left), max(abs(v) for v in right))
scale = 0.86 * 32767 / peak
output = Path(sys.argv[1])
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), "wb") as track:
    track.setparams((2, 2, RATE, FRAME_COUNT, "NONE", "not compressed"))
    track.writeframes(b"".join(struct.pack("<hh", round(l * scale), round(r * scale))
                              for l, r in zip(left, right)))
print(f"Wrote {DURATION:.1f}s stereo house loop at {BPM} BPM to {output}")
