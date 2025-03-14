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
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <Card className="max-w-md">
          <CardBody>
            <h1 className="mb-4 text-xl font-bold text-red-500">Error</h1>
            <p>Failed to load calendar data. Please try again later.</p>
            <Button
              className="mt-4"
              color="primary"
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
    <div className="flex min-h-screen w-full flex-col p-4">
      <h1 className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 pt-0 text-4xl font-bold text-transparent sm:text-7xl">
        Cari jadwal dan daftar mahasiswa baru
      </h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <Input
              variant="faded"
              className="font-semibold"
              labelPlacement="outside"
              type="text"
              label="Masukkan yang ingin dicari"
              placeholder="Contoh: 2IA14"
              value={kelas}
              onChange={handleKelasChange}
              aria-label="Kelas atau nama pencarian"
              isRequired
            />

            <hr
              className="h-divider w-full shrink-0 border-none bg-divider"
              role="separator"
            />

            <div className="flex h-auto w-full items-center">
              <small className="text-default-500">
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
              isRequired
            >
              <Checkbox value="jadwal">Jadwal Kelas</Checkbox>
              <Checkbox
                value="kelasBaru"
                isDisabled={selectedOptions.includes("mahasiswaBaru")}
              >
                Kelas Baru
              </Checkbox>
              <Checkbox
                value="mahasiswaBaru"
                isDisabled={selectedOptions.includes("kelasBaru")}
              >
                Mahasiswa Baru
              </Checkbox>
            </CheckboxGroup>

            <Button
              type="submit"
              className="bg-black text-white dark:bg-white dark:text-black"
              isLoading={isLoading}
              isDisabled={!kelas.trim() || selectedOptions.length === 0}
            >
              {isLoading ? "Memuat Data..." : "Tampilkan Data"}
            </Button>
          </div>
        </Card>
      </form>

      {showKelasData && (
        <section aria-label="Hasil Pencarian" className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:gap-x-4">
            {selectedOptions.includes("jadwal") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
              >
                <Card className="h-full">
                  <CardHeader className="border-b border-divider px-6 py-4">
                    <h2 className="text-xl font-semibold">Jadwal Kelas</h2>
                  </CardHeader>
                  <CardBody>
                    {jadwalError ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-red-500">
                          Failed to load jadwal data
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
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
                      <p className="p-4 text-center text-gray-500">
                        Tidak ada data jadwal ditemukan
                      </p>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {selectedOptions.includes("kelasBaru") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
              >
                <Card className="h-full">
                  <CardHeader className="border-b border-divider px-6 py-4">
                    <h2 className="text-xl font-semibold">Kelas Baru</h2>
                  </CardHeader>
                  <CardBody>
                    {kelasBaruError ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-red-500">
                          Failed to load kelas baru data
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
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
                      <p className="p-4 text-center text-gray-500">
                        Tidak ada data kelas baru ditemukan
                      </p>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {selectedOptions.includes("mahasiswaBaru") && (
              <div
                className={`w-full ${selectedOptionsCount > 1 ? "md:w-1/2" : ""} transition-all duration-300`}
              >
                <Card className="h-full">
                  <CardHeader className="border-b border-divider px-6 py-4">
                    <h2 className="text-xl font-semibold">Mahasiswa Baru</h2>
                  </CardHeader>
                  <CardBody>
                    {mahasiswaBaruError ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-red-500">
                          Failed to load mahasiswa baru data
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
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
                      <p className="p-4 text-center text-gray-500">
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

      <section aria-label="Kalender Akademik" className="mb-10">
        <Card shadow="sm">
          <CardHeader className="border-b border-divider bg-white/60 px-6 py-4 dark:bg-zinc-800/50">
            <h2 className="text-xl font-semibold">
              Timeline Kalender Akademik
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {isEventsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Spinner color="default" label="Memuat kalender akademik..." />
              </div>
            ) : eventsData ? (
              <div className="w-full">
                <Timeline events={eventsData.data} />
              </div>
            ) : (
              <p className="p-4 text-center text-gray-500">
                Tidak ada data kalender ditemukan
              </p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
