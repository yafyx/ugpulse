"use client";
import React, { useState, useCallback } from "react";
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

interface Jadwal {
  nama: string;
  waktu: string;
  jam: string;
  ruang: string;
  dosen: string;
}

interface JadwalHari {
  [key: string]: Jadwal[] | null;
}

interface MahasiswaBaru {
  no_pend: string;
  nama: string;
  npm: string;
  kelas: string;
  keterangan: string;
}

interface KelasBaru {
  npm: string;
  nama: string;
  kelas_lama: string;
  kelas_baru: string;
}

const API_BASE_URL = "https://baak-api.vercel.app";
const ENDPOINTS = {
  kalender: `${API_BASE_URL}/kalender`,
  jadwal: (kelas: string) => `${API_BASE_URL}/jadwal/${kelas}`,
  kelasBaru: (kelas: string) => `${API_BASE_URL}/kelasbaru/${kelas}`,
  mahasiswaBaru: (kelas: string) => `${API_BASE_URL}/mahasiswabaru/${kelas}`,
};

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return response.json();
};

export default function Home() {
  const [kelas, setKelas] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showKelasData, setShowKelasData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: eventsData,
    error: eventsError,
    isLoading: isEventsLoading,
  } = useSWR<Kalender>(ENDPOINTS.kalender, fetcher, {
    revalidateOnFocus: false,
  });

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
      setShowKelasData(true);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    },
    [],
  );

  if (eventsError) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center rounded-xl p-4">
        <Card className="max-w-md border-none bg-gradient-to-br from-white/90 to-white/70 shadow-xl backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
          <CardHeader className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              <h1 className="text-xl font-bold">Error</h1>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <p className="text-zinc-700 dark:text-zinc-300">
              Failed to load calendar data. Please try again later.
            </p>
          </CardBody>
          <CardFooter className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <Button
              color="primary"
              variant="shadow"
              onClick={() => window.location.reload()}
              radius="sm"
              className="w-full"
            >
              Refresh Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <section aria-label="Search Form" className="mb-12 w-full">
        <SearchForm onSubmit={handleSearchSubmit} isLoading={isLoading} />
      </section>

      {showKelasData && (
        <section aria-label="Search Results" className="mb-12">
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
        </section>
      )}

      {/* <section aria-label="Berita Terkini" className="mb-12">
        <NewsSection />
      </section> */}

      <section aria-label="Kalender Akademik" className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Timeline Akademik
          </h2>
          <div className="mx-4 h-1 flex-1 rounded-full bg-gradient-to-r from-zinc-300/80 to-transparent dark:from-zinc-700/80"></div>
          <Chip color="primary" variant="dot" className="font-medium">
            Terbaru
          </Chip>
        </div>

        {isEventsLoading ? (
          <div className="rounded-xl bg-gradient-to-br from-white/90 to-white/70 p-6 shadow-lg backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Divider className="my-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ) : eventsData && eventsData.data ? (
          <Timeline events={eventsData.data} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-white/70 p-6 shadow-lg backdrop-blur-lg dark:from-zinc-800/90 dark:to-zinc-900/70">
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
                onClick={() => window.location.reload()}
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
