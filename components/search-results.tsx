import React from "react";
import { Button, Spinner } from "@nextui-org/react";
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

  return (
    <section aria-label="Hasil Pencarian" className="mb-12 px-4 sm:px-6">
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
              <div className="flex items-center justify-center p-8">
                <Spinner color="default" label="Memuat data jadwal..." />
              </div>
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
            <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
              <div className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Kelas Baru
                </h3>
              </div>
              <div className="p-4">
                {kelasBaruError ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-500">
                      Failed to load kelas baru data
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                      onClick={() => window.location.reload()}
                    >
                      Coba Lagi
                    </Button>
                  </div>
                ) : isKelasBaruLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner
                      color="default"
                      label="Memuat data kelas baru..."
                    />
                  </div>
                ) : kelasBaruData?.data ? (
                  <MahasiswaTable data={kelasBaruData.data} type="kelasBaru" />
                ) : (
                  <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                    Tidak ada data kelas baru ditemukan
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedOptions.includes("mahasiswaBaru") && (
          <div
            className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
          >
            <div className="h-full rounded-lg border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
              <div className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
                <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  Mahasiswa Baru
                </h3>
              </div>
              <div className="p-4">
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
                  <div className="flex items-center justify-center p-8">
                    <Spinner
                      color="default"
                      label="Memuat data mahasiswa baru..."
                    />
                  </div>
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
