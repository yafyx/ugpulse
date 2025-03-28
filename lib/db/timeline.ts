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
            cachedVersions = result.versions.map(v => {
                // Make sure we're only parsing strings
                if (typeof v === 'string') {
                    try {
                        return JSON.parse(v);
                    } catch (e) {
                        console.error('Error parsing version:', e);
                        return null;
                    }
                } else {
                    // If it's already an object, return it as is
                    return v;
                }
            }).filter(Boolean) as TimelineVersion[]; // Filter out null values

            lastFetched = new Date().toISOString();
            return { data: result.data, versions: cachedVersions };
        }

        return { data: null, versions: [] };
    } catch (error) {
        console.error('Failed to fetch timeline data:', error);
        return { data: null, versions: [] };
    }
}

export async function saveTimelineData(data: Kalender): Promise<{ success: boolean; versionStored: boolean; changes?: number }> {
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
            return {
                success: true,
                versionStored: result.versionStored || false,
                changes: result.changes || 0
            };
        }

        return { success: false, versionStored: false };
    } catch (error) {
        console.error('Failed to save timeline data:', error);
        return { success: false, versionStored: false };
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

export function getLastFetchedFormatted(timestamp?: string, useRelativeTime: boolean = true): string {
    const date = timestamp ? new Date(timestamp) : (lastFetched ? new Date(lastFetched) : null);
    if (!date) return "Never";

    // Format for displaying the full date and time
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('id', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    // If not using relative time, always show the formatted date
    if (!useRelativeTime) {
        return formatDate(date);
    }

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
    return formatDate(date);
}

// Get the timestamp of the latest version update (not just the check time)
export function getLatestVersionTimestamp(useRelativeTime: boolean = true): string {
    // If we have version history, use the timestamp from the most recent version
    if (cachedVersions.length > 0) {
        // First version in the array should be the most recent one
        const latestVersion = cachedVersions[0];
        return getLastFetchedFormatted(latestVersion.timestamp, useRelativeTime);
    }

    // Fall back to the last fetched time if no versions are available
    return getLastFetchedFormatted(undefined, useRelativeTime);
} 