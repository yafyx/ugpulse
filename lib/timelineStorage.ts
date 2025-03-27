import { Kalender } from "@/lib/types";

const TIMELINE_STORAGE_KEY = "timeline_data";
const LAST_FETCHED_KEY = "timeline_last_fetched";

export function saveTimelineData(data: Kalender): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(LAST_FETCHED_KEY, new Date().toISOString());
    }
}

export function getTimelineData(): { data: Kalender | null; lastFetched: Date | null } {
    if (typeof window !== "undefined") {
        const dataStr = localStorage.getItem(TIMELINE_STORAGE_KEY);
        const lastFetchedStr = localStorage.getItem(LAST_FETCHED_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            lastFetched: lastFetchedStr ? new Date(lastFetchedStr) : null
        };
    }

    return { data: null, lastFetched: null };
}

export function hasTimelineData(): boolean {
    if (typeof window !== "undefined") {
        return localStorage.getItem(TIMELINE_STORAGE_KEY) !== null;
    }
    return false;
}

export function getLastFetchedFormatted(): string {
    const { lastFetched } = getTimelineData();
    if (!lastFetched) return "Never";

    // Format date as "DD MMM YYYY HH:MM"
    return new Intl.DateTimeFormat('id', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(lastFetched);
} 