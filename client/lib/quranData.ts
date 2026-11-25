export interface SurahTarget {
  id: string;
  name: string;
  arabicName: string;
  surahNumber: number;
  verseRange?: string; // e.g. "255" or "285-286"
  repetitions: number;
  virtue: string;
  totalVerses: number;
  revelationPlace: "Mecca" | "Medina";
  audioSurahUrl: string;
}

export const DEFAULT_RECITER = {
  name: "Sheikh Yasser Al-Dosari",
  arabicName: "الشيخ ياسر الدوسري",
  id: "yasser",
};

export interface PrayerSlotConfig {
  id: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "friday";
  name: string;
  arabicTime: string;
  timeRange: string;
  description: string;
  targets: SurahTarget[];
}

export const QURAN_PRAYER_SLOTS: Record<string, PrayerSlotConfig> = {
  friday: {
    id: "friday",
    name: "Friday (Jumu'ah) Sunnah",
    arabicTime: "يوم الجمعة",
    timeRange: "All Day Friday (until Maghrib)",
    description: "Sunnah of Jumu'ah: Reciting Surah Al-Kahf brings light that illuminates from one Friday to the next.",
    targets: [
      {
        id: "kahf",
        name: "Surah Al-Kahf",
        arabicName: "الكهف",
        surahNumber: 18,
        repetitions: 1,
        totalVerses: 110,
        revelationPlace: "Mecca",
        virtue: "Whoever reads Surah Al-Kahf on the day of Jumu'ah, will have a light that will shine from him from one Friday to the next (Al-Hakim & Al-Bayhaqi).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/018.mp3",
      },
    ],
  },
  fajr: {
    id: "fajr",
    name: "Fajr Routine",
    arabicTime: "صلاة الفجر",
    timeRange: "04:30 AM – 11:30 AM",
    description: "Morning spiritual anchor: Surah Yasin for blessings and ease, followed by 3x Three Quls for comprehensive protection.",
    targets: [
      {
        id: "yasin",
        name: "Surah Yā Sīn",
        arabicName: "يس",
        surahNumber: 36,
        repetitions: 1,
        totalVerses: 83,
        revelationPlace: "Mecca",
        virtue: "Known as the heart of the Quran. Recitation in the morning brings ease to affairs and divine forgiveness.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/036.mp3",
      },
      {
        id: "ikhlas_fajr",
        name: "Surah Al-Ikhlās",
        arabicName: "الإخلاص",
        surahNumber: 112,
        repetitions: 3,
        totalVerses: 4,
        revelationPlace: "Mecca",
        virtue: "Equal to one-third of the Quran. Recited 3 times in morning and evening for total protection from harm.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/112.mp3",
      },
      {
        id: "falaq_fajr",
        name: "Surah Al-Falaq",
        arabicName: "الفلق",
        surahNumber: 113,
        repetitions: 3,
        totalVerses: 5,
        revelationPlace: "Mecca",
        virtue: "Seeking refuge with the Lord of the daybreak from envy, witchcraft, and darkness.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/113.mp3",
      },
      {
        id: "nas_fajr",
        name: "Surah An-Nās",
        arabicName: "الناس",
        surahNumber: 114,
        repetitions: 3,
        totalVerses: 6,
        revelationPlace: "Mecca",
        virtue: "Seeking refuge in the Lord, King, and God of mankind from the whispers of retreating whisperers.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/114.mp3",
      },
    ],
  },
  dhuhr: {
    id: "dhuhr",
    name: "Dhuhr Routine",
    arabicTime: "صلاة الظهر",
    timeRange: "11:30 AM – 03:45 PM",
    description: "Midday post-prayer Adhkar: Ayat al-Kursi and Three Quls (1x each).",
    targets: [
      {
        id: "kursi_dhuhr",
        name: "Ayat al-Kursi (Al-Baqarah 2:255)",
        arabicName: "آية الكرسي",
        surahNumber: 2,
        verseRange: "255",
        repetitions: 1,
        totalVerses: 1,
        revelationPlace: "Medina",
        virtue: "Whoever recites Ayat al-Kursi immediately after each obligatory prayer, there's nothing between him and entering Paradise except death (An-Nasa'i).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/002.mp3",
      },
      {
        id: "ikhlas_dhuhr",
        name: "Surah Al-Ikhlās",
        arabicName: "الإخلاص",
        surahNumber: 112,
        repetitions: 1,
        totalVerses: 4,
        revelationPlace: "Mecca",
        virtue: "Post-prayer Sunnah: Recited 1 time after Dhuhr, Asr, and Isha.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/112.mp3",
      },
      {
        id: "falaq_dhuhr",
        name: "Surah Al-Falaq",
        arabicName: "الفلق",
        surahNumber: 113,
        repetitions: 1,
        totalVerses: 5,
        revelationPlace: "Mecca",
        virtue: "Protection against outward evils and jealous eyes.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/113.mp3",
      },
      {
        id: "nas_dhuhr",
        name: "Surah An-Nās",
        arabicName: "الناس",
        surahNumber: 114,
        repetitions: 1,
        totalVerses: 6,
        revelationPlace: "Mecca",
        virtue: "Protection against inward whispers and doubt.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/114.mp3",
      },
    ],
  },
  asr: {
    id: "asr",
    name: "Asr Routine",
    arabicTime: "صلاة العصر",
    timeRange: "03:45 PM – 06:15 PM",
    description: "Late afternoon post-prayer Adhkar: Ayat al-Kursi and Three Quls (1x each).",
    targets: [
      {
        id: "kursi_asr",
        name: "Ayat al-Kursi (Al-Baqarah 2:255)",
        arabicName: "آية الكرسي",
        surahNumber: 2,
        verseRange: "255",
        repetitions: 1,
        totalVerses: 1,
        revelationPlace: "Medina",
        virtue: "The greatest verse of the Holy Quran, recited after Asr prayer for divine custody and barakah.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/002.mp3",
      },
      {
        id: "ikhlas_asr",
        name: "Surah Al-Ikhlās",
        arabicName: "الإخلاص",
        surahNumber: 112,
        repetitions: 1,
        totalVerses: 4,
        revelationPlace: "Mecca",
        virtue: "Affirmation of absolute Tawheed (Oneness of Allah).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/112.mp3",
      },
      {
        id: "falaq_asr",
        name: "Surah Al-Falaq",
        arabicName: "الفلق",
        surahNumber: 113,
        repetitions: 1,
        totalVerses: 5,
        revelationPlace: "Mecca",
        virtue: "Seeking refuge with the Lord of dawn.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/113.mp3",
      },
      {
        id: "nas_asr",
        name: "Surah An-Nās",
        arabicName: "الناس",
        surahNumber: 114,
        repetitions: 1,
        totalVerses: 6,
        revelationPlace: "Mecca",
        virtue: "Seeking refuge from evil whispers.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/114.mp3",
      },
    ],
  },
  maghrib: {
    id: "maghrib",
    name: "Maghrib Routine",
    arabicTime: "صلاة المغرب",
    timeRange: "06:15 PM – 07:45 PM",
    description: "Sunset & Evening protection: Surah Al-Waqi'ah for protection against poverty, plus 3x Three Quls.",
    targets: [
      {
        id: "waqiah",
        name: "Surah Al-Wāqi‘ah",
        arabicName: "الواقعة",
        surahNumber: 56,
        repetitions: 1,
        totalVerses: 96,
        revelationPlace: "Mecca",
        virtue: "The Prophet (ﷺ) said: 'Whoever recites Surah Al-Waqi'ah every night will never be afflicted by poverty' (Ibn Kathir, Bayhaqi).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/056.mp3",
      },
      {
        id: "ikhlas_maghrib",
        name: "Surah Al-Ikhlās",
        arabicName: "الإخلاص",
        surahNumber: 112,
        repetitions: 3,
        totalVerses: 4,
        revelationPlace: "Mecca",
        virtue: "Evening protection: Recited 3 times alongside Falaq & Nas to shield until morning.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/112.mp3",
      },
      {
        id: "falaq_maghrib",
        name: "Surah Al-Falaq",
        arabicName: "الفلق",
        surahNumber: 113,
        repetitions: 3,
        totalVerses: 5,
        revelationPlace: "Mecca",
        virtue: "Evening shield against all forms of created darkness and evil.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/113.mp3",
      },
      {
        id: "nas_maghrib",
        name: "Surah An-Nās",
        arabicName: "الناس",
        surahNumber: 114,
        repetitions: 3,
        totalVerses: 6,
        revelationPlace: "Mecca",
        virtue: "Shield against the whisperers from jinn and mankind during the night.",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/114.mp3",
      },
    ],
  },
  isha: {
    id: "isha",
    name: "Isha & Night Routine",
    arabicTime: "صلاة العشاء والنوم",
    timeRange: "07:45 PM – 04:30 AM",
    description: "Night protection & preparation for sleep: Surah Al-Mulk to protect from grave punishment, plus the last two verses of Surah Al-Baqarah.",
    targets: [
      {
        id: "mulk",
        name: "Surah Al-Mulk",
        arabicName: "الملك",
        surahNumber: 67,
        repetitions: 1,
        totalVerses: 30,
        revelationPlace: "Mecca",
        virtue: "The Prophet (ﷺ) said: 'There is a chapter of 30 verses that intercedes for its companion until he is forgiven: Tabarak alladhi bi-yadihi al-Mulk' (Abu Dawood & Tirmidhi).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/067.mp3",
      },
      {
        id: "last2_baqarah",
        name: "Last 2 Verses of Al-Baqarah (2:285–286)",
        arabicName: "خواتيم سورة البقرة",
        surahNumber: 2,
        verseRange: "285-286",
        repetitions: 1,
        totalVerses: 2,
        revelationPlace: "Medina",
        virtue: "The Prophet (ﷺ) said: 'Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him' (Sahih Al-Bukhari 5009).",
        audioSurahUrl: "https://server11.mp3quran.net/yasser/002.mp3",
      },
    ],
  },
};

/**
 * Determine the active prayer slot automatically based on time in Asia/Kolkata
 */
export function getAutoPrayerSlot(now: Date = new Date()): {
  slot: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "friday";
  isFriday: boolean;
  activeConfig: PrayerSlotConfig;
} {
  // Convert current time to Asia/Kolkata parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const timeInMinutes = hour * 60 + minute;

  const isFriday = weekday.toLowerCase() === "friday";

  // Check prayer time windows
  // Fajr: 04:30 (270 min) to 11:30 (690 min)
  // Dhuhr: 11:30 (690 min) to 15:45 (945 min)
  // Asr: 15:45 (945 min) to 18:15 (1095 min)
  // Maghrib: 18:15 (1095 min) to 19:45 (1185 min)
  // Isha: 19:45 (1185 min) to 04:30 (270 min next day)

  let slotKey: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "friday";

  // If Friday daytime (until Maghrib ~ 18:15), Friday Surah Al-Kahf is a top recommendation
  if (isFriday && timeInMinutes >= 270 && timeInMinutes < 1095) {
    slotKey = "friday";
  } else if (timeInMinutes >= 270 && timeInMinutes < 690) {
    slotKey = "fajr";
  } else if (timeInMinutes >= 690 && timeInMinutes < 945) {
    slotKey = "dhuhr";
  } else if (timeInMinutes >= 945 && timeInMinutes < 1095) {
    slotKey = "asr";
  } else if (timeInMinutes >= 1095 && timeInMinutes < 1185) {
    slotKey = "maghrib";
  } else {
    slotKey = "isha";
  }

  return {
    slot: slotKey,
    isFriday,
    activeConfig: QURAN_PRAYER_SLOTS[slotKey],
  };
}
