"use client";
import React, { useState, useCallback, Suspense, useEffect } from "react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import {
  Button,
  Spinner,
  CheckboxGroup,
  Checkbox,
  Skeleton,
  Chip,
  Divider,
} from "@heroui/react";
import useSWR from "swr";
import Timeline from "@/components/timeline";
import SearchForm from "@/components/search-form";
import SearchResults from "@/components/search-results";
import NewsSection from "@/components/news-section";
import TimelineSkeleton from "@/components/timeline-skeleton";
import { CalendarRange } from "lucide-react";
import {
  Event,
  Kalender,
  Jadwal,
  JadwalHari,
  MahasiswaBaru,
  KelasBaru,
  API_BASE_URL,
  ENDPOINTS,
} from "@/lib/types";
import {
  getTimelineData,
  saveTimelineData,
  getLastFetchedFormatted,
} from "@/lib/timelineStorage";

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");

    error.cause = {
      status: response.status,
      isServerDown: response.status === 500,
      message:
        response.status === 500
          ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
          : `Error ${response.status}: ${response.statusText}`,
    };

    throw error;
  }

  return response.json();
};

export default function Home() {
  const [kelas, setKelas] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showKelasData, setShowKelasData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [eventsData, setEventsData] = useState<Kalender | null>(null);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<any>(null);
  const [isRefreshingEvents, setIsRefreshingEvents] = useState(false);

  useEffect(() => {
    const { data } = getTimelineData();
    if (data) {
      setEventsData(data);
    } else {
      // If no local data, fetch from API
      fetchTimelineData();
    }
  }, []);

  // Function to fetch timeline data
  const fetchTimelineData = async () => {
    setIsEventsLoading(true);
    setEventsError(null);

    try {
      const data = await fetcher(ENDPOINTS.kalender);
      setEventsData(data);
      saveTimelineData(data);
      setIsEventsLoading(false);
    } catch (error) {
      setEventsError(error);
      setIsEventsLoading(false);
    }
  };

  // Function to refresh timeline data
  const refreshTimelineData = async () => {
    setIsRefreshingEvents(true);

    try {
      const data = await fetcher(ENDPOINTS.kalender);
      setEventsData(data);
      saveTimelineData(data);
      setIsRefreshingEvents(false);
    } catch (error) {
      setEventsError(error);
      setIsRefreshingEvents(false);
    }
  };

  const {
    data: jadwalData,
    error: jadwalError,
    isLoading: isJadwalLoading,
  } = useSWR(
    showKelasData && selectedOptions.includes("jadwal") && kelas
      ? ENDPOINTS.jadwal(kelas)
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const {
    data: kelasBaruData,
    error: kelasBaruError,
    isLoading: isKelasBaruLoading,
  } = useSWR(
    showKelasData && selectedOptions.includes("kelasBaru") && kelas
      ? ENDPOINTS.kelasBaru(kelas)
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const {
    data: mahasiswaBaruData,
    error: mahasiswaBaruError,
    isLoading: isMahasiswaBaruLoading,
  } = useSWR(
    showKelasData && selectedOptions.includes("mahasiswaBaru") && kelas
      ? ENDPOINTS.mahasiswaBaru(kelas)
      : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const handleSearchSubmit = useCallback(
    async (searchKelas: string, searchOptions: string[]) => {
      setKelas(searchKelas);
      setSelectedOptions(searchOptions);
      setIsLoading(true);
      setShowKelasData(false);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsLoading(false);
      setShowKelasData(true);
    },
    [],
  );

  return (
    <div className="container mx-auto w-full px-4 sm:px-6">
      <section aria-label="Search Form" className="mb-12 w-full">
        <div className="mb-6">
          <h2 className="text-2xl tracking-tight text-zinc-800 dark:text-zinc-300 md:text-3xl">
            Masukin NPM, nama, atau kelas buat nyari data akademik yang
            dibutuhkan
          </h2>
        </div>
        <SearchForm onSubmit={handleSearchSubmit} isLoading={isLoading} />
      </section>

      {showKelasData && (
        <SearchResults
          selectedOptions={selectedOptions}
          kelas={kelas}
          jadwalData={jadwalData}
          kelasBaruData={kelasBaruData}
          mahasiswaBaruData={mahasiswaBaruData}
          isJadwalLoading={isJadwalLoading}
          isKelasBaruLoading={isKelasBaruLoading}
          isMahasiswaBaruLoading={isMahasiswaBaruLoading}
          jadwalError={jadwalError}
          kelasBaruError={kelasBaruError}
          mahasiswaBaruError={mahasiswaBaruError}
        />
      )}

      {/* <section aria-label="Berita Terkini" className="mb-12">
        <NewsSection />
      </section> */}

      <section aria-label="Kalender Akademik" className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="max-w-lg text-xl font-medium tracking-tight md:text-2xl">
              Timeline <strong className="font-bold">Akademik</strong>_
            </h3>
          </div>
        </div>

        {isEventsLoading ? (
          <TimelineSkeleton />
        ) : eventsError ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-white/70 p-6 backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
            <div className="text-center">
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
              <h4 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {(eventsError as any)?.cause?.isServerDown
                  ? "Server tidak dapat diakses"
                  : "Gagal memuat data kalender"}
              </h4>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                {(eventsError as any)?.cause?.isServerDown
                  ? "Server utama BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                  : "Terjadi kesalahan saat mengambil data kalender akademik. Silakan coba lagi."}
              </p>
              <Button
                variant="flat"
                color="primary"
                size="sm"
                onClick={fetchTimelineData}
                className="mx-auto"
              >
                Muat Ulang
              </Button>
            </div>
          </div>
        ) : eventsData && eventsData.data ? (
          <Suspense fallback={<TimelineSkeleton />}>
            <Timeline
              events={eventsData.data}
              onRefresh={refreshTimelineData}
              lastUpdated={getLastFetchedFormatted()}
              isRefreshing={isRefreshingEvents}
            />
          </Suspense>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-white/70 p-6 backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-zinc-400"
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
              <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                Tidak ada data kalender ditemukan
              </p>
              <Button
                variant="flat"
                color="default"
                size="sm"
                className="mt-4"
                onClick={fetchTimelineData}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
