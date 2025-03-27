// Event
export interface Event {
    kegiatan: string;
    tanggal: string;
    start: string;
    end: string;
}

export interface EventWithLane extends Event {
    laneIndex: number;
}

export interface ProcessedData {
    adjustedEvents: Event[];
    earliestStart: Date;
    latestEnd: Date;
    displayStartDate: Date;
    displayEndDate: Date;
    allDates: Date[];
    months: { [key: string]: Date[] };
    eventPositions: EventWithLane[];
    maxLaneIndex: number;
}

export interface Kalender {
    status: string;
    data: Event[];
}

// Jadwal
export interface Jadwal {
    nama: string;
    waktu: string;
    jam: string;
    ruang: string;
    dosen: string;
}

export interface JadwalHari {
    [key: string]: Jadwal[] | null;
}

export interface JadwalData {
    data: {
        jadwal: JadwalHari;
    };
}

// Mahasiswa
export interface MahasiswaBaru {
    no_pend: string;
    nama: string;
    npm: string;
    kelas: string;
    keterangan: string;
}

export interface KelasBaru {
    npm: string;
    nama: string;
    kelas_lama: string;
    kelas_baru: string;
}

export interface SearchFormProps {
    onSubmit: (kelas: string, selectedOptions: string[]) => void;
    isLoading: boolean;
}

export interface SearchResultsProps {
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

export type EventStatusCache = Map<
    string,
    {
        short: string;
        full: string;
        position: string;
        secondsLeft: number;
        timestamp: number;
    }
>;

// API endpoints
export const API_BASE_URL = "https://baak-api.vercel.app";
export const ENDPOINTS = {
    kalender: `${API_BASE_URL}/kalender`,
    jadwal: (kelas: string) => `${API_BASE_URL}/jadwal/${kelas}`,
    kelasBaru: (kelas: string) => `${API_BASE_URL}/kelasbaru/${kelas}`,
    mahasiswaBaru: (kelas: string) => `${API_BASE_URL}/mahasiswabaru/${kelas}`,
}; 