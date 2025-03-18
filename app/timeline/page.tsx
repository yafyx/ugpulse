"use client";
import React from "react";
import useSWR from "swr";
import Timeline from "@/components/timeline";
import { Spinner } from "@heroui/react";

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
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function TimelinePage() {
  const { data: eventsData, error: eventsError } = useSWR<Kalender>(
    "https://baak-api.vercel.app/kalender",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 86400000, // 24 hours in milliseconds
      // Only revalidate once per day
      refreshInterval: 86400000, // 24 hours in milliseconds
    },
  );

  if (eventsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100 p-4 dark:bg-zinc-900">
        <div className="max-w-md rounded-lg border border-zinc-200/20 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
          <h2 className="mb-4 text-xl font-bold text-red-500">Error</h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Failed to load timeline data
          </p>
        </div>
      </div>
    );
  }

  if (!eventsData) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <Spinner size="lg" color="default" />
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
          <Timeline events={eventsData.data} />
        </div>
      </div>
    </div>
  );
}
