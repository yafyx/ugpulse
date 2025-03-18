import React from "react";
import { Button, Skeleton } from "@heroui/react";
import JadwalTable from "@/components/jadwal-table";
import MahasiswaTable from "@/components/mahasiswa-table";

interface Jadwal {
  nama: string;
  waktu: string;
  jam: string;
  ruang: string;
  dosen: string;
}

interface JadwalData {
  data: {
    jadwal: {
      [key: string]: Jadwal[] | null;
    };
  };
}

interface SearchResultsProps {
  selectedOptions: string[];
  kelas: string;
  jadwalData: JadwalData | null;
  kelasBaruData: any | null;
  mahasiswaBaruData: any | null;
  isJadwalLoading: boolean;
  isKelasBaruLoading: boolean;
  isMahasiswaBaruLoading: boolean;
  jadwalError: any;
  kelasBaruError: any;
  mahasiswaBaruError: any;
}

export default function SearchResults({
  selectedOptions,
  kelas,
  jadwalData,
  kelasBaruData,
  mahasiswaBaruData,
  isJadwalLoading,
  isKelasBaruLoading,
  isMahasiswaBaruLoading,
  jadwalError,
  kelasBaruError,
  mahasiswaBaruError,
}: SearchResultsProps) {
  const selectedOptionsCount = selectedOptions.length;

  // Check if any data is available to display
  const hasJadwalData =
    selectedOptions.includes("jadwal") && jadwalData?.data?.jadwal;
  const hasKelasBaruData =
    selectedOptions.includes("kelasBaru") && kelasBaruData?.data;
  const hasMahasiswaBaruData =
    selectedOptions.includes("mahasiswaBaru") && mahasiswaBaruData?.data;

  // Check if any option is loading
  const isLoading =
    isJadwalLoading || isKelasBaruLoading || isMahasiswaBaruLoading;

  // Check if there are any errors
  const hasErrors = jadwalError || kelasBaruError || mahasiswaBaruError;

  const shouldShowResults =
    hasJadwalData ||
    hasKelasBaruData ||
    hasMahasiswaBaruData ||
    hasErrors ||
    isLoading;

  if (!shouldShowResults) {
    return null;
  }

  const JadwalSkeleton = () => (
    <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
      <div className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Jadwal Kelas
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );

  const DataTableSkeleton = ({ title }: { title: string }) => (
    <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
      <div className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <Skeleton className="h-8 w-1/4 rounded-lg" />
            <Skeleton className="h-8 w-1/4 rounded-lg" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-10 w-1/4 rounded-lg" />
              <Skeleton className="h-10 w-1/4 rounded-lg" />
              <Skeleton className="h-10 w-1/4 rounded-lg" />
              <Skeleton className="h-10 w-1/4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section aria-label="Hasil Pencarian" className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        Hasil Pencarian
      </h2>

      <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-6">
        {selectedOptions.includes("jadwal") && (
          <div
            className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
          >
            {jadwalError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500">Failed to load jadwal data</p>
                <Button
                  size="sm"
                  className="mt-2 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : isJadwalLoading ? (
              <JadwalSkeleton />
            ) : jadwalData?.data?.jadwal ? (
              <JadwalTable jadwal={jadwalData.data.jadwal} kelas={kelas} />
            ) : (
              <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                Tidak ada data jadwal ditemukan
              </p>
            )}
          </div>
        )}

        {selectedOptions.includes("kelasBaru") && (
          <div
            className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
          >
            {kelasBaruError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500">Failed to load kelas baru data</p>
                <Button
                  size="sm"
                  className="mt-2 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : isKelasBaruLoading ? (
              <DataTableSkeleton title="Kelas Baru" />
            ) : kelasBaruData?.data ? (
              <MahasiswaTable data={kelasBaruData.data} type="kelasBaru" />
            ) : (
              <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                Tidak ada data kelas baru ditemukan
              </p>
            )}
          </div>
        )}

        {selectedOptions.includes("mahasiswaBaru") && (
          <div
            className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
          >
            {mahasiswaBaruError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-red-500">
                  Failed to load mahasiswa baru data
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </Button>
              </div>
            ) : isMahasiswaBaruLoading ? (
              <DataTableSkeleton title="Mahasiswa Baru" />
            ) : mahasiswaBaruData?.data ? (
              <MahasiswaTable
                data={mahasiswaBaruData.data}
                type="mahasiswaBaru"
              />
            ) : (
              <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                Tidak ada data mahasiswa baru ditemukan
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
