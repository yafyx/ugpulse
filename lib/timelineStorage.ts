import { Kalender } from "@/lib/types";

const TIMELINE_STORAGE_KEY = "timeline_data";
const LAST_FETCHED_KEY = "timeline_last_fetched";
const TIMELINE_HISTORY_KEY = "timeline_history";

interface TimelineVersion {
    data: Kalender;
    timestamp: string;
    changes?: number;
}

export function saveTimelineData(data: Kalender): void {
    if (typeof window !== "undefined") {
        // Save current data
        localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(data));
        const timestamp = new Date().toISOString();
        localStorage.setItem(LAST_FETCHED_KEY, timestamp);

        // Update history
        const history = getTimelineHistory();
        const previousData = history[0]?.data;

        // Calculate changes if there's previous data
        let changes = 0;
        if (previousData) {
            const oldEvents = new Set(previousData.data.map(e => JSON.stringify(e)));
            const newEvents = new Set(data.data.map(e => JSON.stringify(e)));

            // Count added and removed events
            changes = Math.abs(newEvents.size - oldEvents.size);
            newEvents.forEach(event => {
                if (!oldEvents.has(event)) changes++;
            });
        }

        // Add new version to history
        const newVersion: TimelineVersion = {
            data,
            timestamp,
            changes: changes || undefined
        };

        // Keep only last 10 versions
        const updatedHistory = [newVersion, ...history].slice(0, 10);
        localStorage.setItem(TIMELINE_HISTORY_KEY, JSON.stringify(updatedHistory));
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

export function getTimelineHistory(): TimelineVersion[] {
    if (typeof window !== "undefined") {
        const historyStr = localStorage.getItem(TIMELINE_HISTORY_KEY);
        return historyStr ? JSON.parse(historyStr) : [];
    }
    return [];
}

export function hasTimelineData(): boolean {
    if (typeof window !== "undefined") {
        return localStorage.getItem(TIMELINE_STORAGE_KEY) !== null;
    }
    return false;
}

export function getLastFetchedFormatted(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : getTimelineData().lastFetched;
    if (!date) return "Never";

    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
        // If less than 24 hours ago, show relative time
        if (diffInHours < 1) {
            const minutes = Math.round(diffInHours * 60);
            return `${minutes} menit yang lalu`;
        }
        return `${Math.round(diffInHours)} jam yang lalu`;
    }

    // Otherwise show formatted date
    return new Intl.DateTimeFormat('id', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
} 