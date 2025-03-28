"use client";
import React, { useState, useEffect } from "react";
import Timeline from "@/components/timeline";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  fetchTimelineData,
  saveTimelineData,
  getLastFetchedFormatted,
  getLatestVersionTimestamp,
} from "@/lib/db/timeline";
import { ENDPOINTS } from "@/lib/types";

interface Event {
  kegiatan: string;
  tanggal: string;
  start: string;
  end: string;
}

interface Kalender {
  status: string;
  data: Event[];
}

// Implement custom fetcher with caching
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch data");

    error.cause = {
      status: res.status,
      isServerDown: res.status === 500,
      message:
        res.status === 500
          ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
          : `Error ${res.status}: ${res.statusText}`,
    };

    throw error;
  }
  return res.json();
};

export default function TimelinePage() {
  const [eventsData, setEventsData] = useState<Kalender | null>({
    status: "",
    data: [],
  });
  const [eventsError, setEventsError] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load timeline data on initial render
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await fetchTimelineData();
      if (data) {
        setEventsData(data);
      } else {
        // If no data in Redis, fetch from BAAK
        try {
          await refreshData();
        } catch (error) {
          console.error("Failed to fetch data from BAAK:", error);
          setEventsError({
            cause: {
              isServerDown: true,
              message:
                "Tidak ada data kalender ditemukan dan gagal mengambil dari BAAK",
            },
          });
        }
      }
    } catch (error) {
      setEventsError(error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch from BAAK API
      const response = await fetch(ENDPOINTS.kalender);
      if (!response.ok) throw new Error("Failed to fetch from BAAK");

      const data = await response.json();

      // Save to Redis
      const result = await saveTimelineData(data);

      // Update local state
      setEventsData(data);

      // Show appropriate toast notification
      if (result.success) {
        if (result.versionStored) {
          addToast({
            title: "Berhasil",
            description: `Data berhasil diperbarui dengan ${result.changes} perubahan`,
            color: "success",
          });
        } else {
          addToast({
            title: "Info",
            description: "Tidak ada perubahan pada data kalender akademik",
            color: "primary",
          });
        }
      }
    } catch (error) {
      setEventsError(error);
      addToast({
        title: "Gagal",
        description: "Gagal memperbarui data",
        color: "danger",
      });
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  if (eventsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-900">
        <div className="max-w-md rounded-lg border border-zinc-200/20 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-red-500">
            {(eventsError as any)?.cause?.isServerDown
              ? "Server tidak dapat diakses"
              : "Error"}
          </h2>
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            {(eventsError as any)?.cause?.isServerDown
              ? "Server utama BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
              : "Failed to load timeline data"}
          </p>
          <Button
            variant="flat"
            color="primary"
            size="sm"
            onClick={refreshData}
            className="w-full"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-100 p-4 dark:bg-zinc-900">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/40"></div>
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-zinc-300/40 blur-3xl dark:bg-zinc-700/30"></div>
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-zinc-200/20 blur-3xl dark:bg-zinc-800/20"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="col-span-full mb-8 flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 lg:text-4xl xl:text-5xl">
            Timeline Kalender Akademik
          </h1>
          <p className="mt-2 max-w-2xl rounded-lg border border-zinc-200/20 bg-zinc-200/30 p-3 text-base text-zinc-600 backdrop-blur-sm dark:border-zinc-700/20 dark:bg-zinc-800/30 dark:text-zinc-400 sm:text-lg">
            Lihat timeline kegiatan akademik yang akan datang pada kalender di
            bawah ini
          </p>
        </div>

        <div className="w-full overflow-visible">
          <Timeline
            events={eventsData?.data || []}
            onRefresh={refreshData}
            lastUpdated={getLatestVersionTimestamp(false)}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
    </div>
  );
}
