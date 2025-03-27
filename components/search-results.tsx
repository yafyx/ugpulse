import React from "react";
import { Button, Skeleton } from "@heroui/react";
import JadwalTable from "@/components/jadwal-table";
import MahasiswaTable from "@/components/mahasiswa-table";
import { Jadwal, JadwalData, SearchResultsProps } from "@/lib/types";

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
    <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
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
    <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
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
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-zinc-200/20 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
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
                <h4 className="mb-2 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  {(jadwalError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Gagal memuat data jadwal"}
                </h4>
                <p className="mb-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {(jadwalError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Terjadi kesalahan saat mengambil data jadwal. Silakan coba lagi."}
                </p>
                <Button
                  size="sm"
                  className="bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
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
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-zinc-200/20 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
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
                <h4 className="mb-2 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  {(kelasBaruError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Gagal memuat data kelas baru"}
                </h4>
                <p className="mb-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {(kelasBaruError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Terjadi kesalahan saat mengambil data kelas baru. Silakan coba lagi."}
                </p>
                <Button
                  size="sm"
                  className="bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
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
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-zinc-200/20 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
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
                <h4 className="mb-2 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  {(mahasiswaBaruError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Gagal memuat data mahasiswa baru"}
                </h4>
                <p className="mb-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {(mahasiswaBaruError as any)?.cause?.isServerDown
                    ? "BAAK sedang tidak dapat diakses. Silakan coba lagi nanti."
                    : "Terjadi kesalahan saat mengambil data mahasiswa baru. Silakan coba lagi."}
                </p>
                <Button
                  size="sm"
                  className="bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
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
