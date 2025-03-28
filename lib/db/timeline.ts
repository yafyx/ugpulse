import { Kalender } from "@/lib/types";

interface TimelineVersion {
    data: Kalender;
    timestamp: string;
    changes?: number;
}

interface TimelineResponse {
    success: boolean;
    data: Kalender | null;
    versions: string[];
    error?: string;
}

let cachedData: Kalender | null = null;
let cachedVersions: TimelineVersion[] = [];
let lastFetched: string | null = null;

export async function fetchTimelineData(): Promise<{ data: Kalender | null; versions: TimelineVersion[] }> {
    try {
        const response = await fetch('/api/timeline');
        const result: TimelineResponse = await response.json();

        if (result.success && result.data) {
            cachedData = result.data;
            cachedVersions = result.versions.map(v => JSON.parse(v));
            lastFetched = new Date().toISOString();
            return { data: result.data, versions: cachedVersions };
        }

        return { data: null, versions: [] };
    } catch (error) {
        console.error('Failed to fetch timeline data:', error);
        return { data: null, versions: [] };
    }
}

export async function saveTimelineData(data: Kalender): Promise<boolean> {
    try {
        const response = await fetch('/api/timeline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
            // Update cache
            cachedData = data;
            lastFetched = result.timestamp;

            // Fetch updated versions
            await fetchTimelineData();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to save timeline data:', error);
        return false;
    }
}

export function getTimelineData(): { data: Kalender | null; lastFetched: Date | null } {
    return {
        data: cachedData,
        lastFetched: lastFetched ? new Date(lastFetched) : null,
    };
}

export function getTimelineHistory(): TimelineVersion[] {
    return cachedVersions;
}

export function hasTimelineData(): boolean {
    return cachedData !== null;
}

export function getLastFetchedFormatted(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : (lastFetched ? new Date(lastFetched) : null);
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