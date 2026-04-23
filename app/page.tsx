"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as ToneType from "tone";
import { lustiana } from "./ui/font";

const NOTE_MAP: Record<string, string> = {
  E: "C4",
  "4": "D4",
  "5": "E4",
  U: "G4",
  "8": "A4",
  "9": "B4",
  P: "C5",
  Y: "F4",
  "-": "F#4",
  "=": "D5",
  "+": "E5",
  "\\": "C#5",
};

type SequenceStep = {
  keys: string[];
  beats: number;
};

const groovePart: SequenceStep[] = [
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.33 },
  { keys: ["8"], beats: 0.33 },
  { keys: ["8"], beats: 0.34 },
];

const USER_SEQUENCE: SequenceStep[] = [
  { keys: ["E"], beats: 1 },
  { keys: ["E"], beats: 1 },
  { keys: ["4", "5"], beats: 1 },
  { keys: ["U"], beats: 1 },
  ...groovePart,
  ...groovePart,
  { keys: ["8"], beats: 1 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["8"], beats: 1 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["8"], beats: 1 },
  { keys: ["9", "P"], beats: 1 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["U"], beats: 1 },
  { keys: ["8"], beats: 0.5 },
  { keys: ["9"], beats: 0.5 },
  { keys: ["9", "P"], beats: 1 },
  { keys: ["P"], beats: 0.5 },
  { keys: ["P"], beats: 0.5 },
  { keys: ["P"], beats: 0.5 },
  { keys: ["P"], beats: 0.5 },
  { keys: ["-"], beats: 1 },
  { keys: ["P"], beats: 1 },
  { keys: ["-"], beats: 1 },
  { keys: ["P"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["8"], beats: 1 },
  { keys: ["U"], beats: 0.5 },
  { keys: ["U"], beats: 0.5 },
  { keys: ["Y"], beats: 1 },
  { keys: ["5"], beats: 0.5 },
  { keys: ["5"], beats: 0.5 },
  { keys: ["8"], beats: 1 },
  { keys: ["U"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["+"], beats: 0.5 },
  { keys: ["\\"], beats: 0.5 },
  { keys: ["+"], beats: 0.5 },
  { keys: ["P"], beats: 0.5 },
  { keys: ["P"], beats: 1 },
  { keys: ["P"], beats: 1 },
  { keys: ["="], beats: 1 },
  { keys: ["P"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["P"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["8"], beats: 1 },
  { keys: ["8"], beats: 1 },
  { keys: ["8"], beats: 1 },
  { keys: ["9"], beats: 1 },
  { keys: ["8"], beats: 1 },
  { keys: ["U"], beats: 1 },
];

export default function Home() {
  const synthRef = useRef<ToneType.PolySynth<ToneType.Synth> | null>(null);
  const reverbRef = useRef<ToneType.Reverb | null>(null);
  const eqRef = useRef<ToneType.EQ3 | null>(null);
  const chorusRef = useRef<ToneType.Chorus | null>(null);
  const compressorRef = useRef<ToneType.Compressor | null>(null);
  const filterRef = useRef<ToneType.Filter | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reverbWet, setReverbWet] = useState(0.38);
  const [toneColor, setToneColor] = useState(0.62);

  const keyboardKeys = useMemo(() => Object.keys(NOTE_MAP), []);

  const clearTimers = useCallback(() => {
    timeoutIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timeoutIdsRef.current = [];
  }, []);

  const initAudio = useCallback(async () => {
    if (synthRef.current && reverbRef.current && eqRef.current && chorusRef.current && compressorRef.current && filterRef.current) {
      return;
    }

    const Tone = await import("tone");
    await Tone.start();

    const filter = new Tone.Filter({
      frequency: 1300 + toneColor * 2500,
      type: "lowpass",
      rolloff: -24,
      Q: 1.1,
    });

    const reverb = new Tone.Reverb({
      decay: 2.9,
      preDelay: 0.015,
      wet: reverbWet,
    });
    await reverb.generate();

    const eq = new Tone.EQ3({
      low: -2,
      mid: 4.5,
      high: 1.5,
      lowFrequency: 280,
      highFrequency: 2200,
    });

    const chorus = new Tone.Chorus({
      frequency: 1.25,
      delayTime: 2.8,
      depth: 0.2,
      spread: 35,
      wet: 0.1,
    }).start();

    const compressor = new Tone.Compressor({
      threshold: -16,
      ratio: 2.8,
      attack: 0.012,
      release: 0.2,
    });

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 19 },
      envelope: { attack: 0.006, decay: 0.09, sustain: 0.42, release: 0.75 },
    });

    synth.chain(eq, chorus, compressor, filter, reverb, Tone.Destination);
    synth.volume.value = -9;

    synthRef.current = synth;
    reverbRef.current = reverb;
    eqRef.current = eq;
    chorusRef.current = chorus;
    compressorRef.current = compressor;
    filterRef.current = filter;
    setIsReady(true);
  }, [reverbWet, toneColor]);

  const playKeys = useCallback(
    async (keys: string[]) => {
      await initAudio();
      const synth = synthRef.current;
      if (!synth) {
        return;
      }

      const notes = keys
        .map((key) => NOTE_MAP[key.toUpperCase()])
        .filter(Boolean) as string[];
      if (!notes.length) {
        return;
      }

      synth.triggerAttackRelease(notes, "8n");
    },
    [initAudio],
  );

  const playDemo = useCallback(async () => {
    await initAudio();
    clearTimers();
    setIsPlaying(true);

    const bpm = 112;
    const beatMs = 60000 / bpm;
    let elapsed = 0;

    USER_SEQUENCE.forEach((step, index) => {
      const timerId = window.setTimeout(() => {
        void playKeys(step.keys);
        if (index === USER_SEQUENCE.length - 1) {
          setIsPlaying(false);
        }
      }, elapsed);

      timeoutIdsRef.current.push(timerId);
      elapsed += step.beats * beatMs;
    });
  }, [clearTimers, initAudio, playKeys]);

  const stopDemo = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
  }, [clearTimers]);

  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbWet;
    }
  }, [reverbWet]);

  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.value = 1300 + toneColor * 2500;
    }
    if (chorusRef.current) {
      chorusRef.current.wet.value = 0.08 + toneColor * 0.16;
    }
    if (eqRef.current) {
      eqRef.current.mid.value = 3 + toneColor * 4.2;
      eqRef.current.high.value = -1 + toneColor * 4.5;
    }
  }, [toneColor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (!(key in NOTE_MAP)) {
        return;
      }

      event.preventDefault();
      void playKeys([key]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopDemo();
      synthRef.current?.dispose?.();
      reverbRef.current?.dispose?.();
      eqRef.current?.dispose?.();
      chorusRef.current?.dispose?.();
      compressorRef.current?.dispose?.();
      filterRef.current?.dispose?.();
    };
  }, [playKeys, stopDemo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Online Web Harmonium
          <span className={`block pt-2 text-2xl text-emerald-500 ${lustiana.className}`}>
            Reverb + your custom key pattern
          </span>
        </h1>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          Click the keys, or use your keyboard:
          {keyboardKeys.join(" ")}.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void playDemo()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            disabled={isPlaying}
          >
            {isPlaying ? "Playing..." : "Play your sequence"}
          </button>
          <button
            type="button"
            onClick={stopDemo}
            className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-600"
          >
            Stop
          </button>
          <button
            type="button"
            onClick={() => void initAudio()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {isReady ? "Audio ready" : "Unlock audio"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <label className="mb-2 block text-sm font-medium">Reverb amount: {(reverbWet * 100).toFixed(0)}%</label>
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.01}
            value={reverbWet}
            onChange={(event) => setReverbWet(Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
          <label className="mb-2 mt-4 block text-sm font-medium">Harmonium tone color: {(toneColor * 100).toFixed(0)}%</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={toneColor}
            onChange={(event) => setToneColor(Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          {keyboardKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => void playKeys([key])}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-3 text-center text-sm font-bold transition hover:-translate-y-0.5 hover:bg-zinc-100 active:translate-y-0 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              title={`Plays note ${NOTE_MAP[key]}`}
            >
              <span className="block text-lg">{key}</span>
              <span className="block text-xs font-normal text-zinc-500">{NOTE_MAP[key]}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
