"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import {
  Button,
  Input,
  Spinner,
  CheckboxGroup,
  Checkbox,
} from "@nextui-org/react";
import { Skeleton } from "@nextui-org/skeleton";
import useSWR from "swr";
import Timeline from "@/components/timeline";
import JadwalTable from "@/components/jadwal-table";
import MahasiswaTable from "@/components/mahasiswa-table";
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
  const selectedOptionsCount = useMemo(
    () => selectedOptions.length,
    [selectedOptions],
  );

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

  const handleKelasChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKelas(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!kelas.trim() || selectedOptions.length === 0) {
        return;
      }

      setIsLoading(true);
      setShowKelasData(true);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    },
    [kelas, selectedOptions],
  );

  const handleOptionsChange = useCallback(
    (values: string[]) => {
      if (values.includes("kelasBaru") && values.includes("mahasiswaBaru")) {
        const newOption = values.includes("kelasBaru")
          ? "mahasiswaBaru"
          : "kelasBaru";
        const filteredValues = values.filter(
          (v) =>
            v !== (newOption === "kelasBaru" ? "mahasiswaBaru" : "kelasBaru"),
        );
        setSelectedOptions(filteredValues);
      } else {
        setSelectedOptions(values);
      }
    },
    [selectedOptions],
  );

  if (eventsError) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center rounded-xl">
        <Card className="max-w-md border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
          <CardBody className="p-6">
            <h1 className="mb-4 text-xl font-bold text-red-500">Error</h1>
            <p className="text-zinc-700 dark:text-zinc-300">
              Failed to load calendar data. Please try again later.
            </p>
            <Button
              className="mt-4 bg-zinc-800 text-white hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-4xl md:text-5xl">
          Cari jadwal dan daftar <br className="hidden sm:block" />
          <span className="inline-block text-zinc-600 dark:text-zinc-300">
            mahasiswa baru
          </span>
        </h1>

        <form onSubmit={handleSubmit} className="mb-10">
          <Card className="border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
            <CardBody className="p-4 sm:p-6">
              <div className="flex flex-col gap-6">
                <Input
                  variant="bordered"
                  className="font-medium"
                  labelPlacement="outside"
                  type="text"
                  label="Masukkan yang ingin dicari"
                  placeholder="Contoh: 2IA14"
                  value={kelas}
                  onChange={handleKelasChange}
                  aria-label="Kelas atau nama pencarian"
                  size="lg"
                  classNames={{
                    label:
                      "text-zinc-600 font-medium dark:text-zinc-400 text-sm mb-1",
                    input: [
                      "bg-transparent",
                      "text-zinc-800 dark:text-zinc-200",
                      "placeholder:text-zinc-500/60",
                    ],
                    inputWrapper: [
                      "bg-white/40 dark:bg-zinc-800/40",
                      "backdrop-blur-md",
                      "border-zinc-200/30 dark:border-zinc-700/40",
                      "hover:border-zinc-400/50 dark:hover:border-zinc-500/30",
                      "focus-within:!ring-2 focus-within:ring-zinc-500/30",
                      "group-data-[focused=true]:bg-white/60 dark:group-data-[focused=true]:bg-zinc-800/60",
                    ],
                  }}
                  isRequired
                />

                <div
                  className="h-px w-full bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent"
                  role="separator"
                />

                <div className="flex h-auto w-full items-center">
                  <small className="w-full rounded-md bg-zinc-200/50 p-3 text-sm italic text-zinc-600 backdrop-blur-sm dark:bg-zinc-800/50 dark:text-zinc-400">
                    Tip: Kamu juga bisa mencari berdasarkan nama dan npm untuk
                    mahasiswa dan dosen untuk jadwal
                  </small>
                </div>

                <CheckboxGroup
                  orientation="horizontal"
                  label="Pilih opsi yang ingin ditampilkan"
                  value={selectedOptions}
                  onValueChange={handleOptionsChange}
                  aria-label="Opsi pencarian"
                  classNames={{
                    label:
                      "text-zinc-600 font-medium dark:text-zinc-400 text-sm mb-1",
                    wrapper: "flex flex-wrap gap-4",
                  }}
                  isRequired
                >
                  <Checkbox
                    value="jadwal"
                    classNames={{
                      label: "text-zinc-700 dark:text-zinc-300",
                    }}
                    size="lg"
                  >
                    Jadwal Kelas
                  </Checkbox>
                  <Checkbox
                    value="kelasBaru"
                    isDisabled={selectedOptions.includes("mahasiswaBaru")}
                    classNames={{
                      label: "text-zinc-700 dark:text-zinc-300",
                    }}
                    size="lg"
                  >
                    Kelas Baru
                  </Checkbox>
                  <Checkbox
                    value="mahasiswaBaru"
                    isDisabled={selectedOptions.includes("kelasBaru")}
                    classNames={{
                      label: "text-zinc-700 dark:text-zinc-300",
                    }}
                    size="lg"
                  >
                    Mahasiswa Baru
                  </Checkbox>
                </CheckboxGroup>

                <Button
                  type="submit"
                  className="bg-zinc-800 font-medium text-white shadow-lg transition-all duration-200 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  isLoading={isLoading}
                  isDisabled={!kelas.trim() || selectedOptions.length === 0}
                  size="lg"
                >
                  {isLoading ? "Memuat Data..." : "Tampilkan Data"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </div>

      {showKelasData && (
        <section aria-label="Hasil Pencarian" className="mb-12 px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Hasil Pencarian
          </h2>
          <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-6">
            {selectedOptions.includes("jadwal") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
              >
                <Card className="h-full border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
                  <CardHeader className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                      Jadwal Kelas
                    </h3>
                  </CardHeader>
                  <CardBody className="p-4">
                    {jadwalError ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-red-500">
                          Failed to load jadwal data
                        </p>
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
                        <Spinner
                          color="default"
                          label="Memuat data jadwal..."
                        />
                      </div>
                    ) : jadwalData?.data?.jadwal ? (
                      <JadwalTable
                        jadwal={jadwalData.data.jadwal}
                        kelas={kelas}
                      />
                    ) : (
                      <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                        Tidak ada data jadwal ditemukan
                      </p>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {selectedOptions.includes("kelasBaru") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
              >
                <Card className="h-full border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
                  <CardHeader className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                      Kelas Baru
                    </h3>
                  </CardHeader>
                  <CardBody className="p-4">
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
                      <MahasiswaTable
                        data={kelasBaruData.data}
                        type="kelasBaru"
                      />
                    ) : (
                      <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                        Tidak ada data kelas baru ditemukan
                      </p>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {selectedOptions.includes("mahasiswaBaru") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-[calc(50%-12px)]" : ""} transition-all duration-300`}
              >
                <Card className="h-full border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
                  <CardHeader className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                      Mahasiswa Baru
                    </h3>
                  </CardHeader>
                  <CardBody className="p-4">
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
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* <section aria-label="Berita Terkini" className="mb-10">
        <NewsSection />
      </section> */}

      <section aria-label="Kalender Akademik" className="mb-12 px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Kalender Akademik
        </h2>
        <Card className="border border-zinc-200/20 bg-white/80 shadow-xl backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-800/80">
          <CardHeader className="border-b border-zinc-200/30 px-5 py-4 dark:border-zinc-700/30">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              Timeline Kegiatan
            </h3>
          </CardHeader>
          <CardBody className="overflow-visible p-0">
            {isEventsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner color="default" label="Memuat kalender akademik..." />
              </div>
            ) : eventsData ? (
              <div className="w-full overflow-visible p-4">
                <Timeline events={eventsData.data} />
              </div>
            ) : (
              <p className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                Tidak ada data kalender ditemukan
              </p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
