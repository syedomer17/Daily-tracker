"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Clock,
  ExternalLink,
  Sun,
  Moon,
  Compass,
  Play,
  Pause,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  QURAN_PRAYER_SLOTS,
  getAutoPrayerSlot,
  PrayerSlotConfig,
  SurahTarget,
} from "@/lib/quranData";

interface ApiVerse {
  numberInSurah: number;
  text: string;
}

interface LoadedSurah {
  arabic: ApiVerse[];
  english: ApiVerse[];
}

export default function QuranPage() {
  const [activeSlotKey, setActiveSlotKey] = useState<string>("auto");
  const [currentTimeSlot, setCurrentTimeSlot] = useState(getAutoPrayerSlot());
  const [selectedSurahId, setSelectedSurahId] = useState<string | null>(null);
  const [repetitions, setRepetitions] = useState<Record<string, number>>({});
  const [surahContent, setSurahContent] = useState<LoadedSurah | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState<"md" | "lg" | "xl">("lg");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update auto prayer slot every minute
  useEffect(() => {
    const updateSlot = () => {
      const slot = getAutoPrayerSlot();
      setCurrentTimeSlot(slot);
    };
    updateSlot();
    const interval = setInterval(updateSlot, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine current active configuration
  const activeConfig: PrayerSlotConfig = useMemo(() => {
    if (activeSlotKey === "auto") {
      return currentTimeSlot.activeConfig;
    }
    return QURAN_PRAYER_SLOTS[activeSlotKey] || currentTimeSlot.activeConfig;
  }, [activeSlotKey, currentTimeSlot]);

  // Derive active surah from current config and selected id
  const activeSurah: SurahTarget | null = useMemo(() => {
    if (selectedSurahId) {
      const found = activeConfig.targets.find((t) => t.id === selectedSurahId);
      if (found) return found;
    }
    return activeConfig.targets[0] || null;
  }, [activeConfig, selectedSurahId]);

  // Fetch surah verses from Quran API
  useEffect(() => {
    if (!activeSurah) return;
    const currentTarget = activeSurah;
    let isCancelled = false;

    async function loadVerses() {
      setLoadingSurah(true);
      setSurahContent(null);

      try {
        const surahNum = currentTarget.surahNumber;
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih`
        );
        const json = await res.json();
        if (isCancelled) return;

        if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
          let arVerses: ApiVerse[] = json.data[0].ayahs;
          let enVerses: ApiVerse[] = json.data[1].ayahs;

          // If a specific verseRange is specified (e.g. "255" or "285-286")
          if (currentTarget.verseRange) {
            if (currentTarget.verseRange === "255") {
              arVerses = arVerses.filter((v) => v.numberInSurah === 255);
              enVerses = enVerses.filter((v) => v.numberInSurah === 255);
            } else if (currentTarget.verseRange === "285-286") {
              arVerses = arVerses.filter((v) => v.numberInSurah === 285 || v.numberInSurah === 286);
              enVerses = enVerses.filter((v) => v.numberInSurah === 285 || v.numberInSurah === 286);
            }
          }

          setSurahContent({ arabic: arVerses, english: enVerses });
        }
      } catch {
        // Handled gracefully for offline mode
      } finally {
        if (!isCancelled) setLoadingSurah(false);
      }
    }

    loadVerses();

    return () => {
      isCancelled = true;
    };
  }, [activeSurah]);

  // Handle repetition counter
  const handleIncrementRepetition = (target: SurahTarget) => {
    const current = repetitions[target.id] || 0;
    const nextVal = current + 1;
    setRepetitions((prev) => ({ ...prev, [target.id]: nextVal }));

    if (nextVal === target.repetitions) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#34d399", "#38bdf8"],
      });
    }
  };

  const handleResetRepetition = (id: string) => {
    setRepetitions((prev) => ({ ...prev, [id]: 0 }));
  };

  // Audio playback toggle
  const toggleAudio = () => {
    if (!audioRef.current || !activeSurah) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  // Slot tabs
  const SLOTS_LIST = [
    { key: "auto", label: "Auto (Live Time)", icon: Clock },
    { key: "fajr", label: "Fajr", icon: Sun },
    { key: "dhuhr", label: "Dhuhr", icon: Sun },
    { key: "asr", label: "Asr", icon: Compass },
    { key: "maghrib", label: "Maghrib", icon: Moon },
    { key: "isha", label: "Isha", icon: Moon },
    { key: "friday", label: "Friday (Kahf)", icon: Sparkles },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Friday Banner if today is Friday */}
      {currentTimeSlot.isFriday && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">Blessed Friday (Jumu‘ah)</h2>
                <span className="rounded-full bg-emerald-950/30 px-2 py-0.5 text-xs font-medium border border-white/20">
                  Sunnah of the Day
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90">
                Recite Surah Al-Kahf for divine illumination from this Friday to the next.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSlotKey("friday")}
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition shadow-sm shrink-0"
          >
            Read Surah Al-Kahf
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <BookOpen className="h-3.5 w-3.5" />
              Automated Prayer Recitation
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Asia/Kolkata
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Quran & Sunnah Adhkar
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            Prescribed Surahs & Adhkar automatically changing according to prayer times.
          </p>
        </div>

        {/* Live Slot Indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-2.5 shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Current Window: </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {currentTimeSlot.activeConfig.name} ({currentTimeSlot.activeConfig.timeRange})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Slots Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {SLOTS_LIST.map((slot) => {
          const Icon = slot.icon;
          const isSelected = activeSlotKey === slot.key;
          const isCurrentSlot =
            slot.key === "auto" || slot.key === currentTimeSlot.slot;

          return (
            <button
              key={slot.key}
              onClick={() => setActiveSlotKey(slot.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{slot.label}</span>
              {isCurrentSlot && slot.key !== "auto" && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Slot Description */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {activeConfig.name}
            </h2>
            <span className="text-xs font-arabic text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              {activeConfig.arabicTime}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              • {activeConfig.timeRange}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {activeConfig.description}
          </p>
        </div>

        {activeSlotKey !== "auto" && (
          <button
            onClick={() => setActiveSlotKey("auto")}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <Clock className="h-3.5 w-3.5" />
            Switch back to Live Time
          </button>
        )}
      </div>

      {/* Main Grid: Surah Selection & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Surahs & Adhkar Presets List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Prescribed for this Routine
            </h3>
            <span className="text-xs text-zinc-400">
              {activeConfig.targets.length} {activeConfig.targets.length === 1 ? "Item" : "Items"}
            </span>
          </div>

          <div className="space-y-2.5">
            {activeConfig.targets.map((target) => {
              const isSelected = activeSurah?.id === target.id;
              const count = repetitions[target.id] || 0;
              const isDone = count >= target.repetitions;

              return (
                <div
                  key={target.id}
                  onClick={() => setSelectedSurahId(target.id)}
                  className={`rounded-2xl border p-4 transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                          {target.name}
                        </span>
                        <span className="text-xs text-zinc-400 font-arabic">
                          ({target.arabicName})
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {target.virtue}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                      Surah {target.surahNumber}
                    </span>
                  </div>

                  {/* Repetition / Tasbih Tracker */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">Target:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {target.repetitions}x
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className={`font-semibold ${isDone ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {count} completed
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrementRepetition(target);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500 hover:text-white"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done
                          </>
                        ) : (
                          <>+1 Tap</>
                        )}
                      </button>

                      {count > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetRepetition(target.id);
                          }}
                          title="Reset count"
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Reader & Recitation (8 cols) */}
        <div className="lg:col-span-8">
          {activeSurah ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm overflow-hidden flex flex-col h-[750px]">
              {/* Reader Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold text-sm">
                    {activeSurah.surahNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                        {activeSurah.name}
                      </h2>
                      <span className="text-sm font-arabic text-emerald-600 dark:text-emerald-400 font-bold">
                        {activeSurah.arabicName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {activeSurah.revelationPlace} • {activeSurah.totalVerses} Ayahs
                      {activeSurah.verseRange && ` (Verses ${activeSurah.verseRange})`}
                    </p>
                  </div>
                </div>

                {/* Controls: Audio Player & Font Resizer */}
                <div className="flex items-center gap-2">
                  {/* Audio Element */}
                  <audio
                    ref={audioRef}
                    src={activeSurah.audioSurahUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                  />

                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      isPlayingAudio
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500"
                    }`}
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Recitation</span>
                      </>
                    )}
                  </button>

                  {/* Font Size Selector */}
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 text-xs font-semibold">
                    <button
                      onClick={() => setArabicFontSize("md")}
                      className={`px-2.5 py-1.5 transition ${arabicFontSize === "md" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setArabicFontSize("lg")}
                      className={`px-2.5 py-1.5 transition ${arabicFontSize === "lg" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setArabicFontSize("xl")}
                      className={`px-2.5 py-1.5 transition ${arabicFontSize === "xl" ? "bg-emerald-500 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                    >
                      A++
                    </button>
                  </div>

                  {/* External Link */}
                  <a
                    href={`https://quran.com/${activeSurah.surahNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    title="Open on Quran.com"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Bismillah Header (except for Surah 9) */}
              {activeSurah.surahNumber !== 9 && (
                <div className="py-4 text-center border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-950/20">
                  <p className="text-xl sm:text-2xl font-serif text-emerald-700 dark:text-emerald-400 tracking-wider">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    In the name of Allah, the Entirely Merciful, the Especially Merciful.
                  </p>
                </div>
              )}

              {/* Verses Scroll View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {loadingSurah ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <p className="text-xs font-mono">Loading Ayahs & Translations...</p>
                  </div>
                ) : surahContent && surahContent.arabic.length > 0 ? (
                  surahContent.arabic.map((verse, index) => {
                    const englishText = surahContent.english[index]?.text || "";

                    const fontSizeClass =
                      arabicFontSize === "md"
                        ? "text-xl leading-loose"
                        : arabicFontSize === "lg"
                        ? "text-2xl sm:text-3xl leading-[2.2]"
                        : "text-3xl sm:text-4xl leading-[2.4]";

                    return (
                      <div
                        key={verse.numberInSurah}
                        className="rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-4 sm:p-5 bg-zinc-50/30 dark:bg-zinc-900/30 hover:border-emerald-500/30 transition space-y-3"
                      >
                        {/* Arabic text line */}
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                            {verse.numberInSurah}
                          </span>
                          <p
                            dir="rtl"
                            className={`w-full text-right font-serif text-zinc-900 dark:text-zinc-100 ${fontSizeClass}`}
                          >
                            {verse.text}
                          </p>
                        </div>

                        {/* Translation */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {englishText}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-6">
                    <BookOpen className="h-10 w-10 text-zinc-400" />
                    <div className="max-w-md">
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                        {activeSurah.name} ({activeSurah.arabicName})
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {activeSurah.virtue}
                      </p>
                    </div>
                    <a
                      href={`https://quran.com/${activeSurah.surahNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition flex items-center gap-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Read Full Surah on Quran.com
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-zinc-500">
              Select a Surah or Adhkar from the list
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
