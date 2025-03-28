import { ENDPOINTS } from '@/lib/types';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

const TIMELINE_KEY = 'timeline_data';
const TIMELINE_VERSIONS_KEY = 'timeline_versions';

export async function GET() {
    try {
        // Get current timeline data
        const data = await redis.get(TIMELINE_KEY);
        const versions = await redis.lrange(TIMELINE_VERSIONS_KEY, 0, 9); // Get last 10 versions

        // If no data is found in Redis, fetch from API
        if (!data) {
            console.log('No calendar data found in Redis, fetching from API...');
            const response = await fetch(ENDPOINTS.kalender);

            if (!response.ok) {
                throw new Error('Failed to fetch data from BAAK API');
            }

            const apiData = await response.json();

            // Save to Redis
            await redis.set(TIMELINE_KEY, apiData);

            // Add to versions list only for initial load
            const timestamp = new Date().toISOString();
            const version = {
                data: apiData,
                timestamp,
                changes: apiData.data?.length || 0,
                source: 'auto-fetch'
            };

            await redis.lpush(TIMELINE_VERSIONS_KEY, JSON.stringify(version));
            await redis.ltrim(TIMELINE_VERSIONS_KEY, 0, 9);

            return NextResponse.json({
                success: true,
                data: apiData,
                versions: [JSON.stringify(version)],
                source: 'api'
            });
        }

        // Make sure all versions are strings for proper JSON parsing
        const processedVersions = versions.map(v => {
            // If already a string, return it
            if (typeof v === 'string') {
                return v;
            }
            // If an object, stringify it
            return JSON.stringify(v);
        });

        return NextResponse.json({
            success: true,
            data,
            versions: processedVersions,
            source: 'redis'
        });
    } catch (error) {
        console.error('Timeline data fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch timeline data' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const timestamp = new Date().toISOString();

        // Get current data to compare changes
        const currentData = await redis.get<any>(TIMELINE_KEY);

        // Calculate changes if there's previous data
        let changes = 0;
        if (currentData?.data) {
            const oldEvents = new Set(currentData.data.map((e: any) => JSON.stringify(e)));
            const newEvents = new Set(body.data.map((e: any) => JSON.stringify(e)));

            changes = Math.abs(newEvents.size - oldEvents.size);
            newEvents.forEach(event => {
                if (!oldEvents.has(event)) changes++;
            });
        }

        // Store current data
        await redis.set(TIMELINE_KEY, body);

        // Only store a new version if there are actual changes
        if (changes > 0 || !currentData) {
            // Save new version with metadata
            const version = {
                data: body,
                timestamp,
                changes: changes || body.data?.length || 0
            };

            // Add to versions list (keep only last 10)
            await redis.lpush(TIMELINE_VERSIONS_KEY, JSON.stringify(version));
            await redis.ltrim(TIMELINE_VERSIONS_KEY, 0, 9);
        }

        return NextResponse.json({
            success: true,
            timestamp,
            changes,
            versionStored: changes > 0 || !currentData
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to update timeline data' },
            { status: 500 }
        );
    }
} 