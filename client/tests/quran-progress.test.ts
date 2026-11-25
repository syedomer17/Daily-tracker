import { describe, it, expect, beforeEach } from "vitest";
import { useTrackerStore } from "@/lib/store";

describe("Quran & Adhkar Progress Persistence", () => {
  beforeEach(() => {
    // Reset store to known state
    useTrackerStore.setState({
      todayDate: "2026-11-25",
      dailyRecords: {},
      quranProgressByDate: {},
    });
  });

  it("initializes with empty quran progress for a date", () => {
    const store = useTrackerStore.getState();
    const progress = store.getQuranProgressForDate("2026-11-25");
    expect(progress).toEqual({});
  });

  it("increments repetition and persists progress in daily record and quranProgressByDate", () => {
    const store = useTrackerStore.getState();
    store.incrementQuranRepetition("yasin", "2026-11-25");

    const updated = useTrackerStore.getState();
    const progress = updated.getQuranProgressForDate("2026-11-25");
    expect(progress["yasin"]).toBe(1);

    // Verify it is saved in dailyRecords for that date
    const dailyRecord = updated.dailyRecords["2026-11-25"];
    expect(dailyRecord).toBeDefined();
    expect(dailyRecord.quranProgress?.["yasin"]).toBe(1);
    expect(dailyRecord.habits.quran).toBe(true);
  });

  it("marks a multi-repetition item done directly (e.g. 3x Three Quls)", () => {
    const store = useTrackerStore.getState();
    store.markQuranDone("ikhlas_fajr", 3, "2026-11-25");

    const updated = useTrackerStore.getState();
    const progress = updated.getQuranProgressForDate("2026-11-25");
    expect(progress["ikhlas_fajr"]).toBe(3);

    // Toggling again un-marks it
    store.markQuranDone("ikhlas_fajr", 3, "2026-11-25");
    const toggledOff = useTrackerStore.getState().getQuranProgressForDate("2026-11-25");
    expect(toggledOff["ikhlas_fajr"]).toBe(0);
  });

  it("resets repetition counter when requested", () => {
    const store = useTrackerStore.getState();
    store.incrementQuranRepetition("mulk", "2026-11-25");
    expect(useTrackerStore.getState().getQuranProgressForDate("2026-11-25")["mulk"]).toBe(1);

    store.resetQuranRepetition("mulk", "2026-11-25");
    expect(useTrackerStore.getState().getQuranProgressForDate("2026-11-25")["mulk"]).toBe(0);
  });

  it("persists progress across simulated page reload / store re-subscription", () => {
    const store = useTrackerStore.getState();
    store.markQuranDone("waqiah", 1, "2026-11-25");
    store.incrementQuranRepetition("falaq_maghrib", "2026-11-25");

    // Simulate page reload by creating a snapshot and rehydrating state
    const savedSnapshot = {
      quranProgressByDate: useTrackerStore.getState().quranProgressByDate,
      dailyRecords: useTrackerStore.getState().dailyRecords,
    };

    // Rehydrate
    useTrackerStore.setState({
      quranProgressByDate: savedSnapshot.quranProgressByDate,
      dailyRecords: savedSnapshot.dailyRecords,
    });

    const reloadedProgress = useTrackerStore.getState().getQuranProgressForDate("2026-11-25");
    expect(reloadedProgress["waqiah"]).toBe(1);
    expect(reloadedProgress["falaq_maghrib"]).toBe(1);
  });

  it("isolates quran progress date-wise", () => {
    const store = useTrackerStore.getState();
    store.markQuranDone("kahf", 1, "2026-11-27"); // Friday

    const progressFriday = useTrackerStore.getState().getQuranProgressForDate("2026-11-27");
    const progressToday = useTrackerStore.getState().getQuranProgressForDate("2026-11-25");

    expect(progressFriday["kahf"]).toBe(1);
    expect(progressToday["kahf"]).toBeUndefined();
  });
});
